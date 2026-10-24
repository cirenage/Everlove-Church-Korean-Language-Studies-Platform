import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../../types';
import { updateApplicationStatus, updateApplicationNotes } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  FileText,
  X,
  History,
} from 'lucide-react';

interface ApplicationManagementProps {
  applications: Application[];
  selectedApp: Application | null;
  onSelectApplication: (app: Application | null) => void;
  onProceedToMatching: (app: Application) => void;
  onRefresh: () => void;
}

export const ApplicationManagement: React.FC<ApplicationManagementProps> = ({
  applications,
  selectedApp,
  onSelectApplication,
  onProceedToMatching,
  onRefresh,
}) => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  // Modal editing state
  const [internalNotes, setInternalNotes] = useState(selectedApp?.internalNotes || '');
  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  const filteredApps = applications.filter((app) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${app.applicant.givenName} ${app.applicant.familyName}`.toLowerCase();
    const email = app.applicant.email.toLowerCase();
    const ref = app.referenceNumber.toLowerCase();

    const matchesSearch = fullName.includes(term) || email.includes(term) || ref.includes(term);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesLevel =
      levelFilter === 'all' || app.learningProfile.selfAssessedLevel === levelFilter;
    const matchesFormat =
      formatFilter === 'all' || app.learningProfile.preferredClassFormat === formatFilter;

    return matchesSearch && matchesStatus && matchesLevel && matchesFormat;
  });

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    const actor = profile?.displayName || 'Church Administrator';
    await updateApplicationStatus(appId, newStatus, actor, statusChangeNote || undefined);
    setStatusChangeNote('');
    onRefresh();
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setSavingNotes(true);
    const actor = profile?.displayName || 'Church Administrator';
    await updateApplicationNotes(selectedApp.id, internalNotes, actor);
    setSavingNotes(false);
    onRefresh();
  };

  const exportApplicationsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredApps, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `everlove_applications_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#333]">Application Records</h2>
            <p className="text-xs text-gray-500">
              Showing {filteredApps.length} of {applications.length} submitted applications
            </p>
          </div>

          <button
            onClick={exportApplicationsJson}
            className="text-xs font-semibold text-[#008C50] bg-[#E8F5E9] hover:bg-[#d5ecd8] px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Authorized Report (JSON)</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, reference..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="information_required">Information Required</option>
              <option value="ready_for_matching">Ready for Matching</option>
              <option value="matched">Matched</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
            >
              <option value="all">All Korean Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Elementary">Elementary</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
            >
              <option value="all">All Formats</option>
              <option value="In person">In person</option>
              <option value="Online">Online</option>
              <option value="No preference">No preference</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {filteredApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[#666] font-semibold">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Residence & BG</th>
                  <th className="py-3 px-4">Level & Goals</th>
                  <th className="py-3 px-4">Schedule (KST)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#008C50]">
                      <div>{app.referenceNumber}</div>
                      {app.isDemo && (
                        <span className="inline-block mt-0.5 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-sans font-bold">
                          DEMO
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#333]">
                        {app.applicant.givenName} {app.applicant.familyName}
                      </div>
                      <div className="text-[11px] text-gray-500">{app.applicant.email}</div>
                      {app.applicant.phone && (
                        <div className="text-[10px] text-gray-400">{app.applicant.phone}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      <div>
                        {app.applicant.cityRegion}, {app.applicant.countryOfResidence}
                      </div>
                      <div className="text-[11px] text-gray-400">{app.applicant.currentBackground}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#008C50] bg-[#E8F5E9] px-2 py-0.5 rounded text-[11px]">
                        {app.learningProfile.selfAssessedLevel}
                      </span>
                      <p className="text-[11px] text-gray-600 mt-1 line-clamp-1 max-w-[200px]">
                        {app.learningProfile.personalLearningGoal}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      <div className="font-medium text-[#444]">
                        {app.learningProfile.preferredClassFormat}
                      </div>
                      <div className="text-[10px] text-gray-500 line-clamp-1 max-w-[150px]">
                        {app.availability.timeSlots?.slice(0, 2).join('; ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border outline-none cursor-pointer ${
                          app.status === 'submitted'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : app.status === 'under_review'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : app.status === 'ready_for_matching'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : app.status === 'matched'
                            ? 'bg-green-100 text-green-900 border-green-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="information_required">Info Required</option>
                        <option value="ready_for_matching">Ready Match</option>
                        <option value="matched">Matched</option>
                        <option value="waitlisted">Waitlisted</option>
                        <option value="withdrawn">Withdrawn</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          onSelectApplication(app);
                          setInternalNotes(app.internalNotes || '');
                        }}
                        className="text-xs font-semibold text-[#008C50] hover:underline"
                      >
                        Inspect
                      </button>

                      {app.status === 'ready_for_matching' && (
                        <button
                          onClick={() => onProceedToMatching(app)}
                          className="text-xs font-bold bg-[#008C50] hover:bg-[#007340] text-white px-2.5 py-1 rounded shadow-2xs"
                        >
                          Match
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-gray-500">
            No applications match your filter criteria.
          </div>
        )}
      </div>

      {/* Inspect Application Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#008C50]">
                    {selectedApp.referenceNumber}
                  </span>
                  {selectedApp.isDemo && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      DEMO APPLICATION
                    </span>
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-gray-100 text-gray-800">
                    {selectedApp.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#333] mt-1">
                  {selectedApp.applicant.givenName} {selectedApp.applicant.familyName}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onProceedToMatching(selectedApp)}
                  className="bg-[#008C50] hover:bg-[#007340] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <span>Open in Matching Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSelectApplication(null)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Tabs */}
            <div className="p-6 space-y-6">
              <div className="flex border-b border-gray-200 text-xs font-semibold gap-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-[#008C50] text-[#008C50]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Full Application Responses
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-2.5 border-b-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-[#008C50] text-[#008C50]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Audit History & Status Logs ({selectedApp.history?.length || 0})
                </button>
              </div>

              {activeTab === 'details' ? (
                <div className="space-y-6 text-xs">
                  {/* Section 1 & 2: Personal & Residence */}
                  <div className="bg-[#FAFBF9] border border-gray-200 rounded-xl p-5 space-y-3">
                    <h4 className="font-bold text-sm text-[#333]">Personal & Residence Information</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <span className="text-gray-500 block">Email</span>
                        <span className="font-semibold text-[#333]">{selectedApp.applicant.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Phone</span>
                        <span className="font-medium text-[#333]">{selectedApp.applicant.phone || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Date of birth</span>
                        <span className="font-medium text-[#333]">{selectedApp.applicant.dateOfBirth || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Contact Language</span>
                        <span className="font-medium text-[#333]">{selectedApp.applicant.contactLanguage}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Country</span>
                        <span className="font-medium text-[#333]">{selectedApp.applicant.countryOfResidence}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">City/Region</span>
                        <span className="font-medium text-[#333]">{selectedApp.applicant.cityRegion}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">District</span>
                        <span className="font-medium text-[#333]">{selectedApp.applicant.districtArea || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Arrival in Korea</span>
                        <span className="font-medium text-[#333]">{selectedApp.applicant.arrivalInKorea || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Korean Experience */}
                  <div className="bg-[#FAFBF9] border border-gray-200 rounded-xl p-5 space-y-3">
                    <h4 className="font-bold text-sm text-[#333]">Korean Experience & Proficiency</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <span className="text-gray-500 block">Self-Assessed Level</span>
                        <span className="font-bold text-sm text-[#008C50]">
                          {selectedApp.learningProfile.selfAssessedLevel}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Studied Before?</span>
                        <span className="font-medium text-[#333]">
                          {selectedApp.learningProfile.studiedBefore ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Study Duration</span>
                        <span className="font-medium text-[#333]">{selectedApp.learningProfile.studyDuration}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Previous Method</span>
                        <span className="font-medium text-[#333]">
                          {selectedApp.learningProfile.previousLearningMethod}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Hangul Reading</span>
                        <span className="font-medium text-[#333]">
                          {selectedApp.learningProfile.readingHangulComfort}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 block">Speaking Confidence</span>
                        <span className="font-medium text-[#333]">
                          {selectedApp.learningProfile.speakingConfidence}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 4 & 5: Goals & Availability */}
                  <div className="bg-[#FAFBF9] border border-gray-200 rounded-xl p-5 space-y-3">
                    <h4 className="font-bold text-sm text-[#333]">Goals & Availability</h4>
                    <div>
                      <span className="text-gray-500 block">Personal Learning Goal</span>
                      <p className="font-semibold text-sm text-[#333] mt-0.5">
                        "{selectedApp.learningProfile.personalLearningGoal}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <span className="text-gray-500 block">Preferred Format</span>
                        <span className="font-semibold text-[#008C50]">
                          {selectedApp.learningProfile.preferredClassFormat}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Frequency</span>
                        <span className="font-medium text-[#333]">
                          {selectedApp.availability.preferredFrequency}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Independent Study</span>
                        <span className="font-medium text-[#333]">
                          {selectedApp.learningProfile.independentPracticeHours}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-gray-500 block">Available Time Slots (KST)</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedApp.availability.timeSlots?.map((slot) => (
                          <span
                            key={slot}
                            className="bg-white border border-gray-300 px-2.5 py-1 rounded-md font-medium text-[#333]"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Administrative Review Notes */}
                  <div className="bg-white border-2 border-dashed border-[#008C50]/30 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#333]">Church Administrator Review Notes</h4>
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="bg-[#008C50] text-white px-3 py-1 rounded text-xs font-semibold hover:bg-[#007340] disabled:opacity-50"
                      >
                        {savingNotes ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Record internal notes regarding eligibility, interview, schedule constraints, or instructor pairing considerations..."
                      className="w-full p-3 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-[#008C50] outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* History Tab */
                <div className="space-y-3 text-xs">
                  {selectedApp.history && selectedApp.history.length > 0 ? (
                    <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl">
                      {selectedApp.history.map((ev, idx) => (
                        <div key={idx} className="p-3.5 flex items-start justify-between">
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#333]">{ev.action}</span>
                            <p className="text-gray-500 text-[11px]">By: {ev.actorName}</p>
                            {ev.note && <p className="text-gray-600 italic">"{ev.note}"</p>}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {new Date(ev.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 py-6 text-center">No history logs recorded yet.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
