import { collection, doc, getDocs, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Application, Instructor, CommitteeFeedback, Match } from '../types';

export const DEMO_APPLICANTS: Application[] = [
  {
    id: 'demo_app_avery',
    referenceNumber: 'SAMPLE-EL-2026-0042',
    formVersionId: 'template_v1_everlove',
    isDemo: true,
    status: 'submitted',
    applicant: {
      givenName: 'Avery',
      familyName: 'Example',
      preferredName: 'Avery',
      dateOfBirth: '1997-04-18',
      email: 'avery.learner@example.com',
      phone: '+82 10-1234-5678',
      preferredContactMethod: 'Email',
      contactLanguage: 'English',
      countryOfResidence: 'South Korea',
      cityRegion: 'Seoul',
      districtArea: 'Mapo-gu (fictional)',
      arrivalInKorea: '2025-09-01',
      currentBackground: 'International student',
      primaryLanguage: 'English',
    },
    learningProfile: {
      studiedBefore: true,
      studyDuration: 'Less than 6 months',
      previousLearningMethod: 'Self-study (apps & books)',
      selfAssessedLevel: 'Beginner',
      readingHangulComfort: 'Slowly, with help',
      speakingConfidence: 'Greetings & short phrases',
      reasonsForLearning: ['Daily life', 'Community conversation'],
      personalLearningGoal: 'Order a meal, ask for directions, and introduce myself with confidence.',
      skillsToFocusOn: ['Speaking', 'Listening'],
      preferredClassFormat: 'No preference',
      languageSupport: 'English explanations',
      independentPracticeHours: '2–3 hours per week',
      preferredClassSize: 'One-on-one private lessons',
    },
    availability: {
      preferredStartDate: '2026-11-09',
      preferredFrequency: 'Once per week',
      timeSlots: ['Tue 18:00–20:00', 'Thu 18:00–20:00', 'Sat 10:00–12:00'],
      instructorPreference: 'No preference',
      instructorNotes: 'Comfortable with any available instructor.',
    },
    consents: {
      applicationProcessing: true,
      accuracyDeclaration: true,
      programUpdates: false,
      consentedAt: '2026-10-20T10:15:00Z',
    },
    additionalNotes: 'Please share lesson vocabulary in advance.',
    accessibilitySupport: 'Written instructions are helpful.',
    howYouFoundUs: 'Program welcome page',
    internalNotes: 'Applicant is very motivated. Good candidate for beginner evening classes.',
    history: [
      {
        timestamp: '2026-10-20T10:15:00Z',
        action: 'Application Submitted',
        actorName: 'Avery Example',
        note: 'Submitted via online portal',
      },
    ],
    createdAt: '2026-10-20T10:15:00Z',
    updatedAt: '2026-10-20T10:15:00Z',
  },
  {
    id: 'demo_app_carlos',
    referenceNumber: 'SAMPLE-EL-2026-0043',
    formVersionId: 'template_v1_everlove',
    isDemo: true,
    status: 'under_review',
    applicant: {
      givenName: 'Carlos',
      familyName: 'Gomez',
      preferredName: 'Carlos',
      dateOfBirth: '1992-08-14',
      email: 'carlos.gomez@example.com',
      phone: '+82 10-8765-4321',
      preferredContactMethod: 'Email',
      contactLanguage: 'English',
      countryOfResidence: 'South Korea',
      cityRegion: 'Daejeon',
      districtArea: 'Yuseong-gu',
      arrivalInKorea: '2024-03-10',
      currentBackground: 'Researcher or professor',
      primaryLanguage: 'Spanish (speaks English)',
    },
    learningProfile: {
      studiedBefore: true,
      studyDuration: '1–3 years',
      previousLearningMethod: 'University course',
      selfAssessedLevel: 'Intermediate',
      readingHangulComfort: 'Comfortably',
      speakingConfidence: 'Can manage daily conversation',
      reasonsForLearning: ['Workplace communication and business Korean', 'Understanding Korean culture'],
      personalLearningGoal: 'Discuss research and collaborate smoothly with Korean laboratory colleagues.',
      skillsToFocusOn: ['Speaking', 'Reading'],
      preferredClassFormat: 'In person',
      preferredLocation: 'KAIST campus or Yuseong-gu',
      languageSupport: 'English explanations',
      independentPracticeHours: '3–4 hours per week',
    },
    availability: {
      preferredStartDate: '2026-11-15',
      preferredFrequency: 'Twice a week',
      timeSlots: ['Tue 18:00–20:00', 'Thu 18:00–20:00'],
      instructorPreference: 'Experience with academic/research Korean is helpful.',
    },
    consents: {
      applicationProcessing: true,
      accuracyDeclaration: true,
      programUpdates: true,
      consentedAt: '2026-10-21T09:30:00Z',
    },
    internalNotes: 'Reviewed by Joy Choi: Strong intermediate learner. Matches David Lee on campus.',
    history: [
      {
        timestamp: '2026-10-21T09:30:00Z',
        action: 'Application Submitted',
        actorName: 'Carlos Gomez',
      },
      {
        timestamp: '2026-10-22T14:00:00Z',
        action: 'Status changed to UNDER REVIEW',
        actorName: 'Joy Jieun Choi',
        note: 'Checking instructor availability in Yuseong-gu area',
      },
    ],
    createdAt: '2026-10-21T09:30:00Z',
    updatedAt: '2026-10-22T14:00:00Z',
  },
  {
    id: 'demo_app_linh',
    referenceNumber: 'SAMPLE-EL-2026-0044',
    formVersionId: 'template_v1_everlove',
    isDemo: true,
    status: 'ready_for_matching',
    applicant: {
      givenName: 'Linh',
      familyName: 'Nguyen',
      preferredName: 'Linh',
      dateOfBirth: '2001-11-05',
      email: 'linh.nguyen@example.com',
      phone: '+82 10-5555-1234',
      preferredContactMethod: 'Email',
      contactLanguage: 'English',
      countryOfResidence: 'South Korea',
      cityRegion: 'Daejeon',
      districtArea: 'Seo-gu',
      arrivalInKorea: '2025-02-20',
      currentBackground: 'Undergraduate student',
      primaryLanguage: 'Vietnamese',
    },
    learningProfile: {
      studiedBefore: true,
      studyDuration: '6 months to less than 1 year',
      previousLearningMethod: 'Language institute',
      selfAssessedLevel: 'Elementary',
      readingHangulComfort: 'Comfortably',
      speakingConfidence: 'Simple everyday sentences',
      reasonsForLearning: ['Preparing for TOPIK or other Korean language exams', 'Adapting to life in Korea'],
      personalLearningGoal: 'Pass TOPIK Level 3 and participate in church community activities.',
      skillsToFocusOn: ['Grammar', 'Listening'],
      preferredClassFormat: 'Online',
      languageSupport: 'English explanations',
      independentPracticeHours: '4–5 hours per week',
    },
    availability: {
      preferredStartDate: '2026-11-10',
      preferredFrequency: 'Twice a week',
      timeSlots: ['Mon 14:00–16:00', 'Wed 14:00–16:00', 'Sat 10:00–12:00'],
    },
    consents: {
      applicationProcessing: true,
      accuracyDeclaration: true,
      programUpdates: true,
      consentedAt: '2026-10-22T11:00:00Z',
    },
    internalNotes: 'Ready for assignment. Grace Kim matches her TOPIK goal and online format.',
    history: [
      {
        timestamp: '2026-10-22T11:00:00Z',
        action: 'Application Submitted',
        actorName: 'Linh Nguyen',
      },
      {
        timestamp: '2026-10-23T10:00:00Z',
        action: 'Status changed to READY FOR MATCHING',
        actorName: 'Joy Jieun Choi',
        note: 'Pre-screened, target instructor: Grace Kim',
      },
    ],
    createdAt: '2026-10-22T11:00:00Z',
    updatedAt: '2026-10-23T10:00:00Z',
  },
  {
    id: 'demo_app_sarah',
    referenceNumber: 'SAMPLE-EL-2026-0045',
    formVersionId: 'template_v1_everlove',
    isDemo: true,
    status: 'matched',
    assignedInstructorId: 'demo_inst_minho',
    assignedInstructorName: 'Pastor Minho Park',
    matchedAt: '2026-10-24T08:00:00Z',
    matchNotes: 'Class arranged for Saturdays 10:00 AM at church annex.',
    applicant: {
      givenName: 'Sarah',
      familyName: 'Jenkins',
      preferredName: 'Sarah',
      dateOfBirth: '1988-06-25',
      email: 'sarah.jenkins@example.com',
      phone: '+82 10-9999-8888',
      preferredContactMethod: 'Email',
      contactLanguage: 'English',
      countryOfResidence: 'South Korea',
      cityRegion: 'Daejeon',
      currentBackground: 'Employee',
      primaryLanguage: 'English',
    },
    learningProfile: {
      studiedBefore: false,
      studyDuration: 'Complete beginner',
      selfAssessedLevel: 'Beginner',
      readingHangulComfort: 'Not yet',
      speakingConfidence: 'Just greetings',
      reasonsForLearning: ['Learning Korean for religious or faith-related purposes', 'Adapting to life in Korea'],
      personalLearningGoal: 'Sing Korean worship songs and follow simple church announcements.',
      skillsToFocusOn: ['Speaking', 'Reading'],
      preferredClassFormat: 'In person',
      independentPracticeHours: '2 hours per week',
    },
    availability: {
      preferredStartDate: '2026-11-01',
      preferredFrequency: 'Once a week',
      timeSlots: ['Sat 10:00–12:00'],
    },
    consents: {
      applicationProcessing: true,
      accuracyDeclaration: true,
      programUpdates: true,
      consentedAt: '2026-10-18T16:00:00Z',
    },
    history: [
      {
        timestamp: '2026-10-18T16:00:00Z',
        action: 'Application Submitted',
        actorName: 'Sarah Jenkins',
      },
      {
        timestamp: '2026-10-24T08:00:00Z',
        action: 'Matched with instructor: Pastor Minho Park',
        actorName: 'Joy Jieun Choi',
        note: 'Saturday morning beginner class',
      },
    ],
    createdAt: '2026-10-18T16:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'demo_app_kenji',
    referenceNumber: 'SAMPLE-EL-2026-0046',
    formVersionId: 'template_v1_everlove',
    isDemo: true,
    status: 'information_required',
    applicant: {
      givenName: 'Kenji',
      familyName: 'Sato',
      preferredName: 'Kenji',
      dateOfBirth: '1995-02-12',
      email: 'kenji.sato@example.com',
      phone: '+82 10-3333-7777',
      preferredContactMethod: 'Phone',
      contactLanguage: 'English',
      countryOfResidence: 'South Korea',
      cityRegion: 'Daejeon',
      currentBackground: 'Business owner or self-employed',
      primaryLanguage: 'Japanese (speaks English)',
    },
    learningProfile: {
      studiedBefore: true,
      studyDuration: '6 months to less than 1 year',
      selfAssessedLevel: 'Elementary',
      readingHangulComfort: 'Comfortably',
      speakingConfidence: 'Short phrases',
      reasonsForLearning: ['Workplace communication and business Korean'],
      personalLearningGoal: 'Negotiate with suppliers and handle day-to-day business calls in Korean.',
      skillsToFocusOn: ['Speaking', 'Listening'],
      preferredClassFormat: 'Online',
      independentPracticeHours: '3 hours per week',
    },
    availability: {
      preferredStartDate: '2026-11-20',
      preferredFrequency: 'Once a week',
      timeSlots: ['Sun 14:00–16:00'],
    },
    consents: {
      applicationProcessing: true,
      accuracyDeclaration: true,
      programUpdates: false,
      consentedAt: '2026-10-23T15:20:00Z',
    },
    internalNotes: 'Sunday afternoon has limited instructor availability. Need to ask learner if weekday evening is possible.',
    history: [
      {
        timestamp: '2026-10-23T15:20:00Z',
        action: 'Application Submitted',
        actorName: 'Kenji Sato',
      },
      {
        timestamp: '2026-10-24T09:00:00Z',
        action: 'Status changed to INFORMATION REQUIRED',
        actorName: 'Joy Jieun Choi',
        note: 'Contacted applicant regarding weekday evening availability',
      },
    ],
    createdAt: '2026-10-23T15:20:00Z',
    updatedAt: '2026-10-24T09:00:00Z',
  },
];

