import React, { useState } from 'react';
import { FormTemplate, FormQuestion, FormSection, QuestionType } from '../../types';
import { saveFormTemplateDraft, publishFormTemplate } from '../../services/formService';
import { ORIGINAL_36_QUESTIONS, DEFAULT_FORM_SECTIONS } from '../../lib/defaultFormTemplate';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Save,
  Send,
  Eye,
  Download,
  Upload,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Layers,
  Sparkles,
  HelpCircle,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';

interface FormBuilderProps {
  currentTemplate: FormTemplate;
  onTemplateUpdated: (template: FormTemplate) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ currentTemplate, onTemplateUpdated }) => {
  const [template, setTemplate] = useState<FormTemplate>(currentTemplate);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    template.sections[0]?.id || 'sec_1'
  );
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(null);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentQuestions = template.questions
    .filter((q) => q.sectionId === selectedSectionId)
    .sort((a, b) => a.order - b.order);

  const handleToggleQuestionActive = (qId: string) => {
    setTemplate((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === qId ? { ...q, active: !q.active } : q)),
    }));
  };

  const handleToggleQuestionRequired = (qId: string) => {
    setTemplate((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === qId ? { ...q, required: !q.required } : q)),
    }));
  };

  const handleMoveOrder = (qId: string, direction: 'up' | 'down') => {
    const list = [...currentQuestions];
    const index = list.findIndex((q) => q.id === qId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = list[index].order;
    list[index].order = list[targetIndex].order;
    list[targetIndex].order = temp;

    setTemplate((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        const found = list.find((item) => item.id === q.id);
        return found ? found : q;
      }),
    }));
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!window.confirm('Delete this question from template?')) return;
    setTemplate((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== qId),
    }));
    if (editingQuestion?.id === qId) setEditingQuestion(null);
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      await saveFormTemplateDraft(template);
      showToast('Form draft saved successfully in Cloud Firestore.');
    } catch (err) {
      console.error(err);
      showToast('Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      const nextVersion = `v${(parseFloat(template.version.replace('v', '')) + 0.1).toFixed(1)}`;
      const toPublish: FormTemplate = {
        ...template,
        version: nextVersion,
      };
      const result = await publishFormTemplate(toPublish);
      setTemplate(result);
      onTemplateUpdated(result);
      showToast(`Published form version ${nextVersion} to production!`);
    } catch (err) {
      console.error(err);
      showToast('Publishing failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreOriginal36 = () => {
    if (!window.confirm('Re-import and reconcile all 36 original source questions?')) return;
    setTemplate((prev) => ({
      ...prev,
      sections: DEFAULT_FORM_SECTIONS,
      questions: ORIGINAL_36_QUESTIONS,
      updatedAt: new Date().toISOString(),
    }));
    setIsReconcileModalOpen(false);
    showToast('Reconciled full 36 original source questions.');
  };

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `everlove_questionnaire_${template.version}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAddNewQuestion = () => {
    const newQ: FormQuestion = {
      id: `q_custom_${Date.now()}`,
      sourceQuestionNumber: template.questions.length + 1,
      originalSourceText: 'New question',
      labelEn: 'New Question Title',
      labelKr: '새 질문 제목',
      type: 'short_text',
      required: false,
      sectionId: selectedSectionId,
      order: currentQuestions.length + 1,
      active: true,
    };
    setTemplate((prev) => ({ ...prev, questions: [...prev.questions, newQ] }));
    setEditingQuestion(newQ);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#333]">Dynamic Application Form Builder</h2>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#008C50]">
              Version {template.version}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                template.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {template.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reconcile original 36 questions, configure sections, edit options, and publish new form versions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {toastMessage && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {toastMessage}
            </span>
          )}

          <button
            onClick={() => setIsReconcileModalOpen(true)}
            className="text-xs font-semibold text-[#333] bg-[#FAFBF9] hover:bg-gray-100 border border-gray-300 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#008C50]" />
            <span>Reconcile 36 Questions</span>
          </button>

          <button
            onClick={exportJson}
            className="text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="text-xs font-bold text-white bg-[#008C50] hover:bg-[#007340] px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish New Version</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Section Navigator */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#777] mb-3">
              Application Sections
            </h3>
            <div className="space-y-1.5">
              {template.sections.map((sec) => {
                const count = template.questions.filter((q) => q.sectionId === sec.id).length;
                const isSelected = sec.id === selectedSectionId;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setSelectedSectionId(sec.id);
                      setEditingQuestion(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#008C50] bg-[#E8F5E9]/50 font-bold text-[#008C50] shadow-2xs'
                        : 'border-gray-100 hover:border-gray-200 bg-white text-[#444]'
                    }`}
                  >
                    <div>
                      <span className="block">{sec.titleEn}</span>
                      <span className="text-[11px] font-normal text-gray-500">{sec.titleKr}</span>
                    </div>
                    <span className="text-[11px] font-semibold bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                      {count} items
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-[#FAFBF9] p-5 rounded-2xl border border-gray-200 text-xs text-[#555] space-y-2">
            <div className="flex justify-between">
              <span>Total Questions:</span>
              <span className="font-bold text-[#333]">{template.questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active in Form:</span>
              <span className="font-bold text-[#008C50]">
                {template.questions.filter((q) => q.active).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Required Fields:</span>
              <span className="font-bold text-[#F3981B]">
                {template.questions.filter((q) => q.required).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Original Source Questions:</span>
              <span className="font-bold text-[#333]">36 of 36 mapped</span>
            </div>
          </div>
        </div>

        {/* Center: Question List for Selected Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#333]">
                  {template.sections.find((s) => s.id === selectedSectionId)?.titleEn}
                </h3>
                <p className="text-xs text-gray-500">
                  {template.sections.find((s) => s.id === selectedSectionId)?.descriptionEn}
                </p>
              </div>

              <button
                onClick={handleAddNewQuestion}
                className="text-xs font-semibold bg-[#008C50] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#007340] shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Questions Table */}
            <div className="space-y-3">
              {currentQuestions.map((q, idx) => {
                const isSelectedForEdit = editingQuestion?.id === q.id;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition-all text-xs ${
                      isSelectedForEdit
                        ? 'border-[#008C50] bg-[#FAFBF9] ring-2 ring-[#008C50]/20'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#008C50] bg-[#E8F5E9] px-2 py-0.5 rounded text-[11px]">
                            Q{q.sourceQuestionNumber}
                          </span>
                          <span className="font-semibold text-sm text-[#333]">{q.labelEn}</span>
                          {q.required && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                              Required
                            </span>
                          )}
                          {!q.active && (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">
                              Inactive
                            </span>
                          )}
                        </div>

                        {q.labelKr && (
                          <p className="text-[11px] text-gray-500 italic pl-1">{q.labelKr}</p>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded uppercase font-mono text-[10px]">
                            {q.type}
                          </span>
                          {q.optionsEn && (
                            <span>{q.optionsEn.length} options configured</span>
                          )}
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveOrder(q.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-20"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(q.id, 'down')}
                          disabled={idx === currentQuestions.length - 1}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-20"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleQuestionActive(q.id)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded border ${
                            q.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          {q.active ? 'Active' : 'Disabled'}
                        </button>

                        <button
                          onClick={() => setEditingQuestion(isSelectedForEdit ? null : q)}
                          className="text-xs font-semibold text-[#008C50] hover:underline px-2 py-1"
                        >
                          {isSelectedForEdit ? 'Close' : 'Configure'}
                        </button>

                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Editor Drawer */}
                    {isSelectedForEdit && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 bg-white p-4 rounded-lg">
                        <h4 className="font-bold text-xs text-[#333]">Question Configuration</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Label (English)
                            </label>
                            <input
                              type="text"
                              value={q.labelEn}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTemplate((prev) => ({
                                  ...prev,
                                  questions: prev.questions.map((item) =>
                                    item.id === q.id ? { ...item, labelEn: val } : item
                                  ),
                                }));
                              }}
                              className="w-full p-2 border border-gray-300 rounded text-xs outline-none focus:border-[#008C50]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Label (Korean)
                            </label>
                            <input
                              type="text"
                              value={q.labelKr || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTemplate((prev) => ({
                                  ...prev,
                                  questions: prev.questions.map((item) =>
                                    item.id === q.id ? { ...item, labelKr: val } : item
                                  ),
                                }));
                              }}
                              className="w-full p-2 border border-gray-300 rounded text-xs outline-none focus:border-[#008C50]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Field Type
                            </label>
                            <select
                              value={q.type}
                              onChange={(e) => {
                                const val = e.target.value as QuestionType;
                                setTemplate((prev) => ({
                                  ...prev,
                                  questions: prev.questions.map((item) =>
                                    item.id === q.id ? { ...item, type: val } : item
                                  ),
                                }));
                              }}
                              className="w-full p-2 border border-gray-300 rounded text-xs bg-white outline-none"
                            >
                              <option value="short_text">Short Text</option>
                              <option value="long_text">Paragraph / Long Text</option>
                              <option value="radio">Single Choice (Radio)</option>
                              <option value="checkbox">Multiple Choice (Checkbox)</option>
                              <option value="dropdown">Dropdown</option>
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                              <option value="date">Date</option>
                              <option value="consent">Consent Checkbox</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-3 pt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={q.required}
                                onChange={() => handleToggleQuestionRequired(q.id)}
                                className="accent-[#008C50] w-4 h-4"
                              />
                              <span className="font-semibold text-xs text-[#333]">Required field</span>
                            </label>
                          </div>
                        </div>

                        {/* Optional conditional visibility: saved in the published form definition. */}
                        <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                          <label className="block text-xs font-bold text-[#333]">Conditional visibility (optional)</label>
                          <p className="text-[11px] text-gray-600">Only show this question when an earlier question has the selected answer. Leave blank to always show it.</p>
                          <select
                            aria-label="Controlling question"
                            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs"
                            value={q.condition?.dependsOnQuestionId || ''}
                            onChange={e => {
                              const parent = template.questions.find(item => item.id === e.target.value);
                              setTemplate(prev => ({ ...prev, questions: prev.questions.map(item => item.id === q.id ? {
                                ...item, condition: parent ? { dependsOnQuestionId: parent.id, operator: 'includes', value: parent.optionsEn?.[0] || '' } : undefined
                              } : item) }));
                            }}
                          >
                            <option value="">Always show</option>
                            {template.questions.filter(item => item.id !== q.id && item.active && item.order < q.order && ['radio','checkbox','dropdown','yes_no'].includes(item.type)).sort((a,b) => a.order-b.order).map(item => (
                              <option key={item.id} value={item.id}>Q{item.sourceQuestionNumber} — {item.labelEn}</option>
                            ))}
                          </select>
                          {q.condition && <>
                            <select aria-label="Visibility rule" className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs"
                              value={q.condition.operator}
                              onChange={e => setTemplate(prev => ({ ...prev, questions: prev.questions.map(item => item.id === q.id ? { ...item, condition: { ...q.condition!, operator: e.target.value as 'equals' | 'includes' | 'not_empty' } } : item) }))}>
                              <option value="equals">Equals</option>
                              <option value="includes">Includes (for multiple selections)</option>
                              <option value="not_empty">Has an answer</option>
                            </select>
                            {q.condition.operator !== 'not_empty' && <select aria-label="Required controlling answer" className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs"
                              value={q.condition.value}
                              onChange={e => setTemplate(prev => ({ ...prev, questions: prev.questions.map(item => item.id === q.id ? { ...item, condition: { ...q.condition!, value: e.target.value } } : item) }))}>
                              {(template.questions.find(item => item.id === q.condition?.dependsOnQuestionId)?.optionsEn || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                            </select>}
                          </>}
                        </div>

                        {/* Options editor for choice types */}
                        {(q.type === 'radio' || q.type === 'checkbox' || q.type === 'dropdown') && (
                          <div className="space-y-2 pt-2">
                            <label className="block text-[11px] font-semibold text-gray-600">
                              Response Options (One per line)
                            </label>
                            <textarea
                              rows={4}
                              value={q.optionsEn?.join('\n') || ''}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n');
                                setTemplate((prev) => ({
                                  ...prev,
                                  questions: prev.questions.map((item) =>
                                    item.id === q.id ? { ...item, optionsEn: lines } : item
                                  ),
                                }));
                              }}
                              className="w-full p-2 border border-gray-300 rounded font-mono text-xs outline-none focus:border-[#008C50]"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Reconcile with 36 Original Questions from PDF */}
      {isReconcileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#333]">
                  Original 36-Question Reconciler
                </h3>
                <p className="text-xs text-gray-500">
                  Paper Form: Korean Language Class Application Form (Sections 1 through 8)
                </p>
              </div>
              <button
                onClick={() => setIsReconcileModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAFBF9] border border-gray-200 rounded-xl p-4 text-xs text-[#555] space-y-1">
              <p className="font-semibold text-[#333]">Authoritative Source Traceability</p>
              <p>
                Every question maintains its original source number (1 to 36) from the official church application form. Administrators can decide which questions remain active for the public application without breaking historical answer records.
              </p>
            </div>

            {/* List all 36 original questions */}
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
              {ORIGINAL_36_QUESTIONS.map((oq) => (
                <div key={oq.id} className="p-3 text-xs flex items-start justify-between hover:bg-gray-50">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#008C50] bg-[#E8F5E9] px-2 py-0.5 rounded text-[10px]">
                      Q{oq.sourceQuestionNumber}
                    </span>
                    <span className="font-semibold text-[#333] ml-2">{oq.originalSourceText}</span>
                    <p className="text-gray-500 text-[11px]">{oq.labelEn} · ({oq.type})</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded">
                    Mapped
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsReconcileModalOpen(false)}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
              <button
                onClick={handleRestoreOriginal36}
                className="text-xs font-bold bg-[#008C50] hover:bg-[#007340] text-white px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Full 36 Questions Baseline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
