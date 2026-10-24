import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Globe,
  LogIn,
  LogOut,
  Shield,
  ClipboardList,
  Sparkles,
  ChevronDown,
  UserCheck,
  FileText,
  Users,
  Compass,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenFeedback: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenFeedback }) => {
  const { user, profile, isAdmin, isCommittee, signInWithGoogle, signOut, simulateRole, resetSimulatedRole, isSimulated } =
    useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e5e7eb] shadow-xs">
      {/* Top Provisional / Concept Banner matching Figma */}
      <div className="bg-[#FAF9F5] border-b border-[#ecebe6] px-4 py-1.5 text-xs text-[#777777] flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="inline-block w-2 h-2 rounded-full bg-[#F3981B] animate-pulse"></span>
          <span className="font-medium text-[#555555]">
            {t('banner.concept', 'Committee review concept · Program details are not yet confirmed.')}
          </span>
          <span className="hidden md:inline text-[#999999]">|</span>
          <span className="hidden md:inline text-xs text-[#777777]">
            Everlove Church (늘사랑교회) Korean Studies MVP
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentTab('landing')}
        >
          <img
            src="/assets/aistudio/Logo-everlove_7b5be5cf.png"
            alt="늘사랑교회 Everlove Church"
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="border-l border-gray-300 pl-3 hidden sm:block">
            <h1 className="text-base font-semibold text-[#008C50] tracking-tight leading-tight">
              Everlove Church
            </h1>
            <p className="text-xs text-[#777777] font-normal">Korean Language Studies</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#444444]">
          <button
            onClick={() => setCurrentTab('landing')}
            className={`transition-colors hover:text-[#008C50] ${
              currentTab === 'landing' ? 'text-[#008C50] font-semibold' : ''
            }`}
          >
            {t('nav.program', 'The program')}
          </button>
          <button
            onClick={() => setCurrentTab('apply')}
            className={`transition-colors hover:text-[#008C50] ${
              currentTab === 'apply' ? 'text-[#008C50] font-semibold' : ''
            }`}
          >
            {t('nav.howToApply', 'How to apply')}
          </button>
          <button
            onClick={() => {
              setCurrentTab('landing');
              setTimeout(() => {
                const el = document.getElementById('faqs-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="transition-colors hover:text-[#008C50]"
          >
            {t('nav.helpFaqs', 'Help & FAQs')}
          </button>

          {/* Admin and Committee links when authorized */}
          {isAdmin && (
            <div className="flex items-center gap-1 bg-[#F5F7F5] p-1 rounded-lg border border-[#e2e8f0]">
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentTab === 'admin'
                    ? 'bg-[#008C50] text-white shadow-xs'
                    : 'text-[#333333] hover:text-[#008C50]'
                }`}
              >
                Admin Workspace
              </button>
              <button
                onClick={() => setCurrentTab('matching')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentTab === 'matching'
                    ? 'bg-[#008C50] text-white shadow-xs'
                    : 'text-[#333333] hover:text-[#008C50]'
                }`}
              >
                Matching
              </button>
              <button
                onClick={() => setCurrentTab('form-builder')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentTab === 'form-builder'
                    ? 'bg-[#008C50] text-white shadow-xs'
                    : 'text-[#333333] hover:text-[#008C50]'
                }`}
              >
                Form Builder
              </button>
            </div>
          )}

          {isCommittee && (
            <button
              onClick={() => setCurrentTab('committee')}
              className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                currentTab === 'committee'
                  ? 'bg-[#F3981B] text-white border-[#F3981B]'
                  : 'text-[#777777] border-gray-200 hover:border-[#F3981B] hover:text-[#F3981B]'
              }`}
            >
              Committee Feedback
            </button>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#444444] rounded-md hover:bg-gray-100 transition-colors"
            title="Toggle English / 한국어"
          >
            <Globe className="w-4 h-4 text-[#008C50]" />
            <span>{lang === 'en' ? 'English / 한국어' : '한국어 / English'}</span>
          </button>

          {/* Committee Quick Feedback button */}
          <button
            onClick={onOpenFeedback}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium bg-[#FFF7ED] text-[#D97706] border border-[#FDE68A] px-3 py-1.5 rounded-full hover:bg-[#FEF3C7] transition-all"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Give Feedback</span>
          </button>

          {/* Role Switcher for Committee Demonstration */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-[#444] hover:bg-gray-100"
              title="Test Different Roles in Demo"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#008C50]" />
              <span className="font-medium truncate max-w-[100px]">
                {profile?.role === 'superAdmin'
                  ? 'Super Admin'
                  : profile?.role === 'churchAdmin'
                  ? 'Church Admin'
                  : profile?.role === 'committeeReviewer'
                  ? 'Committee'
                  : 'Learner'}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 text-xs">
                <div className="px-3 py-1.5 font-semibold text-gray-500 border-b border-gray-100 flex items-center justify-between">
                  <span>Role Switcher (Demo Mode)</span>
                  {isSimulated && (
                    <button
                      onClick={() => {
                        resetSimulatedRole();
                        setRoleMenuOpen(false);
                      }}
                      className="text-[10px] text-red-600 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    simulateRole('churchAdmin', 'Joy Jieun Choi', 'joy.choi@everlove.kr');
                    setRoleMenuOpen(false);
                    setCurrentTab('admin');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col"
                >
                  <span className="font-semibold text-[#008C50]">Joy Jieun Choi (Church Admin)</span>
                  <span className="text-gray-500 text-[11px]">Full access to applications, matching, and form builder</span>
                </button>
                <button
                  onClick={() => {
                    simulateRole('superAdmin', 'Eric Egan', 'eganeboe@gmail.com');
                    setRoleMenuOpen(false);
                    setCurrentTab('admin');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col"
                >
                  <span className="font-semibold text-[#333333]">Eric Egan (Super Admin)</span>
                  <span className="text-gray-500 text-[11px]">System configuration & database admin</span>
                </button>
                <button
                  onClick={() => {
                    simulateRole('committeeReviewer', 'Committee Member', 'committee@everlove.kr');
                    setRoleMenuOpen(false);
                    setCurrentTab('committee');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col"
                >
                  <span className="font-semibold text-[#F3981B]">Committee Reviewer</span>
                  <span className="text-gray-500 text-[11px]">Review requirements, approve/defer items</span>
                </button>
                <button
                  onClick={() => {
                    simulateRole('applicant', 'Avery Example', 'avery.learner@example.com');
                    setRoleMenuOpen(false);
                    setCurrentTab('apply');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col"
                >
                  <span className="font-semibold text-[#008C50]">Avery Example (Learner)</span>
                  <span className="text-gray-500 text-[11px]">Public application view</span>
                </button>
              </div>
            )}
          </div>

          {/* User Sign In / Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs text-gray-600 truncate max-w-[120px]">
                {user.displayName || user.email}
              </span>
              <button
                onClick={signOut}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#008C50] text-white px-3.5 py-2 rounded-md hover:bg-[#007340] shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('nav.signIn', 'Sign in')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