export const DEMO_INSTRUCTORS: Instructor[] = [
  {
    id: 'demo_inst_minho',
    name: 'Pastor Minho Park',
    email: 'minho.park@everlove.kr',
    phone: '+82 10-2001-3001',
    active: true,
    experienceYears: 8,
    supportedLevels: ['Beginner', 'Elementary'],
    preferredTopics: ['Everyday conversation', 'Korean culture and daily life', 'Faith & biblical Korean'],
    languageSupport: ['English', 'Korean'],
    preferredFormat: 'in_person',
    locations: ['Everlove Church Annex (Daejeon)', 'Yuseong-gu'],
    weeklyAvailability: ['Sat 10:00–12:00', 'Tue 18:00–20:00'],
    maxCapacity: 4,
    currentStudentsCount: 2,
    notes: 'Warm, patient teacher for first-time learners. Focuses on Hangul and everyday phrases.',
    isDemo: true,
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'demo_inst_grace',
    name: 'Grace Kim',
    email: 'grace.kim@everlove.kr',
    phone: '+82 10-2002-3002',
    active: true,
    experienceYears: 6,
    supportedLevels: ['Elementary', 'Intermediate'],
    preferredTopics: ['TOPIK preparation', 'Grammar and sentence construction', 'Writing practice'],
    languageSupport: ['English', 'Korean'],
    preferredFormat: 'online',
    locations: ['Online Zoom'],
    weeklyAvailability: ['Mon 14:00–16:00', 'Wed 14:00–16:00', 'Thu 18:00–20:00'],
    maxCapacity: 5,
    currentStudentsCount: 1,
    notes: 'Certified Korean language instructor (Level 2). Structured grammar drills and exam preparation.',
    isDemo: true,
    createdAt: '2026-10-02T00:00:00Z',
  },
  {
    id: 'demo_inst_david',
    name: 'David Lee',
    email: 'david.lee@everlove.kr',
    phone: '+82 10-2003-3003',
    active: true,
    experienceYears: 4,
    supportedLevels: ['Beginner', 'Elementary', 'Intermediate'],
    preferredTopics: ['Free conversation', 'Workplace & academic Korean', 'Shopping & public offices'],
    languageSupport: ['English', 'Spanish', 'Korean'],
    preferredFormat: 'hybrid',
    locations: ['KAIST campus', 'Yuseong-gu', 'Online'],
    weeklyAvailability: ['Tue 18:00–20:00', 'Thu 18:00–20:00', 'Fri 18:00–20:00'],
    maxCapacity: 5,
    currentStudentsCount: 2,
    notes: 'Graduate student in education. Very popular with university international researchers.',
    isDemo: true,
    createdAt: '2026-10-03T00:00:00Z',
  },
  {
    id: 'demo_inst_jiyoung',
    name: 'Jiyoung Choi',
    email: 'jiyoung.choi@everlove.kr',
    phone: '+82 10-2004-3004',
    active: true,
    experienceYears: 5,
    supportedLevels: ['Beginner'],
    preferredTopics: ['Hangul basics', 'Pronunciation and conversation practice', 'Textbook-based learning'],
    languageSupport: ['English', 'Korean'],
    preferredFormat: 'in_person',
    locations: ['Everlove Church Education Building'],
    weeklyAvailability: ['Sat 10:00–12:00', 'Sun 14:00–16:00'],
    maxCapacity: 3,
    currentStudentsCount: 1,
    notes: 'Dedicated volunteer instructor with specialized focus on pronunciation coaching.',
    isDemo: true,
    createdAt: '2026-10-04T00:00:00Z',
  },
];

