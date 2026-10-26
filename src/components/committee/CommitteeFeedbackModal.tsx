import React, { useState } from 'react';
import { FeedbackStatus } from '../../types';
import { submitCommitteeFeedback } from '../../services/committeeService';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, CheckCircle2, X } from 'lucide-react';

interface CommitteeFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreenName: string;
  onSubmitted: () => void;
}

export const CommitteeFeedbackModal: React.FC<CommitteeFeedbackModalProps> = ({
  isOpen,
  onClose,
  currentScreenName,
  onSubmitted,
}) => {
  const { profile } = useAuth();
  const [reviewerName, setReviewerName] = useState(
    profile?.displayName || ''
  );
  const [screenOrFeature, setScreenOrFeature] = useState(currentScreenName);
  const [status, setStatus] = useState<FeedbackStatus>('approved');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      await submitCommitteeFeedback(reviewerName, screenOrFeature, status, comment, false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Could not submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#F3981B]" />
            <h3 className="text-base font-bold text-[#333]">Send Feedback</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#008C50] mx-auto animate-bounce" />
            <p className="font-bold text-sm text-[#333]">Feedback submitted!</p>
            <p className="text-xs text-gray-500">Thank you for sharing your feedback.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Your name"
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Target Screen or Feature *</label>
              <input
                type="text"
                required
                value={screenOrFeature}
                onChange={(e) => setScreenOrFeature(e.target.value)}
                placeholder="e.g. Learner Application Form, Matching Workspace"
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Your Feedback *
              </label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your question, suggestion, or comment..."
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#008C50] hover:bg-[#007340] text-white px-6 py-2 rounded-lg font-bold shadow-xs disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Save Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
