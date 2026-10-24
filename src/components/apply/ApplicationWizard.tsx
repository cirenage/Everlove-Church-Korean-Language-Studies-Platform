import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FormTemplate, Application, ApplicationStatus } from '../../types';
import { submitApplication } from '../../services/applicationService';
import { DEMO_APPLICANTS } from '../../services/demoSeedService';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Save,
  HelpCircle,
  AlertCircle,
  FileText,
  User,
  MapPin,
  Sparkles,
  Target,
  Calendar,
  Lock,
  Edit,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface ApplicationWizardProps {
  formTemplate: FormTemplate;
  onSubmitted: (application: Application) => void;
  onCancel: () => void;
}

export const ApplicationWizard: React.FC<ApplicationWizardProps> = ({
  formTemplate,
  onSubmitted,
  onCancel,
}) => {
  const { user, profile } = useAuth();
  const { t, lang } = useLanguage();

  // Step 0 = Guide, Steps 1-6 = Questionnaire, Step 7 = Review, Step 8 = Submitted
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);

  // Form State initialized with defaults
  const [formData, setFormData] = useState({
    // Step 1: Personal & contact
    givenName: '',
    familyName: '',
    preferredName: '',
    dateOfBirth: '1997-04-18',
    email: user?.email || '',
    phone: '',
    preferredContactMethod: 'Email' as 'Email' | 'Phone',
    contactLanguage: 'English',

    // Step 2: Residence & background
    countryOfResidence: 'South Korea',
    cityRegion: 'Seoul',
    districtArea: '',
    arrivalInKorea: '2025-09-01',
    currentBackground: 'International student',
    primaryLanguage: 'English',

    // Step 3: Korean experience
    studiedBefore: true,
    studyDuration: 'Less than 6 months',
    previousLearningMethod: 'Self-study (apps & books)',
    selfAssessedLevel: 'Beginner' as 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced',
    readingHangulComfort: 'Slowly, with help',
    speakingConfidence: 'Greetings & short phrases',

    // Step 4: Goals & preferences
    reasonsForLearning: ['Daily life', 'Community conversation'] as string[],
    personalLearningGoal: 'Order a meal, ask for directions, and introduce myself with confidence.',
    skillsToFocusOn: ['Speaking', 'Listening'] as string[],
    preferredClassFormat: 'No preference' as 'In person' | 'Online' | 'No preference' | 'Hybrid',
    preferredLocation: '',
    languageSupport: 'English explanations',
    independentPracticeHours: '2–3 hours per week',

    // Step 5: Availability (KST Grid)
    preferredStartDate: '2026-11-09',
    preferredFrequency: 'Once per week',
    timeSlots: ['Tue 18:00–20:00', 'Thu 18:00–20:00', 'Sat 10:00–12:00'] as string[],
    instructorPreference: 'No preference',
    instructorNotes: 'Comfortable with any available instructor.',

    // Step 6: Additional & Consents
    additionalNotes: 'Please share lesson vocabulary in advance.',
    accessibilitySupport: 'Written instructions are helpful.',
    howYouFoundUs: 'Program welcome page',
    consentProcessing: true,
    consentAccuracy: true,
    consentUpdates: false,
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('everlove_app_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.warn('Could not parse saved draft:', e);
      }
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem('everlove_app_draft', JSON.stringify(formData));
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 3000);
  };

  const fillWithAveryExample = () => {
    const avery = DEMO_APPLICANTS[0];
    setFormData({
      givenName: avery.applicant.givenName,
      familyName: avery.applicant.familyName,
      preferredName: avery.applicant.preferredName || 'Avery',
      dateOfBirth: avery.applicant.dateOfBirth || '1997-04-18',
      email: avery.applicant.email,
      phone: avery.applicant.phone || '',
      preferredContactMethod: avery.applicant.preferredContactMethod,
      contactLanguage: avery.applicant.contactLanguage,
      countryOfResidence: avery.applicant.countryOfResidence,
      cityRegion: avery.applicant.cityRegion,
      districtArea: avery.applicant.districtArea || 'Mapo-gu (fictional)',
      arrivalInKorea: avery.applicant.arrivalInKorea || '2025-09-01',
      currentBackground: avery.applicant.currentBackground,
      primaryLanguage: avery.applicant.primaryLanguage,
      studiedBefore: avery.learningProfile.studiedBefore,
      studyDuration: avery.learningProfile.studyDuration || 'Less than 6 months',
      previousLearningMethod: avery.learningProfile.previousLearningMethod || 'Self-study (apps & books)',
      selfAssessedLevel: avery.learningProfile.selfAssessedLevel,
      readingHangulComfort: avery.learningProfile.readingHangulComfort,
      speakingConfidence: avery.learningProfile.speakingConfidence,
      reasonsForLearning: avery.learningProfile.reasonsForLearning,
      personalLearningGoal: avery.learningProfile.personalLearningGoal,
      skillsToFocusOn: avery.learningProfile.skillsToFocusOn,
      preferredClassFormat: avery.learningProfile.preferredClassFormat as any,
      preferredLocation: avery.learningProfile.preferredLocation || '',
      languageSupport: avery.learningProfile.languageSupport || 'English explanations',
      independentPracticeHours: avery.learningProfile.independentPracticeHours || '2–3 hours per week',
      preferredStartDate: avery.availability.preferredStartDate,
      preferredFrequency: avery.availability.preferredFrequency,
      timeSlots: avery.availability.timeSlots,
      instructorPreference: avery.availability.instructorPreference || 'No preference',
      instructorNotes: avery.availability.instructorNotes || 'Comfortable with any available instructor.',
      additionalNotes: avery.additionalNotes || 'Please share lesson vocabulary in advance.',
      accessibilitySupport: avery.accessibilitySupport || 'Written instructions are helpful.',
      howYouFoundUs: avery.howYouFoundUs || 'Program welcome page',
      consentProcessing: true,
      consentAccuracy: true,
      consentUpdates: false,
    });
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 3000);
  };

  const handleTimeSlotToggle = (slot: string) => {
    setFormData((prev) => {
      const exists = prev.timeSlots.includes(slot);
      return {
        ...prev,
        timeSlots: exists ? prev.timeSlots.filter((s) => s !== slot) : [...prev.timeSlots, slot],
      };
    });
  };

  const handleArrayToggle = (field: 'reasonsForLearning' | 'skillsToFocusOn', item: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      const exists = arr.includes(item);
      return {
        ...prev,
        [field]: exists ? arr.filter((x) => x !== item) : [...arr, item],
      };
    });
  };

  const validateStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 1) {
      if (!formData.givenName.trim() || !formData.familyName.trim()) {
        setValidationError('Please enter your given name and family name.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setValidationError('Please enter a valid email address so our team can contact you.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.countryOfResidence.trim() || !formData.cityRegion.trim()) {
        setValidationError('Please provide your country of residence and city/region.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.personalLearningGoal.trim()) {
        setValidationError('Please describe a small, meaningful learning goal.');
        return false;
      }
    } else if (step === 5) {
      if (formData.timeSlots.length === 0) {
        setValidationError('Please select at least one time window in the weekly schedule.');
        return false;
      }
    } else if (step === 6) {
      if (!formData.consentProcessing || !formData.consentAccuracy) {
        setValidationError('Please agree to application processing and the accuracy declaration to proceed.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitFinal = async () => {
    if (!validateStep(6)) return;

    try {
      setIsSubmitting(true);
      const isDemo = true; // In MVP demo mode, tagged as demo
      const newApp = await submitApplication({
        formVersionId: formTemplate.id,
        isDemo,
        status: 'submitted',
        applicant: {
          givenName: formData.givenName,
          familyName: formData.familyName,
          preferredName: formData.preferredName,
          dateOfBirth: formData.dateOfBirth,
          email: formData.email,
          phone: formData.phone,
          preferredContactMethod: formData.preferredContactMethod,
          contactLanguage: formData.contactLanguage,
          countryOfResidence: formData.countryOfResidence,
          cityRegion: formData.cityRegion,
          districtArea: formData.districtArea,
          arrivalInKorea: formData.arrivalInKorea,
          currentBackground: formData.currentBackground,
          primaryLanguage: formData.primaryLanguage,
        },
        learningProfile: {
          studiedBefore: formData.studiedBefore,
          studyDuration: formData.studyDuration,
          previousLearningMethod: formData.previousLearningMethod,
          selfAssessedLevel: formData.selfAssessedLevel,
          readingHangulComfort: formData.readingHangulComfort,
          speakingConfidence: formData.speakingConfidence,
          reasonsForLearning: formData.reasonsForLearning,
          personalLearningGoal: formData.personalLearningGoal,
          skillsToFocusOn: formData.skillsToFocusOn,
          preferredClassFormat: formData.preferredClassFormat,
          preferredLocation: formData.preferredLocation,
          languageSupport: formData.languageSupport,
          independentPracticeHours: formData.independentPracticeHours,
        },
        availability: {
          preferredStartDate: formData.preferredStartDate,
          preferredFrequency: formData.preferredFrequency,
          timeSlots: formData.timeSlots,
          instructorPreference: formData.instructorPreference,
          instructorNotes: formData.instructorNotes,
        },
        consents: {
          applicationProcessing: formData.consentProcessing,
          accuracyDeclaration: formData.consentAccuracy,
          programUpdates: formData.consentUpdates,
          consentedAt: new Date().toISOString(),
        },
        additionalNotes: formData.additionalNotes,
        accessibilitySupport: formData.accessibilitySupport,
        howYouFoundUs: formData.howYouFoundUs,
      });

      // Clear draft
      localStorage.removeItem('everlove_app_draft');
      setSubmittedApp(newApp);
      setCurrentStep(8); // confirmation screen
      onSubmitted(newApp);
    } catch (err) {
      console.error(err);
      setValidationError('Submission failed. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step names for progress header
  const stepTitles = [
    'Guide',
    'Personal & contact',
    'Residence & background',
    'Korean experience',
    'Goals & preferences',
    'Availability',
    'Privacy & consent',
    'Review',
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeWindows = ['10:00–12:00', '14:00–16:00', '18:00–20:00'];

  return (
    <div className="min-h-screen bg-[#F5F7F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Control Bar with Example Fill */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#777777] uppercase tracking-wider">
              KOREAN LANGUAGE · LEARNER APPLICATION
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-[#008C50] font-medium bg-[#E8F5E9] px-2 py-0.5 rounded-full">
              Form Version {formTemplate.version}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fillWithAveryExample}
              className="text-xs font-medium bg-[#FAFBF9] hover:bg-gray-100 text-[#333] border border-gray-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Populate with Avery Example data from the Figma screen designs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F3981B]" />
              <span>Fill Example Data (Avery)</span>
            </button>

            <button
              onClick={saveDraft}
              className="text-xs font-medium text-[#555] hover:text-[#008C50] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
          </div>
        </div>

        {/* Step Progress Tracker (Figma layout: 6 steps) */}
        {currentStep >= 1 && currentStep <= 7 && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 mb-8 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#777] mb-3">
              <span className="font-semibold text-[#333]">YOUR APPLICATION</span>
              <span>
                {currentStep <= 6
                  ? `Step ${currentStep} of 6 · Review before submitting`
                  : '6 of 6 sections complete · Ready to submit'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((s) => {
                const isComplete = currentStep > s;
                const isCurrent = currentStep === s;
                return (
                  <div
                    key={s}
                    onClick={() => {
                      if (currentStep > s || validateStep(currentStep)) setCurrentStep(s);
                    }}
                    className={`cursor-pointer rounded-lg p-2.5 border transition-all text-left ${
                      isCurrent
                        ? 'border-[#008C50] bg-[#E8F5E9]/50 shadow-xs'
                        : isComplete
                        ? 'border-gray-200 bg-white hover:border-[#4AA83C]'
                        : 'border-gray-100 bg-gray-50/70 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1">
                      {isComplete ? (
                        <span className="text-[#008C50] flex items-center gap-0.5">
                          ✓ COMPLETE
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[#008C50] font-bold">● CURRENT</span>
                      ) : (
                        <span className="text-gray-400">{s} UPCOMING</span>
                      )}
                    </div>
                    <div className="text-xs font-semibold truncate text-[#333]">
                      {stepTitles[s]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {draftSavedToast && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Application draft saved to browser storage.
            </span>
            <button onClick={() => setDraftSavedToast(false)} className="text-emerald-700 font-bold">
              ×
            </button>
          </div>
        )}

        {/* Validation Error Message */}
        {validationError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-4 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Please check the required information</p>
              <p className="text-xs mt-0.5">{validationError}</p>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 0: APPLICATION GUIDE (Figma Page 2)
           ========================================================================= */}
        {currentStep === 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
                KOREAN LANGUAGE · LEARNER APPLICATION
              </span>
              <h2 className="text-3xl font-bold text-[#333] mt-2 mb-3">
                Before you start your application
              </h2>
              <p className="text-sm text-[#666]">
                Get to know the application process, what to prepare, and what still needs to be confirmed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAFBF9] p-6 rounded-xl border border-gray-200">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#777] mb-1">
                  Intended learners
                </h4>
                <p className="text-sm font-semibold text-[#333]">
                  Foreign residents interested in Korean
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#777] mb-1">
                  Learning levels
                </h4>
                <p className="text-sm font-semibold text-[#333]">
                  Beginner through intermediate needs
                </p>
              </div>
            </div>

            {/* Provisional Details Warning */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#333]">Program details to be confirmed</h3>
              <p className="text-xs text-[#777]">
                This concept is not an enrollment announcement. Please check the final program information before applying.
              </p>
              <div className="space-y-2 text-xs divide-y divide-gray-100 border border-gray-200 rounded-xl p-4 bg-white">
                <div className="flex justify-between py-1.5">
                  <span className="text-[#555]">Eligibility & participation requirements</span>
                  <span className="text-[#777] font-medium">To be confirmed by the church</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#555]">Class schedule, location & enrollment dates</span>
                  <span className="text-[#777] font-medium">To be confirmed</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#555]">Fees & participation policies</span>
                  <span className="text-[#777] font-medium">To be confirmed</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#555]">Application review timeline</span>
                  <span className="text-[#777] font-medium">To be confirmed</span>
                </div>
              </div>
            </div>

            {/* 3 Steps Guide */}
            <div>
              <h3 className="text-base font-bold text-[#333] mb-4">How to complete your application</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-[#FAFBF9]">
                  <span className="text-xs font-bold text-[#008C50] bg-[#E8F5E9] px-2 py-0.5 rounded">01</span>
                  <h4 className="font-semibold text-sm text-[#333] mt-2 mb-1">Prepare your information</h4>
                  <p className="text-xs text-[#666]">Have contact email, Korean level description, and possible study times ready.</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 bg-[#FAFBF9]">
                  <span className="text-xs font-bold text-[#008C50] bg-[#E8F5E9] px-2 py-0.5 rounded">02</span>
                  <h4 className="font-semibold text-sm text-[#333] mt-2 mb-1">Complete six short sections</h4>
                  <p className="text-xs text-[#666]">Fields marked * are required. Use Save Draft whenever you need a pause.</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 bg-[#FAFBF9]">
                  <span className="text-xs font-bold text-[#008C50] bg-[#E8F5E9] px-2 py-0.5 rounded">03</span>
                  <h4 className="font-semibold text-sm text-[#333] mt-2 mb-1">Review, then submit</h4>
                  <p className="text-xs text-[#666]">Check answers on the review page before submitting to administrators.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={onCancel}
                className="text-xs font-medium text-[#777] hover:text-[#333]"
              >
                Return to home
              </button>
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto bg-[#008C50] hover:bg-[#007340] text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Start Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 1: PERSONAL & CONTACT (Figma Page 3)
           ========================================================================= */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
                  SECTION 01
                </span>
                <span className="text-xs text-[#777]">* Required field</span>
              </div>
              <h2 className="text-2xl font-bold text-[#333] mt-1">Let's start with you</h2>
              <p className="text-xs text-[#666] mt-1">
                Share the name you use and how the application team can reach you.
              </p>
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#333]">Personal information</h3>
              <p className="text-xs text-[#777]">Use your name as you would like it to appear on your application.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Given name *</label>
                  <input
                    type="text"
                    value={formData.givenName}
                    onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                    placeholder="e.g. Avery"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Family name *</label>
                  <input
                    type="text"
                    value={formData.familyName}
                    onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                    placeholder="e.g. Example"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Preferred name · Optional</label>
                  <input
                    type="text"
                    value={formData.preferredName}
                    onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                    placeholder="What would you like us to call you?"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Date of birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-[#333]">Contact information</h3>
              <p className="text-xs text-[#777]">A reliable email helps the team follow up if more information is needed.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Email address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="learner@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Phone number · Optional</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Include country code if applicable"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Preferred contact method *</label>
                  <div className="flex gap-4 mt-2">
                    {['Email', 'Phone'].map((method) => (
                      <label key={method} className="flex items-center gap-2 text-xs font-medium text-[#333] cursor-pointer">
                        <input
                          type="radio"
                          name="preferredContactMethod"
                          checked={formData.preferredContactMethod === method}
                          onChange={() => setFormData({ ...formData, preferredContactMethod: method as any })}
                          className="accent-[#008C50]"
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Contact language *</label>
                  <select
                    value={formData.contactLanguage}
                    onChange={(e) => setFormData({ ...formData, contactLanguage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                  >
                    <option value="English">English</option>
                    <option value="Korean">한국어 (Korean)</option>
                    <option value="Chinese">中文 (Chinese)</option>
                    <option value="Japanese">日本語 (Japanese)</option>
                    <option value="Vietnamese">Tiếng Việt (Vietnamese)</option>
                  </select>
                  <p className="text-[11px] text-[#777] mt-1">This is your communication preference, not a class language guarantee.</p>
                </div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={handlePrev}
                className="text-xs font-medium text-[#555] hover:text-[#333] px-4 py-2 border border-gray-200 rounded-lg"
              >
                Previous
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveDraft}
                  className="text-xs font-medium text-[#555] hover:text-[#008C50] px-4 py-2 border border-gray-200 rounded-lg"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleNext}
                  className="bg-[#008C50] hover:bg-[#007340] text-white px-6 py-2.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: RESIDENCE & BACKGROUND (Figma Page 4)
           ========================================================================= */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
                  SECTION 02
                </span>
                <span className="text-xs text-[#777]">* Required field</span>
              </div>
              <h2 className="text-2xl font-bold text-[#333] mt-1">Tell us a little about your background</h2>
              <p className="text-xs text-[#666] mt-1">
                Your location and language background help us understand your learning context.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#333]">Where you live</h3>
              <p className="text-xs text-[#777]">Share your general area only. A street address is not needed in this proposed form.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Country of residence *</label>
                  <select
                    value={formData.countryOfResidence}
                    onChange={(e) => setFormData({ ...formData, countryOfResidence: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                  >
                    <option value="South Korea">South Korea (대한민국)</option>
                    <option value="Overseas / Relocating soon">Overseas / Relocating soon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">City / region *</label>
                  <select
                    value={formData.cityRegion}
                    onChange={(e) => setFormData({ ...formData, cityRegion: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                  >
                    <option value="Seoul">Seoul</option>
                    <option value="Daejeon">Daejeon (대전)</option>
                    <option value="Sejong">Sejong (세종)</option>
                    <option value="Gyeonggi-do">Gyeonggi-do</option>
                    <option value="Busan">Busan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">District / area · Optional</label>
                  <input
                    type="text"
                    value={formData.districtArea}
                    onChange={(e) => setFormData({ ...formData, districtArea: e.target.value })}
                    placeholder="e.g. Yuseong-gu, Mapo-gu"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                  <p className="text-[11px] text-[#777] mt-1">General area only; do not include a full address.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Arrival in Korea · Optional</label>
                  <input
                    type="date"
                    value={formData.arrivalInKorea}
                    onChange={(e) => setFormData({ ...formData, arrivalInKorea: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-[#333]">Your everyday context</h3>
              <p className="text-xs text-[#777]">Choose the description closest to your current situation.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Current background *</label>
                  <select
                    value={formData.currentBackground}
                    onChange={(e) => setFormData({ ...formData, currentBackground: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                  >
                    <option value="International student">International student</option>
                    <option value="Employee">Employee (직장인)</option>
                    <option value="Researcher or professor">Researcher or professor (연구원/교수)</option>
                    <option value="Business owner or self-employed">Business owner or self-employed</option>
                    <option value="Homemaker">Homemaker (주부)</option>
                    <option value="Job seeker">Job seeker</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Primary language *</label>
                  <input
                    type="text"
                    value={formData.primaryLanguage}
                    onChange={(e) => setFormData({ ...formData, primaryLanguage: e.target.value })}
                    placeholder="e.g. English, Vietnamese, Spanish"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                  <p className="text-[11px] text-[#777] mt-1">The language you use most comfortably.</p>
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <div className="bg-[#FAFBF9] border border-gray-200 rounded-xl p-4 flex items-start gap-2.5 text-xs text-[#666]">
              <Lock className="w-4 h-4 text-[#008C50] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#333]">Only the information needed: </span>
                Please do not include alien registration numbers, passport numbers, immigration documents, or other sensitive personal identification.
              </div>
            </div>

            {/* Step Navigation */}
            <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={handlePrev}
                className="text-xs font-medium text-[#555] hover:text-[#333] px-4 py-2 border border-gray-200 rounded-lg"
              >
                Previous
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveDraft}
                  className="text-xs font-medium text-[#555] hover:text-[#008C50] px-4 py-2 border border-gray-200 rounded-lg"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleNext}
                  className="bg-[#008C50] hover:bg-[#007340] text-white px-6 py-2.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: KOREAN EXPERIENCE & PROFICIENCY (Figma Page 5)
           ========================================================================= */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
                  SECTION 03
                </span>
                <span className="text-xs text-[#777]">* Required field</span>
              </div>
              <h2 className="text-2xl font-bold text-[#333] mt-1">Where are you with Korean today?</h2>
              <p className="text-xs text-[#666] mt-1">
                An honest starting point helps. This is a self-assessment, not a test or a placement decision.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#333]">Your learning experience</h3>

              <div>
                <label className="block text-xs font-semibold text-[#444] mb-2">Have you studied Korean before? *</label>
                <div className="flex gap-4">
                  {[true, false].map((val) => (
                    <label key={String(val)} className="flex items-center gap-2 text-xs font-medium text-[#333] cursor-pointer">
                      <input
                        type="radio"
                        name="studiedBefore"
                        checked={formData.studiedBefore === val}
                        onChange={() => setFormData({ ...formData, studiedBefore: val })}
                        className="accent-[#008C50]"
                      />
                      <span>{val ? 'Yes' : 'No'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Study duration *</label>
                  <select
                    value={formData.studyDuration}
                    onChange={(e) => setFormData({ ...formData, studyDuration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                  >
                    <option value="I am a complete beginner in Korean.">I am a complete beginner</option>
                    <option value="Less than 6 months">Less than 6 months</option>
                    <option value="6 months to less than 1 year">6 months to less than 1 year</option>
                    <option value="1–3 years">1–3 years</option>
                    <option value="More than 3 years">More than 3 years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Previous learning method *</label>
                  <select
                    value={formData.previousLearningMethod}
                    onChange={(e) => setFormData({ ...formData, previousLearningMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                  >
                    <option value="Self-study (apps & books)">Self-study (apps & books)</option>
                    <option value="Language academy / Hagwon">Language academy / Hagwon</option>
                    <option value="University course">University course</option>
                    <option value="Private tutoring">Private tutoring</option>
                    <option value="None / First time">None / First time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Self-assessed Level cards matching Figma */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-[#333]">Your current confidence</h3>
              <p className="text-xs text-[#777]">Choose the level that feels closest. You can still apply if you are unsure.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    level: 'Beginner',
                    desc: 'I know a few words and am learning Hangul.',
                  },
                  {
                    level: 'Elementary',
                    desc: 'I can use simple everyday sentences.',
                  },
                  {
                    level: 'Intermediate',
                    desc: 'I can share ideas on familiar topics.',
                  },
                ].map((item) => {
                  const isSelected = formData.selfAssessedLevel === item.level;
                  return (
                    <div
                      key={item.level}
                      onClick={() => setFormData({ ...formData, selfAssessedLevel: item.level as any })}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isSelected
                          ? 'border-[#008C50] bg-[#E8F5E9]/40 ring-2 ring-[#008C50]/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-[#333]">{item.level}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#008C50] bg-[#008C50]' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-xs text-[#666] leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Sub-skills: Hangul & Speaking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-2">How comfortably can you read Hangul? *</label>
                  <div className="space-y-2">
                    {['Not yet', 'Slowly, with help', 'Comfortably'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs text-[#333] cursor-pointer">
                        <input
                          type="radio"
                          name="readingHangulComfort"
                          checked={formData.readingHangulComfort === opt}
                          onChange={() => setFormData({ ...formData, readingHangulComfort: opt })}
                          className="accent-[#008C50]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Speaking confidence *</label>
                  <select
                    value={formData.speakingConfidence}
                    onChange={(e) => setFormData({ ...formData, speakingConfidence: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                  >
                    <option value="Greetings & short phrases">Greetings & short phrases</option>
                    <option value="Simple sentences on familiar topics">Simple sentences on familiar topics</option>
                    <option value="Can manage everyday conversation">Can manage everyday conversation</option>
                    <option value="Not yet confident without translation app">Not yet confident without translation app</option>
                  </select>
                  <p className="text-[11px] text-[#777] mt-1">Think about what you can do without a translation app.</p>
                </div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={handlePrev}
                className="text-xs font-medium text-[#555] hover:text-[#333] px-4 py-2 border border-gray-200 rounded-lg"
              >
                Previous
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveDraft}
                  className="text-xs font-medium text-[#555] hover:text-[#008C50] px-4 py-2 border border-gray-200 rounded-lg"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleNext}
                  className="bg-[#008C50] hover:bg-[#007340] text-white px-6 py-2.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: LEARNING GOALS & PREFERENCES (Figma Page 6)
           ========================================================================= */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
                  SECTION 04
                </span>
                <span className="text-xs text-[#777]">* Required field</span>
              </div>
              <h2 className="text-2xl font-bold text-[#333] mt-1">What would you like Korean to open up?</h2>
              <p className="text-xs text-[#666] mt-1">
                Tell us what matters to you, so your learning needs are clear from the start.
              </p>
            </div>

            {/* Reasons for learning checkboxes */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#333]">Your reasons and goals</h3>
              <p className="text-xs text-[#777]">Choose all that apply, then describe a small, meaningful goal in your own words.</p>

              <div>
                <label className="block text-xs font-semibold text-[#444] mb-2">Reasons for learning Korean *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    'Daily life',
                    'Community conversation',
                    'Work',
                    'Further study',
                    'Korean culture',
                    'TOPIK prep',
                    'Church / Faith',
                    'Other',
                  ].map((reason) => {
                    const isChecked = formData.reasonsForLearning.includes(reason);
                    return (
                      <label
                        key={reason}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked ? 'border-[#008C50] bg-[#E8F5E9]/50 font-medium' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleArrayToggle('reasonsForLearning', reason)}
                          className="accent-[#008C50]"
                        />
                        <span>{reason}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444] mb-1">Personal learning goal *</label>
                <textarea
                  rows={3}
                  value={formData.personalLearningGoal}
                  onChange={(e) => setFormData({ ...formData, personalLearningGoal: e.target.value })}
                  placeholder="Order a meal, ask for directions, and introduce myself with confidence."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                />
                <p className="text-[11px] text-[#777] mt-1">
                  For example: describe something you would like to do more confidently in Korean.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444] mb-2">Skills to focus on *</label>
                <div className="flex flex-wrap gap-4">
                  {['Speaking', 'Listening', 'Reading', 'Writing'].map((skill) => {
                    const isChecked = formData.skillsToFocusOn.includes(skill);
                    return (
                      <label key={skill} className="flex items-center gap-2 text-xs font-medium text-[#333] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleArrayToggle('skillsToFocusOn', skill)}
                          className="accent-[#008C50]"
                        />
                        <span>{skill}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Learning Preferences */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-[#333]">Your learning preferences</h3>
              <p className="text-xs text-[#777]">Preferences guide a conversation; available arrangements may differ.</p>

              <div>
                <label className="block text-xs font-semibold text-[#444] mb-2">Preferred class format *</label>
                <div className="flex flex-wrap gap-4">
                  {['In person', 'Online', 'No preference'].map((fmt) => (
                    <label key={fmt} className="flex items-center gap-2 text-xs font-medium text-[#333] cursor-pointer">
                      <input
                        type="radio"
                        name="preferredClassFormat"
                        checked={formData.preferredClassFormat === fmt}
                        onChange={() => setFormData({ ...formData, preferredClassFormat: fmt as any })}
                        className="accent-[#008C50]"
                      />
                      <span>{fmt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Language support · Optional</label>
                  <select
                    value={formData.languageSupport}
                    onChange={(e) => setFormData({ ...formData, languageSupport: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                  >
                    <option value="English explanations">English explanations</option>
                    <option value="Korean only">Korean only</option>
                    <option value="Chinese explanations">Chinese explanations</option>
                    <option value="Japanese explanations">Japanese explanations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Independent practice *</label>
                  <select
                    value={formData.independentPracticeHours}
                    onChange={(e) => setFormData({ ...formData, independentPracticeHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                  >
                    <option value="1 hour per week">1 hour per week</option>
                    <option value="2–3 hours per week">2–3 hours per week</option>
                    <option value="4–5 hours per week">4–5 hours per week</option>
                    <option value="6+ hours per week">6+ hours per week</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={handlePrev}
                className="text-xs font-medium text-[#555] hover:text-[#333] px-4 py-2 border border-gray-200 rounded-lg"
              >
                Previous
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveDraft}
                  className="text-xs font-medium text-[#555] hover:text-[#008C50] px-4 py-2 border border-gray-200 rounded-lg"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleNext}
                  className="bg-[#008C50] hover:bg-[#007340] text-white px-6 py-2.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 5: AVAILABILITY & INSTRUCTOR PREFERENCES (Figma Page 7)
           ========================================================================= */}
        {currentStep === 5 && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
                  SECTION 05
                </span>
                <span className="text-xs text-[#777]">* Required field</span>
              </div>
              <h2 className="text-2xl font-bold text-[#333] mt-1">Find times that could work for you</h2>
              <p className="text-xs text-[#666] mt-1">
                Share your availability and optional instructor preferences. Matching depends on instructor availability.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#333]">Your availability</h3>
                <span className="text-xs text-[#008C50] font-medium bg-[#E8F5E9] px-2.5 py-1 rounded-md">
                  Time zone: Korea Standard Time (KST, UTC+9)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Preferred start date *</label>
                  <input
                    type="date"
                    value={formData.preferredStartDate}
                    onChange={(e) => setFormData({ ...formData, preferredStartDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                  <p className="text-[11px] text-[#777] mt-1">A preference only, not a confirmed class start.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Preferred frequency *</label>
                  <select
                    value={formData.preferredFrequency}
                    onChange={(e) => setFormData({ ...formData, preferredFrequency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                  >
                    <option value="Once per week">Once per week</option>
                    <option value="Twice a week">Twice a week</option>
                    <option value="Three or more times a week">Three or more times a week</option>
                    <option value="Flexible">Flexible, depending on schedule</option>
                  </select>
                </div>
              </div>

              {/* Weekly Timetable Grid Matrix matching Figma Page 7 */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#444] mb-1">Available times *</label>
                <p className="text-[11px] text-[#777] mb-3">
                  Select all time windows that could work. These are preferences, not published class times.
                </p>

                <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-2xs">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-2.5 px-3 font-semibold text-[#555] text-left">Time window</th>
                        {daysOfWeek.map((day) => (
                          <th key={day} className="py-2.5 px-2 font-semibold text-[#555]">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {timeWindows.map((tw) => (
                        <tr key={tw} className="hover:bg-gray-50/50">
                          <td className="py-3 px-3 font-medium text-[#444] text-left whitespace-nowrap bg-gray-50/30">
                            {tw}
                          </td>
                          {daysOfWeek.map((day) => {
                            const slotKey = `${day} ${tw}`;
                            const isChecked = formData.timeSlots.includes(slotKey);
                            return (
                              <td key={slotKey} className="py-3 px-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTimeSlotToggle(slotKey)}
                                  className="w-4 h-4 accent-[#008C50] cursor-pointer"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {formData.timeSlots.length > 0 && (
                  <div className="mt-3 p-3 bg-[#FAFBF9] rounded-lg border border-gray-200 text-xs">
                    <span className="font-semibold text-[#008C50]">Selected slots: </span>
                    <span className="text-[#555]">{formData.timeSlots.join('; ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor preferences */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-[#333]">Instructor preferences</h3>
              <p className="text-xs text-[#777]">Optional and subject to availability. Leaving a preference open may allow more matching options.</p>

              <div>
                <label className="block text-xs font-semibold text-[#444] mb-1">Instructor preference · Optional</label>
                <select
                  value={formData.instructorPreference}
                  onChange={(e) => setFormData({ ...formData, instructorPreference: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                >
                  <option value="No preference">No preference</option>
                  <option value="Experienced with beginners">Experienced with complete beginners</option>
                  <option value="Business/academic focus">Focus on business or academic Korean</option>
                  <option value="Female instructor">Female instructor preferred</option>
                  <option value="Male instructor">Male instructor preferred</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444] mb-1">Instructor notes · Optional</label>
                <input
                  type="text"
                  value={formData.instructorNotes}
                  onChange={(e) => setFormData({ ...formData, instructorNotes: e.target.value })}
                  placeholder="Comfortable with any available instructor."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                />
              </div>
            </div>

            {/* Step Navigation */}
            <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={handlePrev}
                className="text-xs font-medium text-[#555] hover:text-[#333] px-4 py-2 border border-gray-200 rounded-lg"
              >
                Previous
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveDraft}
                  className="text-xs font-medium text-[#555] hover:text-[#008C50] px-4 py-2 border border-gray-200 rounded-lg"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleNext}
                  className="bg-[#008C50] hover:bg-[#007340] text-white px-6 py-2.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 6: ADDITIONAL INFO, PRIVACY & CONSENT (Figma Page 8)
           ========================================================================= */}
        {currentStep === 6 && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
                  SECTION 06
                </span>
                <span className="text-xs text-[#777]">* Required field</span>
              </div>
              <h2 className="text-2xl font-bold text-[#333] mt-1">A few final details before review</h2>
              <p className="text-xs text-[#666] mt-1">
                Add anything that would help your learning, then review the provisional privacy and consent information.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#333]">Anything else you would like us to know?</h3>
              <p className="text-xs text-[#777]">These questions are optional. Share learning-related information only.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Additional information · Optional</label>
                  <textarea
                    rows={3}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    placeholder="Please share lesson vocabulary in advance."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Accessibility / learning support · Optional</label>
                  <textarea
                    rows={3}
                    value={formData.accessibilitySupport}
                    onChange={(e) => setFormData({ ...formData, accessibilitySupport: e.target.value })}
                    placeholder="Written instructions are helpful."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444] mb-1">How you found us · Optional</label>
                <select
                  value={formData.howYouFoundUs}
                  onChange={(e) => setFormData({ ...formData, howYouFoundUs: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#008C50] focus:ring-1 focus:ring-[#008C50] outline-none bg-white"
                >
                  <option value="Program welcome page">Program welcome page</option>
                  <option value="Church member recommendation">Church member recommendation</option>
                  <option value="University notice / campus poster">University notice / campus poster</option>
                  <option value="Social media / online search">Social media / online search</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Privacy Box */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-[#333]">Privacy information</h3>
              <div className="bg-[#FAFBF9] border border-gray-200 rounded-xl p-5 text-xs text-[#555] space-y-2">
                <p>
                  The proposed purpose is application review and possible instructor matching by authorized Everlove Church administrators. Access and any sharing with instructors must be limited by the final approved policy.
                </p>
                <p className="text-[#777]">
                  Data retention, applicant rights, withdrawal procedures, the responsible contact, and the full privacy policy are to be confirmed by the church committee.
                </p>
              </div>

              {/* Consents */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer bg-white">
                  <input
                    type="checkbox"
                    checked={formData.consentProcessing}
                    onChange={(e) => setFormData({ ...formData, consentProcessing: e.target.checked })}
                    className="w-4 h-4 accent-[#008C50] shrink-0 mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#333]">Application processing REQUIRED *</span>
                    <p className="text-[#666] mt-0.5">
                      I consent to the use of my application information for application review and possible instructor matching.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer bg-white">
                  <input
                    type="checkbox"
                    checked={formData.consentAccuracy}
                    onChange={(e) => setFormData({ ...formData, consentAccuracy: e.target.checked })}
                    className="w-4 h-4 accent-[#008C50] shrink-0 mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#333]">Accuracy declaration REQUIRED *</span>
                    <p className="text-[#666] mt-0.5">
                      I confirm that the information I have provided is accurate to the best of my knowledge.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer bg-white">
                  <input
                    type="checkbox"
                    checked={formData.consentUpdates}
                    onChange={(e) => setFormData({ ...formData, consentUpdates: e.target.checked })}
                    className="w-4 h-4 accent-[#008C50] shrink-0 mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-[#555]">Program updates OPTIONAL</span>
                    <p className="text-[#777] mt-0.5">
                      I would like to receive optional program news and future learning opportunities. (This does not affect application processing).
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={handlePrev}
                className="text-xs font-medium text-[#555] hover:text-[#333] px-4 py-2 border border-gray-200 rounded-lg"
              >
                Previous
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveDraft}
                  className="text-xs font-medium text-[#555] hover:text-[#008C50] px-4 py-2 border border-gray-200 rounded-lg"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => {
                    if (validateStep(6)) setCurrentStep(7);
                  }}
                  className="bg-[#008C50] hover:bg-[#007340] text-white px-6 py-2.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-2"
                >
                  <span>Review Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 7: REVIEW APPLICATION (Figma Page 9)
           ========================================================================= */}
        {currentStep === 7 && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8">
            <div className="border-b border-gray-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
                KOREAN LANGUAGE · LEARNER APPLICATION
              </span>
              <h2 className="text-2xl font-bold text-[#333] mt-1">Review your application</h2>
              <p className="text-xs text-[#666] mt-1">
                Take a moment to check every answer. Use Edit on any section to make a change before submitting.
              </p>
            </div>

            {/* Ready summary banner */}
            <div className="bg-[#E8F5E9]/60 border border-[#A7F3D0] rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#008C50]">Your application is ready for review</h4>
                <p className="text-xs text-[#555] mt-0.5">
                  All proposed required fields are complete. Please check your contact details, learning preferences, and selected availability before submitting.
                </p>
              </div>
              <span className="text-xs font-bold text-[#008C50] bg-white px-3 py-1 rounded-full border border-[#008C50]/20 shrink-0 ml-2">
                6 sections complete
              </span>
            </div>

            {/* Section 1 Card */}
            <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFBF9]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-xs font-bold text-[#333]">01 Personal & contact information</span>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#008C50] hover:underline flex items-center gap-1 font-medium"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
                <div>
                  <span className="text-[#777] block">Given name</span>
                  <span className="font-medium text-[#333]">{formData.givenName || '—'}</span>
                </div>
                <div>
                  <span className="text-[#777] block">Family name</span>
                  <span className="font-medium text-[#333]">{formData.familyName || '—'}</span>
                </div>
                <div>
                  <span className="text-[#777] block">Date of birth</span>
                  <span className="font-medium text-[#333]">{formData.dateOfBirth || '—'}</span>
                </div>
                <div>
                  <span className="text-[#777] block">Email</span>
                  <span className="font-medium text-[#333]">{formData.email || '—'}</span>
                </div>
              </div>
            </div>

            {/* Section 2 Card */}
            <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFBF9]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-xs font-bold text-[#333]">02 Residence & background</span>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-[#008C50] hover:underline flex items-center gap-1 font-medium"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
                <div>
                  <span className="text-[#777] block">Country</span>
                  <span className="font-medium text-[#333]">{formData.countryOfResidence}</span>
                </div>
                <div>
                  <span className="text-[#777] block">City/Region</span>
                  <span className="font-medium text-[#333]">{formData.cityRegion}</span>
                </div>
                <div>
                  <span className="text-[#777] block">Background</span>
                  <span className="font-medium text-[#333]">{formData.currentBackground}</span>
                </div>
                <div>
                  <span className="text-[#777] block">Primary language</span>
                  <span className="font-medium text-[#333]">{formData.primaryLanguage}</span>
                </div>
              </div>
            </div>

            {/* Section 3 Card */}
            <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFBF9]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-xs font-bold text-[#333]">03 Korean experience & proficiency</span>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-[#008C50] hover:underline flex items-center gap-1 font-medium"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 text-xs">
                <div>
                  <span className="text-[#777] block">Self-assessed level</span>
                  <span className="font-bold text-[#008C50]">{formData.selfAssessedLevel}</span>
                </div>
                <div>
                  <span className="text-[#777] block">Hangul reading</span>
                  <span className="font-medium text-[#333]">{formData.readingHangulComfort}</span>
                </div>
                <div>
                  <span className="text-[#777] block">Study duration</span>
                  <span className="font-medium text-[#333]">{formData.studyDuration}</span>
                </div>
              </div>
            </div>

            {/* Section 4 Card */}
            <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFBF9]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-xs font-bold text-[#333]">04 Learning goals & preferences</span>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="text-xs text-[#008C50] hover:underline flex items-center gap-1 font-medium"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="space-y-3 pt-3 text-xs">
                <div>
                  <span className="text-[#777] block">Personal goal</span>
                  <span className="font-medium text-[#333]">{formData.personalLearningGoal}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[#777] block">Reasons</span>
                    <span className="font-medium text-[#333]">{formData.reasonsForLearning.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[#777] block">Format</span>
                    <span className="font-medium text-[#333]">{formData.preferredClassFormat}</span>
                  </div>
                  <div>
                    <span className="text-[#777] block">Independent practice</span>
                    <span className="font-medium text-[#333]">{formData.independentPracticeHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5 Card */}
            <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFBF9]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-xs font-bold text-[#333]">05 Availability & schedule</span>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="text-xs text-[#008C50] hover:underline flex items-center gap-1 font-medium"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
                <div>
                  <span className="text-[#777] block">Preferred start & frequency</span>
                  <span className="font-medium text-[#333]">
                    {formData.preferredStartDate} ({formData.preferredFrequency})
                  </span>
                </div>
                <div>
                  <span className="text-[#777] block">Available time windows (KST)</span>
                  <span className="font-semibold text-[#008C50]">
                    {formData.timeSlots.join('; ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 6 Card */}
            <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFBF9]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-xs font-bold text-[#333]">06 Additional information & consent</span>
                <button
                  onClick={() => setCurrentStep(6)}
                  className="text-xs text-[#008C50] hover:underline flex items-center gap-1 font-medium"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="space-y-2 pt-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Application processing consent: Confirmed</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Accuracy declaration: Confirmed</span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-[#777] leading-relaxed">
              Submitting an application does not guarantee eligibility, instructor matching, or a class place. Program arrangements and review timelines are to be confirmed by Everlove Church.
            </p>

            {/* Submit Action */}
            <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(6)}
                className="text-xs font-medium text-[#555] hover:text-[#333] px-4 py-2 border border-gray-200 rounded-lg"
              >
                Previous
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveDraft}
                  className="text-xs font-medium text-[#555] hover:text-[#008C50] px-4 py-2 border border-gray-200 rounded-lg"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleSubmitFinal}
                  disabled={isSubmitting}
                  className="bg-[#008C50] hover:bg-[#007340] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting to database...</span>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 8: SUBMISSION CONFIRMATION (Figma Page 10)
           ========================================================================= */}
        {currentStep === 8 && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
                  KOREAN LANGUAGE · LEARNER APPLICATION
                </span>
                <h2 className="text-3xl font-bold text-[#333] mt-1">Application submitted</h2>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F5E9] text-[#008C50] border border-[#008C50]/20">
                EXAMPLE · SUBMITTED
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#333]">
                Thank you, {formData.givenName || 'Learner'}.
              </h3>
              <p className="text-sm text-[#666]">
                Your application has been received and saved into the platform database. In the live service, the next stage would be application review by authorized church administrators.
              </p>
            </div>

            {/* Reference Number Box matching Figma Page 10 */}
            <div className="bg-[#FAFBF9] border border-gray-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777]">
                  APPLICATION REFERENCE
                </span>
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#008C50] mt-1">
                  {submittedApp?.referenceNumber || 'SAMPLE-EL-2026-0042'}
                </p>
                <p className="text-[11px] text-[#777] mt-1">
                  Please keep this reference for follow-up and inquiry.
                </p>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 text-xs space-y-1 text-[#555]">
                <p className="font-semibold text-[#333] text-sm">
                  {formData.givenName} {formData.familyName}
                </p>
                <p>{formData.email}</p>
                <p>Contact preference: {formData.preferredContactMethod} · {formData.contactLanguage}</p>
              </div>
            </div>

            {/* Prospective Next Steps matching Figma */}
            <div>
              <h3 className="text-base font-bold text-[#333] mb-4">What happens next?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-[#FAFBF9]">
                  <span className="text-xs font-bold text-[#008C50] bg-[#E8F5E9] px-2 py-0.5 rounded">01</span>
                  <h4 className="font-semibold text-sm text-[#333] mt-2 mb-1">Application review</h4>
                  <p className="text-xs text-[#666]">
                    Authorized administrators review your learning needs and contact details. They may ask for clarification.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 bg-[#FAFBF9]">
                  <span className="text-xs font-bold text-[#008C50] bg-[#E8F5E9] px-2 py-0.5 rounded">02</span>
                  <h4 className="font-semibold text-sm text-[#333] mt-2 mb-1">Possible instructor matching</h4>
                  <p className="text-xs text-[#666]">
                    The team considers a suitable instructor based on your goals, Korean level, availability, and capacity.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 bg-[#FAFBF9]">
                  <span className="text-xs font-bold text-[#008C50] bg-[#E8F5E9] px-2 py-0.5 rounded">03</span>
                  <h4 className="font-semibold text-sm text-[#333] mt-2 mb-1">Class arrangements</h4>
                  <p className="text-xs text-[#666]">
                    Any proposed schedule, location, fees, and participation conditions would need to be confirmed before a class begins.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                onClick={() => {
                  setCurrentStep(0);
                  setSubmittedApp(null);
                }}
                className="text-xs font-medium text-[#555] hover:text-[#008C50] flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Submit Another Application</span>
              </button>

              <button
                onClick={onCancel}
                className="w-full sm:w-auto bg-[#008C50] hover:bg-[#007340] text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Return to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
