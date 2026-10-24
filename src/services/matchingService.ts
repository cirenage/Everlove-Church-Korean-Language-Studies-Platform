import { doc, setDoc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Application, Instructor, Match } from '../types';

export interface MatchRecommendation {
  instructor: Instructor;
  score: number; // 0 to 100
  reasons: string[];
  levelMatch: boolean;
  formatMatch: boolean;
  scheduleOverlap: string[];
  languageSupportMatch: boolean;
  hasCapacity: boolean;
}

export function evaluateMatches(
  application: Application,
  instructors: Instructor[]
): MatchRecommendation[] {
  const activeInstructors = instructors.filter((inst) => inst.active);
  const learnerLevel = application.learningProfile.selfAssessedLevel;
  const learnerFormat = application.learningProfile.preferredClassFormat;
  const learnerSlots = application.availability.timeSlots || [];
  const learnerLangSupport = application.learningProfile.languageSupport;

  const results: MatchRecommendation[] = activeInstructors.map((inst) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Level compatibility (35 points)
    const levelMatch = inst.supportedLevels.includes(learnerLevel);
    if (levelMatch) {
      score += 35;
      reasons.push(`Supports ${learnerLevel} level`);
    } else {
      reasons.push(`Primary focus is ${inst.supportedLevels.join(', ')}`);
    }

    // 2. Format compatibility (20 points)
    let formatMatch = false;
    if (
      learnerFormat === 'No preference' ||
      inst.preferredFormat === 'any' ||
      (learnerFormat === 'In person' && (inst.preferredFormat === 'in_person' || inst.preferredFormat === 'hybrid')) ||
      (learnerFormat === 'Online' && (inst.preferredFormat === 'online' || inst.preferredFormat === 'hybrid')) ||
      (learnerFormat === 'Hybrid' && inst.preferredFormat === 'hybrid')
    ) {
      formatMatch = true;
      score += 20;
      reasons.push(`Compatible format (${learnerFormat} / ${inst.preferredFormat})`);
    }

    // 3. Weekly schedule overlap (up to 30 points)
    const sharedSlots = learnerSlots.filter((slot) =>
      inst.weeklyAvailability.some(
        (instSlot) =>
          instSlot.toLowerCase().includes(slot.toLowerCase()) ||
          slot.toLowerCase().includes(instSlot.toLowerCase())
      )
    );

    if (sharedSlots.length > 0) {
      const schedulePoints = Math.min(30, sharedSlots.length * 15);
      score += schedulePoints;
      reasons.push(`Shares ${sharedSlots.length} preferred time slot(s): ${sharedSlots.join(', ')}`);
    } else if (learnerSlots.length === 0) {
      score += 10;
      reasons.push('Learner schedule is flexible');
    }

    // 4. Language explanation support (10 points)
    let languageSupportMatch = false;
    if (learnerLangSupport) {
      const neededLang = learnerLangSupport.toLowerCase();
      if (inst.languageSupport.some((l) => neededLang.includes(l.toLowerCase()))) {
        languageSupportMatch = true;
        score += 10;
        reasons.push(`Provides ${learnerLangSupport} language support`);
      }
    } else {
      score += 5;
    }

    // 5. Capacity check (5 points)
    const hasCapacity = inst.currentStudentsCount < inst.maxCapacity;
    if (hasCapacity) {
      score += 5;
      reasons.push(`Open slot available (${inst.currentStudentsCount}/${inst.maxCapacity} students)`);
    } else {
      reasons.push(`Currently at full capacity (${inst.currentStudentsCount}/${inst.maxCapacity})`);
    }

    return {
      instructor: inst,
      score: Math.min(100, score),
      reasons,
      levelMatch,
      formatMatch,
      scheduleOverlap: sharedSlots,
      languageSupportMatch,
      hasCapacity,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

export async function confirmLearnerInstructorMatch(
  application: Application,
  instructor: Instructor,
  agreedSchedule: string,
  classFormat: string,
  matchNotes: string,
  adminName: string
): Promise<Match> {
  const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const matchRecord: Match = {
    id: matchId,
    applicationId: application.id,
    instructorId: instructor.id,
    learnerName: `${application.applicant.givenName} ${application.applicant.familyName}`,
    instructorName: instructor.name,
    status: 'active',
    schedule: agreedSchedule,
    format: classFormat,
    notes: matchNotes,
    matchedBy: adminName,
    matchedAt: now,
    isDemo: application.isDemo,
  };

  try {
    // 1. Save match record
    await setDoc(doc(db, 'matches', matchId), matchRecord);

    // 2. Update Application status and assignment
    const appDocRef = doc(db, 'applications', application.id);
    const newHistoryEvent = {
      timestamp: now,
      action: `Matched with instructor: ${instructor.name}`,
      actorName: adminName,
      note: `Schedule: ${agreedSchedule} | Notes: ${matchNotes}`,
    };

    await updateDoc(appDocRef, {
      status: 'matched',
      assignedInstructorId: instructor.id,
      assignedInstructorName: instructor.name,
      matchNotes,
      matchedAt: now,
      updatedAt: now,
      history: [...(application.history || []), newHistoryEvent],
    });

    // 3. Update Instructor capacity
    const instDocRef = doc(db, 'instructors', instructor.id);
    await updateDoc(instDocRef, {
      currentStudentsCount: (instructor.currentStudentsCount || 0) + 1,
    });

    return matchRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `matches/${matchId}`);
    return matchRecord;
  }
}

export async function getAllMatches(): Promise<Match[]> {
  try {
    const snap = await getDocs(collection(db, 'matches'));
    return snap.docs.map((d) => d.data() as Match);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}