export const DEMO_COMMITTEE_FEEDBACK: CommitteeFeedback[] = [
  {
    id: 'demo_fb_1',
    reviewerName: 'Joy Jieun Choi (Committee Leader)',
    screenOrFeature: 'Learner Application Form (Module C)',
    status: 'approved',
    comment:
      'The 6-step flow is much easier for foreign students to fill out on mobile compared to our 36-question paper form. The KST availability grid is especially clear.',
    timestamp: '2026-10-22T16:30:00Z',
    isDemo: true,
  },
  {
    id: 'demo_fb_2',
    reviewerName: 'Pastor Kim (Everlove Church)',
    screenOrFeature: 'Privacy & Data Notice (Section 06)',
    status: 'requires_changes',
    comment:
      'Ensure the provisional privacy notice clearly notes that data is retained only for current class matching and deleted after 1 year unless renewed.',
    timestamp: '2026-10-23T11:15:00Z',
    isDemo: true,
  },
  {
    id: 'demo_fb_3',
    reviewerName: 'Elder Park (Finance & Facilities)',
    screenOrFeature: 'Class Fees and Location Announcements',
    status: 'deferred',
    comment:
      'Keep the fees and venue marked as "To be confirmed" until the church session meeting approves room assignments for 2027.',
    timestamp: '2026-10-24T08:30:00Z',
    isDemo: true,
  },
];

