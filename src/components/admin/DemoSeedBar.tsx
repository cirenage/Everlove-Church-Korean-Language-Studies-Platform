import React, { useState } from 'react';
import { seedDemoData, clearDemoData } from '../../services/demoSeedService';
import { Sparkles, Trash2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface DemoSeedBarProps {
  onDataChanged: () => void;
}

export const DemoSeedBar: React.FC<DemoSeedBarProps> = ({ onDataChanged }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    try {
      setLoading(true);
      const res = await seedDemoData();
      setMessage(`Seeded ${res.applicantsCount} fictional applicants, ${res.instructorsCount} instructors, and review data!`);
      onDataChanged();
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to seed demo data.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Wipe all synthetic demo records? (Real records will not be deleted)')) return;
    try {
      setLoading(true);
      const count = await clearDemoData();
      setMessage(`Removed ${count} synthetic demo records.`);
      onDataChanged();
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to wipe demo data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFBEB] border-b border-[#FDE68A] py-2 px-4 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#92400E]">
          <span className="font-bold uppercase tracking-wider bg-[#FDE68A] text-[#78350F] px-2 py-0.5 rounded text-[10px]">
            DEMONSTRATION MODE
          </span>
          <span className="hidden sm:inline">
            Fictional data for Everlove Church committee review. Real enrollment records are separate.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {message && (
            <span className="text-emerald-700 font-medium flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {message}
            </span>
          )}

          <button
            onClick={handleSeed}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#F3981B] hover:bg-[#D97706] text-white px-3 py-1 rounded font-medium shadow-xs transition-colors disabled:opacity-50"
            title="Populate 5 sample applicants (Avery, Carlos, Linh, Sarah, Kenji) and 4 instructors"
          >
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            <span>Seed Sample Data</span>
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            className="flex items-center gap-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded font-medium transition-colors disabled:opacity-50"
            title="Remove all fictional records tagged with DEMO"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
