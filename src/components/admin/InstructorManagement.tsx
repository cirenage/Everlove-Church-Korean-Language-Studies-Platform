import React, { useState } from 'react';
import { Instructor } from '../../types';
import { createInstructor, updateInstructor, deleteInstructor } from '../../services/instructorService';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  X,
  Sparkles,
} from 'lucide-react';

interface InstructorManagementProps {
  instructors: Instructor[];
  onRefresh: () => void;
}

export const InstructorManagement: React.FC<InstructorManagementProps> = ({ instructors, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<Instructor | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for creating or editing
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [supportedLevels, setSupportedLevels] = useState<string[]>(['Beginner']);
  const [preferredFormat, setPreferredFormat] = useState<'in_person' | 'online' | 'hybrid' | 'any'>('hybrid');
  const [languageSupport, setLanguageSupport] = useState<string[]>(['English']);
  const [locations, setLocations] = useState('Daejeon (Church Annex), Online');
  const [weeklyAvailability, setWeeklyAvailability] = useState('Tue 18:00–20:00, Thu 18:00–20:00, Sat 10:00–12:00');
  const [maxCapacity, setMaxCapacity] = useState(4);
  const [notes, setNotes] = useState('');

  const handleOpenModal = (inst?: Instructor) => {
    if (inst) {
      setEditingInst(inst);
      setName(inst.name);
      setEmail(inst.email);
      setPhone(inst.phone);
      setExperienceYears(inst.experienceYears || 3);
      setSupportedLevels(inst.supportedLevels);
      setPreferredFormat(inst.preferredFormat);
      setLanguageSupport(inst.languageSupport || ['English']);
      setLocations(inst.locations?.join(', ') || '');
      setWeeklyAvailability(inst.weeklyAvailability?.join(', ') || '');
      setMaxCapacity(inst.maxCapacity || 4);
      setNotes(inst.notes || '');
    } else {
      setEditingInst(null);
      setName('');
      setEmail('');
      setPhone('');
      setExperienceYears(3);
      setSupportedLevels(['Beginner', 'Elementary']);
      setPreferredFormat('hybrid');
      setLanguageSupport(['English', 'Korean']);
      setLocations('Daejeon - Yuseong-gu, Online');
      setWeeklyAvailability('Tue 18:00–20:00, Thu 18:00–20:00, Sat 10:00–12:00');
      setMaxCapacity(4);
      setNotes('');
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      setSaving(true);
      const locList = locations.split(',').map((s) => s.trim()).filter(Boolean);
      const availList = weeklyAvailability.split(',').map((s) => s.trim()).filter(Boolean);

      if (editingInst) {
        await updateInstructor(editingInst.id, {
          name,
          email,
          phone,
          experienceYears,
          supportedLevels: supportedLevels as any,
          preferredFormat,
          languageSupport,
          locations: locList,
          weeklyAvailability: availList,
          maxCapacity,
          notes,
        });
      } else {
        await createInstructor({
          name,
          email,
          phone,
          active: true,
          experienceYears,
          supportedLevels: supportedLevels as any,
          preferredTopics: ['General Korean', 'Everyday conversation'],
          preferredFormat,
          languageSupport,
          locations: locList,
          weeklyAvailability: availList,
          maxCapacity,
          currentStudentsCount: 0,
          notes,
          isDemo: false,
        });
      }

      setModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (inst: Instructor) => {
    await updateInstructor(inst.id, { active: !inst.active });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete instructor record?')) return;
    await deleteInstructor(id);
    onRefresh();
  };

  const toggleLevel = (lvl: string) => {
    setSupportedLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#333]">Instructor Directory</h2>
          <p className="text-xs text-gray-500 mt-1">
            Maintain teacher capabilities, language support, weekly time availability, and student slot capacity.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="text-xs font-bold bg-[#008C50] hover:bg-[#007340] text-white px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Instructor</span>
        </button>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructors.map((inst) => {
          const availableSlots = Math.max(0, inst.maxCapacity - (inst.currentStudentsCount || 0));
          return (
            <div
              key={inst.id}
              className={`bg-white rounded-2xl border p-6 shadow-2xs flex flex-col justify-between transition-all ${
                inst.active ? 'border-gray-200' : 'border-gray-200/50 opacity-60 bg-gray-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#333] flex items-center gap-2">
                      <span>{inst.name}</span>
                      {inst.isDemo && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-bold">
                          DEMO
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500">{inst.email}</p>
                    {inst.phone && <p className="text-[11px] text-gray-400">{inst.phone}</p>}
                  </div>

                  <button
                    onClick={() => handleToggleActive(inst)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      inst.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    {inst.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Badges */}
                <div className="space-y-2.5 my-4 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Supported Levels
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {inst.supportedLevels?.map((lvl) => (
                        <span
                          key={lvl}
                          className="bg-[#E8F5E9] text-[#008C50] px-2 py-0.5 rounded text-[11px] font-medium"
                        >
                          {lvl}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Format & Language Support
                    </span>
                    <p className="text-gray-700">
                      {inst.preferredFormat} · {inst.languageSupport?.join(', ')}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Weekly Availability
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {inst.weeklyAvailability?.map((slot) => (
                        <span
                          key={slot}
                          className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px]"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Capacity & Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500 text-[11px]">Capacity: </span>
                  <span className="font-bold text-[#333]">
                    {inst.currentStudentsCount || 0} / {inst.maxCapacity} students
                  </span>
                  <span className="text-[10px] text-[#008C50] ml-1">
                    ({availableSlots} open)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(inst)}
                    className="p-1.5 text-gray-500 hover:text-[#008C50] hover:bg-gray-100 rounded"
                    title="Edit instructor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(inst.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                    title="Delete instructor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#333]">
                {editingInst ? 'Edit Instructor Profile' : 'Add New Korean Instructor'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pastor Minho Park"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. minho.park@everlove.kr"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+82 10-XXXX-XXXX"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Supported Proficiency Levels</label>
                <div className="flex flex-wrap gap-2">
                  {['Beginner', 'Elementary', 'Intermediate', 'Advanced'].map((lvl) => {
                    const isSelected = supportedLevels.includes(lvl);
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => toggleLevel(lvl)}
                        className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#E8F5E9] text-[#008C50] border-[#008C50]'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Preferred Format</label>
                  <select
                    value={preferredFormat}
                    onChange={(e) => setPreferredFormat(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    <option value="in_person">In Person</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="any">Any Format</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Max Student Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Weekly Available Time Windows (Comma separated)
                </label>
                <input
                  type="text"
                  value={weeklyAvailability}
                  onChange={(e) => setWeeklyAvailability(e.target.value)}
                  placeholder="e.g. Tue 18:00–20:00, Thu 18:00–20:00, Sat 10:00–12:00"
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Teaching Notes & Specialties
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specialties, curriculum preferences, approach to beginner learners..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#008C50]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#008C50] hover:bg-[#007340] text-white px-6 py-2 rounded-lg font-bold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
