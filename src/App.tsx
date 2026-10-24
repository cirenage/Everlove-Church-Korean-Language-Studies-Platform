import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { testFirestoreConnection } from './lib/firebase';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DemoSeedBar } from './components/admin/DemoSeedBar';
import { LandingPage } from './components/public/LandingPage';
import { ApplicationWizard } from './components/apply/ApplicationWizard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ApplicationManagement } from './components/admin/ApplicationManagement';
import { FormBuilder } from './components/admin/FormBuilder';
import { InstructorManagement } from './components/admin/InstructorManagement';
import { MatchingWorkspace } from './components/admin/MatchingWorkspace';
import { CommitteeReviewDashboard } from './components/committee/CommitteeReviewDashboard';
import { CommitteeFeedbackModal } from './components/committee/CommitteeFeedbackModal';

import { getAllApplications } from './services/applicationService';
import { getAllInstructors } from './services/instructorService';
import { getAllMatches } from './services/matchingService';
import { getAllCommitteeFeedback } from './services/committeeService';
import { getActiveFormTemplate } from './services/formService';
import { seedDemoData } from './services/demoSeedService';

import { Application, Instructor, Match, CommitteeFeedback, FormTemplate } from './types';
import { INITIAL_FORM_TEMPLATE } from './lib/defaultFormTemplate';
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  CheckCircle2,
  Layers,
  ClipboardList,
} from 'lucide-react';

function AppContent() {
  const { user, profile, isAdmin, isCommittee, signInWithGoogle } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'applications' | 'instructors' | 'matching' | 'builder'>('dashboard');

  const [applications, setApplications] = useState<Application[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [feedbacks, setFeedbacks] = useState<CommitteeFeedback[]>([]);
  const [formTemplate, setFormTemplate] = useState<FormTemplate>(INITIAL_FORM_TEMPLATE);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all primary entities from Firestore
  const loadPlatformData = async () => {
    try {
      const [apps, insts, mtchs, fbs, tmpl] = await Promise.all([
        getAllApplications(),
        getAllInstructors(),
        getAllMatches(),
        getAllCommitteeFeedback(),
        getActiveFormTemplate(),
      ]);

      // If database is completely pristine on first load, seed demo data for instant demonstration
      if (apps.length === 0 && insts.length === 0) {
        await seedDemoData();
        const [seededApps, seededInsts, seededMtchs, seededFbs] = await Promise.all([
          getAllApplications(),
          getAllInstructors(),
          getAllMatches(),
          getAllCommitteeFeedback(),
        ]);
        setApplications(seededApps);
        setInstructors(seededInsts);
        setMatches(seededMtchs);
        setFeedbacks(seededFbs);
      } else {
        setApplications(apps);
        setInstructors(insts);
        setMatches(mtchs);
        setFeedbacks(fbs);
      }
      setFormTemplate(tmpl);
    } catch (err) {
      console.error('Error loading Firestore collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run connection test and initial data load
    testFirestoreConnection();
    loadPlatformData();
  }, []);

  const handleStartApplication = () => {
    setCurrentTab('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToMatching = (app?: Application) => {
    if (app) setSelectedApp(app);
    setCurrentTab('matching');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplicationSubmitted = (newApp: Application) => {
    setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5]">
      {/* Top Demo Notification & Seeding Bar */}
      <DemoSeedBar onDataChanged={loadPlatformData} />

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      />

      {/* Main Page Area */}
      <main className="flex-1">
        {/* TAB: Landing Page */}
        {currentTab === 'landing' && (
          <LandingPage
            onStartApplication={handleStartApplication}
            onSignInClick={signInWithGoogle}
          />
        )}

        {/* TAB: Learner Application Wizard */}
        {currentTab === 'apply' && (
          <ApplicationWizard
            formTemplate={formTemplate}
            onSubmitted={handleApplicationSubmitted}
            onCancel={() => setCurrentTab('landing')}
          />
        )}

        {/* TAB: Admin Portal */}
        {currentTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Admin Subnav */}
            <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap gap-2 text-xs font-semibold">
              <button
                onClick={() => setAdminSubTab('dashboard')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                  adminSubTab === 'dashboard'
                    ? 'bg-[#008C50] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => setAdminSubTab('applications')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                  adminSubTab === 'applications'
                    ? 'bg-[#008C50] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Application Management ({applications.length})</span>
              </button>

              <button
                onClick={() => setAdminSubTab('instructors')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                  adminSubTab === 'instructors'
                    ? 'bg-[#008C50] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Instructors ({instructors.length})</span>
              </button>

              <button
                onClick={() => setCurrentTab('matching')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#008C50]" />
                <span>Matching Workspace</span>
              </button>

              <button
                onClick={() => setCurrentTab('form-builder')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-[#008C50]" />
                <span>Form Builder</span>
              </button>
            </div>

            {/* Sub-tab view */}
            {adminSubTab === 'dashboard' && (
              <AdminDashboard
                applications={applications}
                instructors={instructors}
                matches={matches}
                onSelectApplication={(app) => {
                  setSelectedApp(app);
                  setAdminSubTab('applications');
                }}
                onNavigateToMatching={handleProceedToMatching}
                onNavigateToInstructors={() => setAdminSubTab('instructors')}
                onNavigateToFormBuilder={() => setCurrentTab('form-builder')}
              />
            )}

            {adminSubTab === 'applications' && (
              <ApplicationManagement
                applications={applications}
                selectedApp={selectedApp}
                onSelectApplication={setSelectedApp}
                onProceedToMatching={handleProceedToMatching}
                onRefresh={loadPlatformData}
              />
            )}

            {adminSubTab === 'instructors' && (
              <InstructorManagement instructors={instructors} onRefresh={loadPlatformData} />
            )}
          </div>
        )}

        {/* TAB: Dedicated Matching Workspace */}
        {currentTab === 'matching' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MatchingWorkspace
              applications={applications}
              instructors={instructors}
              onMatchConfirmed={loadPlatformData}
              initialSelectedApp={selectedApp}
            />
          </div>
        )}

        {/* TAB: Dedicated Form Builder */}
        {currentTab === 'form-builder' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <FormBuilder
              currentTemplate={formTemplate}
              onTemplateUpdated={(tmpl) => setFormTemplate(tmpl)}
            />
          </div>
        )}

        {/* TAB: Dedicated Committee Feedback Registry */}
        {currentTab === 'committee' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CommitteeReviewDashboard
              feedbacks={feedbacks}
              onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
              onRefresh={loadPlatformData}
            />
          </div>
        )}
      </main>

      {/* Global Committee Feedback Modal */}
      <CommitteeFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        currentScreenName={`Everlove Platform (${currentTab.toUpperCase()})`}
        onSubmitted={loadPlatformData}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
