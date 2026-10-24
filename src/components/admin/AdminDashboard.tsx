import React from 'react';
import { Application, Instructor, Match, ApplicationStatus } from '../../types';
import {
  Users,
  FileCheck2,
  Clock,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AdminDashboardProps {
  applications: Application[];
  instructors: Instructor[];
  matches: Match[];
  onSelectApplication: (app: Application) => void;
  onNavigateToMatching: (app?: Application) => void;
  onNavigateToInstructors: () => void;
  onNavigateToFormBuilder: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  applications,
  instructors,
  matches,
  onSelectApplication,
  onNavigateToMatching,
  onNavigateToInstructors,
  onNavigateToFormBuilder,
}) => {
  // Live metrics calculated strictly from database records
  const totalApps = applications.length;
  const newApps = applications.filter((a) => a.status === 'submitted').length;
  const underReview = applications.filter((a) => a.status === 'under_review').length;
  const readyForMatching = applications.filter((a) => a.status === 'ready_for_matching').length;
  const matched = applications.filter((a) => a.status === 'matched').length;
  const infoRequired = applications.filter((a) => a.status === 'information_required').length;

  const totalInstructorCapacity = instructors.reduce((acc, i) => acc + (i.maxCapacity || 0), 0);
  const totalStudentsAssigned = instructors.reduce((acc, i) => acc + (i.currentStudentsCount || 0), 0);
  const availableSlots = Math.max(0, totalInstructorCapacity - totalStudentsAssigned);

  // Status chart data
  const statusData = [
    { name: 'Submitted', count: newApps, color: '#008C50' },
    { name: 'Under Review', count: underReview, color: '#3B82F6' },
    { name: 'Info Required', count: infoRequired, color: '#F3981B' },
    { name: 'Ready Match', count: readyForMatching, color: '#8B5CF6' },
    { name: 'Matched', count: matched, color: '#10B981' },
  ].filter((d) => d.count > 0);

  // Proficiency breakdown
  const levelCounts: Record<string, number> = {
    Beginner: 0,
    Elementary: 0,
    Intermediate: 0,
    Advanced: 0,
  };
  applications.forEach((a) => {
    const lvl = a.learningProfile?.selfAssessedLevel || 'Beginner';
    levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
  });

  const levelData = Object.entries(levelCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const COLORS = ['#008C50', '#4AA83C', '#F3981B', '#3B82F6', '#8B5CF6'];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#777]">Total Apps</span>
          <p className="text-2xl font-bold text-[#333] mt-1">{totalApps}</p>
          <span className="text-[10px] text-gray-500 mt-1 block">All records</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#008C50]">New Submitted</span>
          <p className="text-2xl font-bold text-[#008C50] mt-1">{newApps}</p>
          <span className="text-[10px] text-[#008C50] mt-1 block font-medium">Needs initial review</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Under Review</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{underReview}</p>
          <span className="text-[10px] text-gray-500 mt-1 block">In evaluation</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Ready to Match</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">{readyForMatching}</p>
          <span className="text-[10px] text-purple-600 font-medium mt-1 block">Awaiting instructor</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Matched</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{matched}</p>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Assigned to class</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#F3981B]">Open Slots</span>
          <p className="text-2xl font-bold text-[#F3981B] mt-1">{availableSlots}</p>
          <span className="text-[10px] text-gray-500 mt-1 block">
            {totalStudentsAssigned}/{totalInstructorCapacity} capacity
          </span>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Distribution */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#333]">Application Workflow Status</h3>
            <span className="text-xs text-gray-500">Live Firestore distribution</span>
          </div>
          {statusData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#008C50" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-gray-400">
              No applications submitted yet.
            </div>
          )}
        </div>

        {/* Proficiency Level Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#333]">Korean Level Breakdown</h3>
            <span className="text-xs text-gray-500">Self-assessed</span>
          </div>
          {applications.length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={levelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    label={((props: any) => (props.value > 0 ? `${props.name}: ${props.value}` : '')) as any}
                  >
                    {levelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-gray-400">
              No learner level data available.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Applications */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#333]">Recent Applications</h3>
              <p className="text-xs text-gray-500">Ordered by most recent submission</p>
            </div>
            <span className="text-xs font-semibold text-[#008C50]">
              Showing {Math.min(5, applications.length)} of {applications.length}
            </span>
          </div>

          {applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[#777] font-semibold bg-gray-50/50">
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Applicant</th>
                    <th className="py-2.5 px-3">Level</th>
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-[#008C50]">
                        {app.referenceNumber}
                        {app.isDemo && (
                          <span className="ml-1 text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-sans">
                            DEMO
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#333] block">
                          {app.applicant.givenName} {app.applicant.familyName}
                        </span>
                        <span className="text-[11px] text-gray-500">{app.applicant.email}</span>
                      </td>
                      <td className="py-3 px-3 font-medium text-[#444]">
                        {app.learningProfile?.selfAssessedLevel}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {app.learningProfile?.preferredClassFormat}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            app.status === 'submitted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : app.status === 'under_review'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : app.status === 'ready_for_matching'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : app.status === 'matched'
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onSelectApplication(app)}
                          className="text-xs font-semibold text-[#008C50] hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-gray-400">
              No applications in database. Use "Seed Sample Data" above to test the dashboard.
            </div>
          )}
        </div>

        {/* Right: Quick Operational Shortcuts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
            <h3 className="text-sm font-bold text-[#333] mb-3">Quick Actions</h3>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateToMatching()}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#008C50] hover:bg-[#F5F7F5] transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-[#333] block">Matching Workspace</span>
                  <span className="text-gray-500 text-[11px]">Compare learners & available instructors</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#008C50]" />
              </button>

              <button
                onClick={() => onNavigateToInstructors()}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#008C50] hover:bg-[#F5F7F5] transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-[#333] block">Manage Instructors</span>
                  <span className="text-gray-500 text-[11px]">
                    {instructors.length} instructors ({availableSlots} slots open)
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#008C50]" />
              </button>

              <button
                onClick={() => onNavigateToFormBuilder()}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#008C50] hover:bg-[#F5F7F5] transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-[#333] block">Dynamic Form Builder</span>
                  <span className="text-gray-500 text-[11px]">Reconcile 36 questions & publish</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#008C50]" />
              </button>
            </div>
          </div>

          {/* Instructor Directory Preview */}
          <div className="bg-[#FAFBF9] p-5 rounded-2xl border border-gray-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#777] mb-3">
              Active Instructors Summary
            </h4>
            <div className="space-y-2 text-xs">
              {instructors.slice(0, 3).map((inst) => (
                <div key={inst.id} className="flex items-center justify-between p-2 rounded bg-white border border-gray-200">
                  <div>
                    <span className="font-semibold text-[#333]">{inst.name}</span>
                    <span className="text-[11px] text-gray-500 block truncate max-w-[150px]">
                      {inst.supportedLevels.join(', ')} · {inst.preferredFormat}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#008C50] bg-[#E8F5E9] px-2 py-0.5 rounded">
                    {inst.currentStudentsCount}/{inst.maxCapacity} slots
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
