import React, { useState } from 'react';
import { CommitteeFeedback, FeedbackStatus } from '../../types';
import { deleteCommitteeFeedback } from '../../services/committeeService';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Filter,
  Plus,
  ThumbsUp,
  FileEdit,
  PauseCircle,
} from 'lucide-react';

interface CommitteeReviewDashboardProps {
  feedbacks: CommitteeFeedback[];
  onOpenFeedbackModal: () => void;
  onRefresh: () => void;
}

export const CommitteeReviewDashboard: React.FC<CommitteeReviewDashboardProps> = ({
  feedbacks,
  onOpenFeedbackModal,
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const approvedCount = feedbacks.filter((f) => f.status === 'approved').length;
  const changesCount = feedbacks.filter((f) => f.status === 'requires_changes').length;
  const deferredCount = feedbacks.filter((f) => f.status === 'deferred').length;

  const filtered = feedbacks.filter((f) => filterStatus === 'all' || f.status === filterStatus);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this feedback item?')) return;
    await deleteCommitteeFeedback(id);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#333]">Church Committee Review Registry</h2>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#D97706] border border-[#FDE68A]">
              Stakeholder Validation
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Track committee requirements review, policy approvals, requested modifications, and deferred items.
          </p>
        </div>

        <button
          onClick={onOpenFeedbackModal}
          className="text-xs font-bold bg-[#F3981B] hover:bg-[#D97706] text-white px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Feedback</span>
        </button>
      </div>

      {/* KPI Tally Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterStatus(filterStatus === 'approved' ? 'all' : 'approved')}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all ${
            filterStatus === 'approved' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Approved Requirements
            </span>
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{approvedCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Confirmed for production baseline</p>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'requires_changes' ? 'all' : 'requires_changes')}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all ${
            filterStatus === 'requires_changes' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Requires Changes
            </span>
            <FileEdit className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{changesCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Needs policy or copy adjustment</p>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'deferred' ? 'all' : 'deferred')}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all ${
            filterStatus === 'deferred' ? 'border-gray-400 ring-2 ring-gray-400/20' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Deferred / Pending
            </span>
            <PauseCircle className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-700 mt-2">{deferredCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Pending church session approval</p>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-[#333]">
            Consultation Feedback Entries ({filtered.length})
          </span>
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="text-xs text-[#008C50] font-semibold hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <div key={item.id} className="p-5 text-xs hover:bg-gray-50/60 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#333]">{item.screenOrFeature}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          item.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'requires_changes'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                      {item.isDemo && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-bold">
                          DEMO SAMPLE
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-800 leading-relaxed font-normal">
                      "{item.comment}"
                    </p>

                    <div className="flex items-center gap-2 text-gray-500 text-[11px] pt-1">
                      <span>Reviewer: {item.reviewerName}</span>
                      <span>·</span>
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-gray-400">
            No feedback entries found. Click "Record New Feedback" above.
          </div>
        )}
      </div>
    </div>
  );
};
