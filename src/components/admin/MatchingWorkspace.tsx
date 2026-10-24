import React, { useState } from 'react';
import { Application, Instructor, Match } from '../../types';
import { evaluateMatches, confirmLearnerInstructorMatch } from '../../services/matchingService';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface MatchingWorkspaceProps {
  applications: Application[];
  instructors: Instructor[];
  onMatchConfirmed: () => void;
  initialSelectedApp?: Application | null;
}

export const MatchingWorkspace: React.FC<MatchingWorkspaceProps> = ({
  applications,
  instructors,
  onMatchConfirmed,
  initialSelectedApp,
}) => {
  const { profile } = useAuth();
  // Filter learners who are either 'ready_for_matching', 'submitted', or 'under_review'
  const matchingPool = applications.filter(
    (a) => a.status === 'ready_for_matching' || a.status === 'under_review' || a.status === 'submitted'
  );

  const [selectedAppId, setSelectedAppId] = useState<string>(
    initialSelectedApp?.id || matchingPool[0]?.id || ''
  );

  const currentApp = applications.find((a) => a.id === selectedAppId);

  // Run explainable rule-based matching
  const recommendations = currentApp ? evaluateMatches(currentApp, instructors) : [];

  // Match confirmation modal state
  const [confirmingInst, setConfirmingInst] = useState<Instructor | null>(null);
  const [agreedSchedule, setAgreedSchedule] = useState('');
  const [classFormat, setClassFormat] = useState('');
  const [matchNotes, setMatchNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleStartMatch = (inst: Instructor) => {
    setConfirmingInst(inst);
    // Suggest default schedule based on overlap
    const overlap = currentApp?.availability?.timeSlots?.find((slot) =>
      inst.weeklyAvailability?.some((s) => s.toLowerCase().includes(slot.toLowerCase()))
    );
    setAgreedSchedule(overlap || inst.weeklyAvailability?.[0] || 'To be scheduled');
    setClassFormat(currentApp?.learningProfile?.preferredClassFormat || inst.preferredFormat);
    setMatchNotes(
      `Matched based on ${currentApp?.learningProfile?.selfAssessedLevel} level and schedule overlap.`
    );
  };

  const handleConfirmAssignment = async () => {
    if (!currentApp || !confirmingInst) return;

    try {
      setSaving(true);
      const adminName = profile?.displayName || 'Church Administrator';
      await confirmLearnerInstructorMatch(
        currentApp,
        confirmingInst,
        agreedSchedule,
        classFormat,
        matchNotes,
        adminName
      );

      setSuccessToast(
        `Successfully matched ${currentApp.applicant.givenName} with ${confirmingInst.name}!`
      );
      setConfirmingInst(null);
      onMatchConfirmed();
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Failed to save match assignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#333]">Student–Instructor Matching Workspace</h2>
            <span className="text-xs font-bold bg-[#E8F5E9] text-[#008C50] px-2.5 py-0.5 rounded-full">
              Explainable Rule-Based Algorithm
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Compare proficiency levels, class formats, weekly availability overlap, and instructor capacity with transparent scoring.
          </p>
        </div>

        {successToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Learner Selection & Profile */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777]">
                1. Select Learner to Match
              </h3>
              <span className="text-xs text-[#008C50] font-semibold">
                {matchingPool.length} available
              </span>
            </div>

            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-300 text-xs font-semibold text-[#333] bg-white outline-none focus:border-[#008C50]"
            >
              {matchingPool.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.referenceNumber} — {app.applicant.givenName} {app.applicant.familyName} (
                  {app.learningProfile.selfAssessedLevel}, {app.status})
                </option>
              ))}
            </select>

            {currentApp ? (
              <div className="bg-[#FAFBF9] border border-gray-200 rounded-xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#333]">
                    {currentApp.applicant.givenName} {currentApp.applicant.familyName}
                  </span>
                  <span className="font-bold text-[#008C50] bg-[#E8F5E9] px-2 py-0.5 rounded text-[11px]">
                    {currentApp.learningProfile.selfAssessedLevel}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 block text-[11px]">Personal Learning Goal:</span>
                  <p className="font-medium text-[#333] mt-0.5">
                    "{currentApp.learningProfile.personalLearningGoal}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-gray-500">Format:</span>{' '}
                    <span className="font-semibold text-[#333]">
                      {currentApp.learningProfile.preferredClassFormat}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Contact:</span>{' '}
                    <span className="text-[#333]">{currentApp.applicant.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Support Lang:</span>{' '}
                    <span className="text-[#333]">{currentApp.learningProfile.languageSupport || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Frequency:</span>{' '}
                    <span className="text-[#333]">{currentApp.availability.preferredFrequency}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-500 block text-[11px] mb-1">
                    Learner Available Times (KST):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentApp.availability.timeSlots?.map((slot) => (
                      <span
                        key={slot}
                        className="bg-white border border-gray-300 px-2 py-0.5 rounded text-[10px] font-medium text-[#333]"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-gray-400">
                No learners currently awaiting matching.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Candidate Instructors with Transparent Match Score */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-[#333]">
                  2. Compatible Candidate Instructors
                </h3>
                <p className="text-xs text-gray-500">
                  Ranked by objective criteria overlap (Level, Format, Schedule, Capacity)
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {recommendations.length} instructors evaluated
              </span>
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec) => {
                  const inst = rec.instructor;
                  const isHighMatch = rec.score >= 70;
                  return (
                    <div
                      key={inst.id}
                      className={`p-5 rounded-xl border transition-all text-xs ${
                        isHighMatch
                          ? 'border-[#008C50] bg-white shadow-xs ring-1 ring-[#008C50]/20'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#333]">{inst.name}</h4>
                            <span className="text-[10px] text-gray-500">
                              ({inst.experienceYears} yrs teaching)
                            </span>
                            {inst.isDemo && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-mono font-bold">
                                DEMO
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Format: {inst.preferredFormat} · Locations: {inst.locations?.join(', ')}
                          </p>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                              rec.score >= 80
                                ? 'bg-[#E8F5E9] text-[#008C50]'
                                : rec.score >= 50
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {rec.score}% Match
                          </span>
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            {inst.currentStudentsCount}/{inst.maxCapacity} slots filled
                          </span>
                        </div>
                      </div>

                      {/* Transparent reasons pill list */}
                      <div className="space-y-1 mb-4 bg-[#FAFBF9] p-3 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                          Algorithm Compatibility Breakdown:
                        </span>
                        <ul className="space-y-1 text-[11px]">
                          {rec.reasons.map((r, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-gray-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#008C50]"></span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Instructor Availability */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-[11px] text-gray-500">
                          <span className="font-semibold text-gray-700">Available: </span>
                          <span>{inst.weeklyAvailability?.join(', ')}</span>
                        </div>

                        <button
                          onClick={() => handleStartMatch(inst)}
                          disabled={!rec.hasCapacity}
                          className="bg-[#008C50] hover:bg-[#007340] text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-2xs flex items-center gap-1.5 disabled:opacity-40"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Assign Instructor</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-gray-400">
                Select an applicant to view matching candidates.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmingInst && currentApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#333]">Confirm Instructor Match</h3>
              <button
                onClick={() => setConfirmingInst(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAFBF9] border border-gray-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Learner:</span>
                <span className="font-bold text-[#333]">
                  {currentApp.applicant.givenName} {currentApp.applicant.familyName} (
                  {currentApp.learningProfile.selfAssessedLevel})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Assigned Instructor:</span>
                <span className="font-bold text-[#008C50]">{confirmingInst.name}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Agreed Weekly Lesson Schedule (KST) *
                </label>
                <input
                  type="text"
                  value={agreedSchedule}
                  onChange={(e) => setAgreedSchedule(e.target.value)}
                  placeholder="e.g. Tuesdays 18:00–20:00 KST"
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Class Format *</label>
                <input
                  type="text"
                  value={classFormat}
                  onChange={(e) => setClassFormat(e.target.value)}
                  placeholder="e.g. In person (Church Annex) or Online Zoom"
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Administrative Match Notes & Arrangements
                </label>
                <textarea
                  rows={3}
                  value={matchNotes}
                  onChange={(e) => setMatchNotes(e.target.value)}
                  placeholder="Notes regarding curriculum, meeting arrangement, orientation..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setConfirmingInst(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                disabled={saving}
                className="bg-[#008C50] hover:bg-[#007340] text-white px-6 py-2 rounded-lg font-bold shadow-xs disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