export async function seedDemoData(): Promise<{ applicantsCount: number; instructorsCount: number }> {
  // 1. Seed applicants
  for (const app of DEMO_APPLICANTS) {
    await setDoc(doc(db, 'applications', app.id), app);
  }

  // 2. Seed instructors
  for (const inst of DEMO_INSTRUCTORS) {
    await setDoc(doc(db, 'instructors', inst.id), inst);
  }

  // 3. Seed committee reviews
  for (const fb of DEMO_COMMITTEE_FEEDBACK) {
    await setDoc(doc(db, 'committeeFeedback', fb.id), fb);
  }

  // 4. Seed 1 active match
  const demoMatch: Match = {
    id: 'demo_match_1',
    applicationId: 'demo_app_sarah',
    instructorId: 'demo_inst_minho',
    learnerName: 'Sarah Jenkins',
    instructorName: 'Pastor Minho Park',
    status: 'active',
    schedule: 'Saturdays 10:00–12:00 KST',
    format: 'In person (Church Annex)',
    notes: 'Beginner worship Korean class. Confirmed by Joy Choi.',
    matchedBy: 'Joy Jieun Choi',
    matchedAt: '2026-10-24T08:00:00Z',
    isDemo: true,
  };
  await setDoc(doc(db, 'matches', demoMatch.id), demoMatch);

  return {
    applicantsCount: DEMO_APPLICANTS.length,
    instructorsCount: DEMO_INSTRUCTORS.length,
  };
}

