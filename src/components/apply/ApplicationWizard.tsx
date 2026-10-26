import React, { useMemo, useState, useEffect } from 'react';
import { FormTemplate, FormQuestion, Application, ApplicantInfo, LearningProfile, AvailabilityInfo } from '../../types';
import { submitApplication } from '../../services/applicationService';
import { useLanguage } from '../../context/LanguageContext';
import { appText, applicantExtraText, applicantPlaceholder, localizedQuestion, localizedSection, questionnaireCoverage } from '../../i18n/applicantLanguages';
import { ArrowLeft, ArrowRight, CheckCircle2, Save, AlertCircle, UserRound, MapPin, BookOpen, Target, CalendarDays, ShieldCheck, ClipboardCheck } from 'lucide-react';

type Answer = string | string[] | boolean;
type Answers = Record<string, Answer>;
interface Props { formTemplate: FormTemplate; onSubmitted: (app: Application) => void; onCancel: () => void }
const draftKey = (id: string, version: string) => `everlove_draft_${id}_${version}`;
const visible = (q: FormQuestion, answers: Answers) => {
  if (!q.active) return false;
  if (!q.condition) return true;
  const value = answers[q.condition.dependsOnQuestionId];
  if (q.condition.operator === 'not_empty') return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== '' && value !== false;
  if (q.condition.operator === 'includes') return Array.isArray(value) ? value.includes(q.condition.value) : String(value ?? '').includes(q.condition.value);
  return value === q.condition.value;
};
const normalized = (v?: Answer) => Array.isArray(v) ? v.join(', ') : String(v ?? '');
const arr = (v?: Answer) => Array.isArray(v) ? v : v ? [String(v)] : [];
const classifyLevel = (s: string): LearningProfile['selfAssessedLevel'] => {
  const lower = s.toLowerCase();
  if (lower.includes('work') || lower.includes('academic')) return 'Advanced';
  if (lower.includes('most everyday') || lower.includes('simple everyday')) return 'Intermediate';
  if (lower.includes('read hangul')) return 'Elementary';
  return 'Beginner';
};
export const ApplicationWizard: React.FC<Props> = ({ formTemplate, onSubmitted, onCancel }) => {
  const { applicantLang } = useLanguage();
  const korean = false;
  const tx = (key:string) => appText(applicantLang,key);
  const fx = (key: Parameters<typeof applicantExtraText>[1]) => applicantExtraText(applicantLang,key);
  const coverage = questionnaireCoverage(applicantLang,formTemplate.questions.filter(q=>q.active));
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState<Application | null>(null);
  const sections = useMemo(() => [...formTemplate.sections].sort((a,b) => a.order-b.order), [formTemplate]);
  const activeQuestions = useMemo(() => formTemplate.questions.filter(q => q.active), [formTemplate]);
  const section = sections[step];
  const questions = useMemo(() => section ? activeQuestions.filter(q => q.sectionId === section.id && visible(q, answers)).sort((a,b) => a.order-b.order) : [], [section, activeQuestions, answers]);
  // The original PDF number is immutable metadata. Display sequence is derived
  // independently from the currently visible questions in each digital section.
  const sectionDisplayNumbers = useMemo(() => new Map(questions.map((q, i) => [q.id, i + 1])), [questions]);
  const storageKey = draftKey(formTemplate.id, formTemplate.version);
  useEffect(() => { try { const saved = localStorage.getItem(storageKey); if(saved) setAnswers(JSON.parse(saved)); } catch {} }, [storageKey]);
  const set = (id:string, value:Answer) => {
    setAnswers(prev => {
      const updated = { ...prev, [id]: value };
      // Clear answers that become hidden when the controlling answer changes.
      for (const q of activeQuestions) {
        if (q.condition && !visible(q, updated)) delete updated[q.id];
      }
      return updated;
    });
    setError('');
  };
  const label = (q: FormQuestion) => localizedQuestion(q,applicantLang).label;
  const opts = (q: FormQuestion) => localizedQuestion(q,applicantLang).options;
  const validate = (qs: FormQuestion[]) => {
    for(const q of qs) {
      if (!q.required) continue;
      const answer = answers[q.id];
      if (answer === undefined || answer === '' || answer === false || (Array.isArray(answer) && !answer.length)) {
        setError(korean ? `필수 질문에 답해 주세요: ${label(q)}` : `${tx('required')} ${label(q)}`);
        document.getElementById(q.id)?.scrollIntoView({behavior:'smooth',block:'center'}); return false;
      }
      if (q.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(answer))) { setError(tx('emailError')); return false; }
    }
    return true;
  };
  const next = () => { if (section && !validate(questions)) return; setStep(i => i+1); window.scrollTo(0,0); };
  const saveDraft = () => { localStorage.setItem(storageKey,JSON.stringify(answers)); setError(korean ? '임시 저장되었습니다.' : tx('saved')); };
  const submit = async () => {
    if (!validate(activeQuestions.filter(q => visible(q,answers)))) return;
    // The original PDF's consent text must be approved before public collection of real data.
    const consent = answers['q36_consent'];
    if (consent !== true) { setError(tx('consentError')); return; }
    setSaving(true); setError('');
    try {
      const fullName=normalized(answers['q1_name']).trim(); const parts=fullName.split(/\s+/);
      const email=normalized(answers['q35_contact_info']);
      const level=normalized(answers['q7_proficiency']);
      const format=normalized(answers['q21_class_format']).toLowerCase();
      const now=new Date().toISOString();
      const applicant: ApplicantInfo = {
        givenName: parts[0] || '', familyName: parts.slice(1).join(' ') || ' ', email,
        preferredContactMethod:'Email',contactLanguage:'English',countryOfResidence:'South Korea',
        cityRegion:normalized(answers['q22_location_area']),currentBackground:normalized(answers['q4_occupation']),
        primaryLanguage:normalized(answers['q16_instruction_language'])
      };
      const learningProfile: LearningProfile = {
        studiedBefore: !normalized(answers['q6_study_duration']).toLowerCase().includes('complete beginner'),
        studyDuration:normalized(answers['q6_study_duration']),selfAssessedLevel:classifyLevel(level),
        readingHangulComfort:level,speakingConfidence:level,reasonsForLearning:arr(answers['q8_reasons']),
        personalLearningGoal:normalized(answers['q9_future_goal']),skillsToFocusOn:arr(answers['q12_class_types']),
        preferredClassFormat: format.includes('hybrid') || format.includes('combination') ? 'Hybrid' : format.includes('online') ? 'Online' : format.includes('in-person') ? 'In person' : 'No preference',
        preferredLocation:normalized(answers['q22_location_area']),languageSupport:normalized(answers['q16_instruction_language']),
        preferredClassSize:normalized(answers['q19_class_size'])
      };
      const availability: AvailabilityInfo = {
        preferredStartDate:'',preferredFrequency:normalized(answers['q28_frequency']),
        timeSlots:[...arr(answers['q24_available_days']),...arr(answers['q25_available_times_of_day']),normalized(answers['q26_specific_schedule'])].filter(Boolean)
      };
      const data = {
        status:'submitted' as const,formVersionId:formTemplate.version,formTemplateId:formTemplate.id,
        answers:Object.fromEntries(activeQuestions.filter(q=>visible(q,answers)).map(q=>[q.id,answers[q.id] ?? ''])),
        // Snapshot ensures submitted answers remain interpretable if the form changes later.
        formSnapshot:{ version:formTemplate.version,sections:formTemplate.sections,questions:activeQuestions },
        applicant,learningProfile,availability,
        consents:{applicationProcessing:true,accuracyDeclaration:true,programUpdates:normalized(answers['q34_receive_updates']).toLowerCase()==='yes',consentedAt:now},
        additionalNotes:normalized(answers['q33_comments'])
      };
      const record=await submitApplication(data);
      localStorage.removeItem(storageKey); setCompleted(record); onSubmitted(record); window.scrollTo(0,0);
    } catch (e) { console.error(e); setError(applicantLang==='fr' ? fx('generalFailure') : e instanceof Error ? e.message : fx('generalFailure')); }
    finally { setSaving(false); }
  };
  const base='w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#008C50] focus:ring-2 focus:ring-emerald-100';
  const icons=[UserRound,MapPin,BookOpen,Target,CalendarDays,ShieldCheck];
  const stepTitles=sections.map(s => localizedSection(s,applicantLang).title);
  const currentTitle = step<sections.length ? stepTitles[step] : tx('reviewSubmit');
  const groupedQuestions = useMemo(() => {
    if (section?.id !== 'sec_4') return [{ title: '', items: questions }];
    const groups: { title: string; items: FormQuestion[] }[] = [];
    for (const q of questions) {
      const n = q.sourceQuestionNumber;
      const title = n >= 8 && n <= 14 ? 'goals' : n >= 15 && n <= 17 ? 'activities' : n >= 19 && n <= 23 ? 'classes' : 'other';
      let group = groups.find(g => g.title === title);
      if (!group) { group = { title, items: [] }; groups.push(group); }
      group.items.push(q);
    }
    return groups;
  }, [section, questions]);
  const groupLabel = (key: string) => ({
    goals: fx('goalsGroup'),
    activities: fx('activitiesGroup'),
    classes: fx('classesGroup'),
    other: fx('otherGroup')
  }[key] || key);
  const compactQuestion = (q: FormQuestion) => ['short_text','email','phone','number','date','dropdown','yes_no'].includes(q.type) || (q.type==='radio' && (q.optionsEn?.length ?? 0) <= 4);
  const renderQuestion=(q:FormQuestion) => {
    const value=answers[q.id], options=opts(q);
    const isSelected=(o:string)=>q.type==='checkbox'?arr(value).includes(o):value===o;
    const choice=(o:string, i:number, multiple:boolean)=>{
      const original=q.optionsEn?.[i] || o;
      const checked=isSelected(original);
      return <label key={`${q.id}-${i}`} className={`group flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition-all ${checked?'border-[#008C50] bg-[#EAF7EF] text-[#066838] shadow-sm ring-1 ring-[#008C50]/15':'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'}`}>
        <input type={multiple?'checkbox':'radio'} name={multiple?undefined:q.id} checked={checked} onChange={e=>multiple?set(q.id,e.target.checked?[...arr(value),original]:arr(value).filter(v=>v!==original)):set(q.id,original)} className="h-4 w-4 shrink-0 accent-[#008C50]"/>
        <span className="leading-snug">{o}</span>
      </label>;
    };
    const control = () => {
      if(q.type==='info') return <p className="text-sm leading-6 text-slate-600">{localizedQuestion(q,applicantLang).helpText}</p>;
      if(q.type==='consent') return <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${value===true?'border-emerald-300 bg-emerald-50':'border-slate-200 bg-slate-50'}`}><input className="mt-1 h-4 w-4 accent-[#008C50]" type="checkbox" checked={value===true} onChange={e=>set(q.id,e.target.checked)}/><span>{korean && q.helpTextKr ? q.helpTextKr : localizedQuestion(q,applicantLang).helpText || fx('consentLabel')}</span></label>;
      if(q.type==='checkbox') return <div className={`grid gap-2 ${options.length>2?'sm:grid-cols-2':''}`}>{options.map((o,i)=>choice(o,i,true))}</div>;
      if(q.type==='radio'||q.type==='yes_no') {const list=options.length?options:['Yes','No'];return <div className={`grid gap-2 ${list.length>2?'sm:grid-cols-2':''}`}>{list.map((o,i)=>choice(o,i,false))}</div>}
      if(q.type==='dropdown') return <select className={base} value={normalized(value)} onChange={e=>set(q.id,e.target.value)}><option value="">{tx('select')}</option>{options.map((o,i)=><option key={i} value={q.optionsEn?.[i]||o}>{o}</option>)}</select>;
      if(q.type==='long_text') return <textarea rows={3} className={base} value={normalized(value)} onChange={e=>set(q.id,e.target.value)} placeholder={applicantPlaceholder(applicantLang,q.sourceQuestionNumber,q.placeholderEn||'')}/>;
      return <input className={base} type={q.type==='short_text'||q.type==='phone'?'text':q.type} value={normalized(value)} onChange={e=>set(q.id,e.target.value)} placeholder={applicantPlaceholder(applicantLang,q.sourceQuestionNumber,q.placeholderEn||'')}/>;
    };
    return <div key={q.id} id={q.id} className={`min-w-0 py-5 sm:py-6 ${compactQuestion(q) ? '' : 'lg:col-span-2'}`}>
      <div className="mb-3 flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0 rounded-md bg-[#E7F6ED] px-2 py-1 text-[11px] font-bold text-[#008C50]">{sectionDisplayNumbers.get(q.id)}</span>
        <div className="min-w-0 flex-1">
          <label className="block text-sm font-semibold leading-6 text-[#26322B]">{label(q)} {q.required && <span className="ml-1 text-rose-600" aria-label="required">*</span>}</label>

          {localizedQuestion(q,applicantLang).helpText && q.type !== 'consent' && <p className="mt-1 text-xs leading-5 text-slate-500">{localizedQuestion(q,applicantLang).helpText}</p>}
        </div>
      </div>
      {control()}
    </div>;
  };
  const sectionIcon = icons[Math.min(step, icons.length - 1)] || ClipboardCheck;
  const SectionIcon = sectionIcon;
  const nextStep = () => { next(); };
  const previousStep = () => { setError(''); setStep(i => Math.max(0, i - 1)); window.scrollTo({top:0,behavior:'smooth'}); };
  const Footer = () => <footer className="border-t border-slate-200 bg-[#FCFDFC] px-5 py-4 sm:px-8 sm:py-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={previousStep} disabled={step===0} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft size={16}/>{tx('back')}</button>
        <button type="button" onClick={saveDraft} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-[#008C50] hover:text-[#008C50]"><Save size={16}/>{tx('save')}</button>
      </div>
      {step < sections.length ? <button type="button" onClick={nextStep} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#008C50] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#007342]">{step===sections.length-1?tx('reviewAnswers'):tx('continue')}<ArrowRight size={17}/></button> : <button type="button" disabled={saving} onClick={submit} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#008C50] px-6 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50">{saving?fx('submitting'):tx('submit')}<ArrowRight size={17}/></button>}
    </div>
    <p className="mt-3 text-xs text-slate-500">{fx('requiredHint')}</p>
  </footer>;
  if(completed) return <div className="mx-auto max-w-2xl px-4 py-20 text-center"><CheckCircle2 className="mx-auto mb-5 h-14 w-14 text-[#008C50]"/><h1 className="text-3xl font-bold">{tx('submitted')}</h1><p className="mt-4">{fx('keepReference')}</p><p className="my-5 text-xl font-bold">{completed.referenceNumber}</p><button onClick={onCancel} className="rounded-xl bg-[#008C50] px-6 py-3 font-semibold text-white">{tx('home')}</button></div>;
  return <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
    {applicantLang !== 'en' && (coverage.labels < coverage.total || coverage.options < coverage.total) &&
      <div role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {fx('translationPending')}
      </div>}
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <button onClick={onCancel} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#008C50]"><ArrowLeft size={16}/>{tx('home')}</button>
      <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">{tx('application')} · {activeQuestions.length} {tx('questions')} · {formTemplate.version}</span>
    </div>

    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="mb-1 text-xs font-bold uppercase tracking-[.13em] text-[#008C50]">Everlove Church</p><h1 className="text-xl font-bold tracking-tight text-[#26322B] sm:text-2xl">{korean?'한국어 수업 신청서':fx('title')}</h1><p className="mt-2 text-sm text-slate-500">{korean?'단계별로 신청서를 작성하고 임시 저장할 수 있습니다.':fx('subtitle')}</p></div>
        <span className="rounded-full bg-[#F3981B]/10 px-3 py-1.5 text-xs font-semibold text-amber-700">{step<sections.length?`${step+1} / ${sections.length}`:tx('reviewSubmit')}</span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{sections.map((s,i)=>{const Icon=icons[i]||BookOpen;const active=step===i,done=step>i;return <button type="button" key={s.id} onClick={()=>{if(i<=step){setStep(i);setError('');window.scrollTo(0,0)}}} disabled={i>step} className={`rounded-xl border px-3 py-3 text-left transition-all ${active?'border-[#008C50] bg-[#EAF7EF] ring-1 ring-[#008C50]/10':done?'border-emerald-200 bg-white hover:bg-emerald-50':'border-slate-100 bg-slate-50/60 text-slate-400'} ${i>step?'cursor-default':'cursor-pointer'}`}><div className="mb-2 flex items-center gap-1.5"><span className={`flex h-7 w-7 items-center justify-center rounded-lg ${active?'bg-[#008C50] text-white':done?'bg-emerald-100 text-[#008C50]':'bg-white text-slate-400'}`}>{done?<CheckCircle2 size={16}/>:<Icon size={15}/>}</span><span className="text-[10px] font-semibold uppercase tracking-wide">{tx('step')} {i+1}</span></div><span className="block text-xs font-semibold leading-4">{localizedSection(s,applicantLang).title}</span></button>})}</div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#008C50] transition-all" style={{width:`${Math.min(100,((step+1)/sections.length)*100)}%`}}/></div>
    </div>

    {/* One continuous form surface per section, borrowing the original Figma-inspired wizard layout. */}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label={currentTitle}>
      <header className="border-b border-slate-200 px-5 py-6 sm:px-8 sm:py-7">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-[.12em] text-[#008C50]">{step<sections.length?`${tx('section')} ${String(step+1).padStart(2,'0')}`:tx('finalReview')}</span><span className="text-xs text-slate-500">{step<sections.length?`${questions.length} ${tx('questions')}`:`${sections.length} ${korean?'섹션 완료':fx('completeSections')}`}</span></div>
        <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7F6ED] text-[#008C50]"><SectionIcon size={21}/></span><div><h2 className="text-xl font-bold leading-tight text-[#26322B] sm:text-2xl">{currentTitle}</h2>{step<sections.length&&<p className="mt-1 text-sm leading-6 text-slate-500">{localizedSection(section,applicantLang).description}</p>}</div></div>
      </header>
      {step<sections.length ? <div className="px-5 sm:px-8">
        {groupedQuestions.map((group,gi)=><div key={`${step}-${group.title}-${gi}`} className={gi>0?'border-t border-slate-200':''}>
          {group.title && <div className="pt-6"><h3 className="text-sm font-bold text-[#26322B]">{groupLabel(group.title)}</h3><p className="mt-1 text-xs text-slate-500">{group.items.length} {tx('questions')}</p></div>}
          <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2 lg:[&>div]:border-b lg:[&>div]:border-slate-100">{group.items.map(renderQuestion)}</div>
        </div>)}
        {questions.length===0&&<p className="py-10 text-sm text-slate-500">{fx('emptySection')}</p>}
      </div> : <div className="px-5 py-6 sm:px-8"><p className="mb-5 text-sm text-slate-500">{tx('check')}</p>{sections.map((s,i)=><div key={s.id} className="border-t border-slate-200 py-5"><div className="mb-3 flex items-center justify-between gap-2"><h3 className="font-semibold text-[#26322B]">{String(i+1).padStart(2,'0')} · {localizedSection(s,applicantLang).title}</h3><button type="button" onClick={()=>{setStep(i);window.scrollTo(0,0)}} className="text-sm font-semibold text-[#008C50] hover:underline">{tx('edit')}</button></div><div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">{activeQuestions.filter(q=>q.sectionId===s.id&&visible(q,answers)).sort((a,b)=>a.order-b.order).map(q=><div key={q.id} className="border-t border-slate-100 py-3 text-sm"><span className="block font-medium text-slate-700">{label(q)}</span><span className="mt-1 block text-slate-500">{q.type==='consent'?(answers[q.id]===true?fx('agreed'):fx('notAgreed')):Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).map(v=>{const i=q.optionsEn?.indexOf(v)??-1;return i>=0?opts(q)[i]||v:v}).join(', ') : (()=>{const v=normalized(answers[q.id]);const i=q.optionsEn?.indexOf(v)??-1;return i>=0?opts(q)[i]||v:v||'—'})()}</span></div>)}</div></div>)}</div>}
      {error&&<div role="alert" className={`mx-5 mb-5 flex items-start gap-2 rounded-xl border p-4 text-sm sm:mx-8 ${error.toLowerCase().includes('saved')||error.includes('저장')?'border-emerald-200 bg-emerald-50 text-emerald-800':'border-red-200 bg-red-50 text-red-700'}`}><AlertCircle size={18} className="shrink-0"/>{error}</div>}
      <Footer/>
    </section>
  </div>;
};
