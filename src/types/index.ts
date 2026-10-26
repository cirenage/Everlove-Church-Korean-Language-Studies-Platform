export type UserRole = 'superAdmin' | 'churchAdmin' | 'instructor' | 'applicant' | 'committeeReviewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'radio'
  | 'checkbox'
  | 'dropdown'
  | 'yes_no'
  | 'consent'
  | 'info';

export interface FormQuestion {
  id: string; // Stable ID e.g. "q1_name", "q7_korean_proficiency"
  sourceQuestionNumber: number; // 1 to 36 from original document
  originalSourceText: string;
  labelEn: string;
  labelKr?: string;
  helpTextEn?: string;
  helpTextKr?: string;
  placeholderEn?: string;
  type: QuestionType;
  required: boolean;
  optionsEn?: string[];
  optionsKr?: string[];
  sectionId: string;
  order: number;
  active: boolean;
  condition?: {
    dependsOnQuestionId: string;
    operator: 'equals' | 'includes' | 'not_empty';
    value: string;
  };
}

export interface FormSection {
  id: string;
  number: number;
  titleEn: string;
  titleKr: string;
  subtitleEn?: string;
  subtitleKr?: string;
  descriptionEn?: string;
  descriptionKr?: string;
  order: number;
}

export interface FormTemplate {
  id: string;
  version: string; // e.g. "v1.0"
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  sections: FormSection[];
  questions: FormQuestion[];
  publishedAt?: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'information_required'
  | 'ready_for_matching'
  | 'matched'
  | 'waitlisted'
  | 'withdrawn'
  | 'closed';

export interface ApplicantInfo {
  givenName: string;
  familyName: string;
  preferredName?: string;
  dateOfBirth?: string;
  email: string;
  phone?: string;
  preferredContactMethod: 'Email' | 'Phone';
  contactLanguage: string;
  countryOfResidence: string;
  cityRegion: string;
  districtArea?: string;
  arrivalInKorea?: string;
  currentBackground: string;
  primaryLanguage: string;
}

export interface LearningProfile {
  studiedBefore: boolean;
  studyDuration?: string;
  previousLearningMethod?: string;
  selfAssessedLevel: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced';
  readingHangulComfort: string;
  speakingConfidence: string;
  reasonsForLearning: string[];
  personalLearningGoal: string;
  skillsToFocusOn: string[];
  preferredClassFormat: 'In person' | 'Online' | 'No preference' | 'Hybrid';
  preferredLocation?: string;
  languageSupport?: string;
  independentPracticeHours?: string;
  preferredClassSize?: string;
}

export interface AvailabilityInfo {
  preferredStartDate: string;
  preferredFrequency: string;
  timeSlots: string[]; // e.g. ["Tue 18:00-20:00", "Thu 18:00-20:00", "Sat 10:00-12:00"]
  instructorPreference?: string;
  instructorNotes?: string;
}

export interface ConsentsInfo {
  applicationProcessing: boolean;
  accuracyDeclaration: boolean;
  programUpdates: boolean;
  consentedAt: string;
}

export interface ApplicationHistoryEvent {
  timestamp: string;
  action: string;
  actorName: string;
  note?: string;
}

export interface Application {
  id: string;
  referenceNumber: string; // e.g. "EL-2026-0042" or "SAMPLE-EL-2026-0042"
  formVersionId: string;
  formTemplateId?: string;
  answers?: Record<string, string | string[] | boolean>;
  formSnapshot?: { version: string; sections: FormSection[]; questions: FormQuestion[] };
  isDemo?: boolean;
  status: ApplicationStatus;
  applicant: ApplicantInfo;
  learningProfile: LearningProfile;
  availability: AvailabilityInfo;
  consents: ConsentsInfo;
  additionalNotes?: string;
  accessibilitySupport?: string;
  howYouFoundUs?: string;
  internalNotes?: string;
  assignedInstructorId?: string | null;
  assignedInstructorName?: string | null;
  matchNotes?: string | null;
  matchedAt?: string | null;
  history: ApplicationHistoryEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  experienceYears: number;
  supportedLevels: ('Beginner' | 'Elementary' | 'Intermediate' | 'Advanced')[];
  preferredTopics: string[];
  languageSupport: string[]; // e.g. ["English", "Korean", "Chinese"]
  preferredFormat: 'in_person' | 'online' | 'hybrid' | 'any';
  locations: string[]; // e.g. ["Daejeon - Yuseong-gu", "Online"]
  weeklyAvailability: string[]; // e.g. ["Tue 18:00-20:00", "Thu 18:00-20:00", "Sat 10:00-12:00"]
  maxCapacity: number;
  currentStudentsCount: number;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface Match {
  id: string;
  applicationId: string;
  instructorId: string;
  learnerName: string;
  instructorName: string;
  status: 'active' | 'completed' | 'cancelled';
  schedule: string;
  format: string;
  notes?: string;
  matchedBy: string;
  matchedAt: string;
  isDemo?: boolean;
}

export type FeedbackStatus = 'approved' | 'requires_changes' | 'deferred';

export interface CommitteeFeedback {
  id: string;
  reviewerName: string;
  screenOrFeature: string;
  status: FeedbackStatus;
  comment: string;
  timestamp: string;
  isDemo?: boolean;
}

export interface SystemSettings {
  id: string;
  programTitle: string;
  programDescription: string;
  provisionalNotice: string;
  contactEmail: string;
  contactPhone: string;
  supportHours: string;
  updatedAt: string;
}