export async function clearDemoData(): Promise<number> {
  let deletedCount = 0;

  // Clear demo applications
  const appSnap = await getDocs(collection(db, 'applications'));
  for (const d of appSnap.docs) {
    const data = d.data() as Application;
    if (data.isDemo || d.id.startsWith('demo_')) {
      await deleteDoc(d.ref);
      deletedCount++;
    }
  }

  // Clear demo instructors
  const instSnap = await getDocs(collection(db, 'instructors'));
  for (const d of instSnap.docs) {
    const data = d.data() as Instructor;
    if (data.isDemo || d.id.startsWith('demo_')) {
      await deleteDoc(d.ref);
      deletedCount++;
    }
  }

  // Clear demo matches
  const matchSnap = await getDocs(collection(db, 'matches'));
  for (const d of matchSnap.docs) {
    const data = d.data() as Match;
    if (data.isDemo || d.id.startsWith('demo_')) {
      await deleteDoc(d.ref);
      deletedCount++;
    }
  }

  // Clear demo committee reviews
  const fbSnap = await getDocs(collection(db, 'committeeFeedback'));
  for (const d of fbSnap.docs) {
    const data = d.data() as CommitteeFeedback;
    if (data.isDemo || d.id.startsWith('demo_')) {
      await deleteDoc(d.ref);
      deletedCount++;
    }
  }

  return deletedCount;
}
