import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { APPLICANT_LANGUAGES, ApplicantLanguage } from '../../i18n/applicantLanguages';
import {
  Globe, LogIn, LogOut, ClipboardList, ChevronDown,
  UserCheck, Menu, X,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenFeedback: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenFeedback }) => {
  const {
    user, profile, isAdmin, isCommittee, signInWithGoogle, signOut,
    simulateRole, resetSimulatedRole, isSimulated,
  } = useAuth();
  const { lang, toggleLang, t, applicantLang, setApplicantLang } = useLanguage();
  const staffArea = ['admin','matching','form-builder','instructor'].includes(currentTab);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    setRoleMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToFaqs = () => {
    setCurrentTab('landing');
    setMobileMenuOpen(false);
    window.setTimeout(() => {
      document.getElementById('faqs-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const tabClass = (tab: string) =>
    `shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      currentTab === tab
        ? 'bg-[#008C50] text-white'
        : 'text-[#444444] hover:bg-[#F0F7F2] hover:text-[#008C50]'
    }`;

  const roleLabel =
    profile?.role === 'superAdmin' ? 'Super Admin' :
    profile?.role === 'churchAdmin' ? 'Church Admin' :
    profile?.role === 'committeeReviewer' ? 'Committee' : 'Learner';

  const roleChoices = [
    { role: 'churchAdmin', name: 'Joy Jieun Choi', email: 'joy.choi@everlove.kr', label: 'Joy Jieun Choi (Church Admin)', description: 'Applications, matching and forms', tab: 'admin' },
    { role: 'superAdmin', name: 'Eric Egan', email: 'eganeboe@gmail.com', label: 'Eric Egan (Super Admin)', description: 'System administration', tab: 'admin' },
    { role: 'applicant', name: 'Avery Example', email: 'avery.learner@example.com', label: 'Avery Example (Learner)', description: 'Public application view', tab: 'apply' },
  ] as const;

  return (
    <header className="relative z-40 border-b border-[#e5e7eb] bg-white shadow-sm">
      {/* Row 1: branding and utilities. Separate row prevents crammed navigation. */}
      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('landing')}
          className="flex min-w-0 shrink-0 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008C50]"
          aria-label="Everlove Church home"
        >
          <img
            src="/assets/aistudio/Logo-everlove_7b5be5cf.png"
            alt="늘사랑교회 Everlove Church"
            className="h-10 w-auto max-w-[115px] shrink-0 object-contain sm:h-12"
          />
          <div className="hidden border-l border-gray-200 pl-3 sm:block">
            <span className="block whitespace-nowrap text-sm font-semibold leading-5 text-[#008C50] sm:text-base">Everlove Church</span>
            <span className="block whitespace-nowrap text-xs leading-4 text-[#777777]">Korean Language Studies</span>
          </div>
        </button>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {staffArea ? (
            <button type="button" onClick={toggleLang} className="rounded-lg px-2 py-2 text-xs font-medium text-[#444444] hover:bg-gray-100" aria-label="Switch English and Korean">
              <Globe className="mr-1 inline h-4 w-4 text-[#008C50]" />{lang === 'kr' ? '한국어 / English' : 'English / 한국어'}
            </button>
          ) : (
            <label className="flex items-center gap-1.5 text-xs text-[#444444]">
              <Globe className="h-4 w-4 shrink-0 text-[#008C50]" />
              <span className="sr-only">Applicant language</span>
              <select aria-label="Applicant language" value={applicantLang} onChange={e=>setApplicantLang(e.target.value as ApplicantLanguage)} className="max-w-[135px] rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 focus:border-[#008C50] sm:max-w-[175px]">
                {APPLICANT_LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </label>
          )}

          <button
            type="button"
            onClick={onOpenFeedback}
            className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#FDE68A] bg-[#FFF7ED] px-3 py-2 text-xs font-medium text-[#B45309] hover:bg-[#FEF3C7] sm:flex"
          >
            <ClipboardList className="h-4 w-4" /> Give Feedback
          </button>

          {/* Preserves existing demonstration-role behavior; not an authorization mechanism. */}
          {user && <span className="hidden rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 md:inline">{roleLabel}</span>}

          {user ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="hidden max-w-[140px] truncate text-xs text-gray-600 xl:inline">{user.displayName || user.email}</span>
              <button type="button" onClick={signOut} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100" aria-label="Sign out" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#008C50] px-3 py-2 text-xs font-semibold text-white hover:bg-[#007340]"
            >
              <LogIn className="h-4 w-4" /><span className="hidden sm:inline">{t('nav.signIn', 'Sign in')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-lg border border-gray-200 p-2 text-[#333333] hover:bg-gray-50 lg:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Row 2: desktop navigation, never wraps */}
      <nav aria-label="Main navigation" className="hidden border-t border-gray-100 bg-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          <button type="button" onClick={() => navigate('landing')} className={tabClass('landing')}>{t('nav.program', 'The program')}</button>
          <button type="button" onClick={() => navigate('apply')} className={tabClass('apply')}>{t('nav.howToApply', 'How to apply')}</button>
          <button type="button" onClick={goToFaqs} className="shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[#444444] hover:bg-[#F0F7F2] hover:text-[#008C50]">{t('nav.helpFaqs', 'Help & FAQs')}</button>
          {isAdmin && (
            <>
              <div className="mx-2 h-6 w-px shrink-0 bg-gray-200" aria-hidden="true" />
              <button type="button" onClick={() => navigate('admin')} className={tabClass('admin')}>Admin Workspace</button>
              <button type="button" onClick={() => navigate('matching')} className={tabClass('matching')}>Matching</button>
              <button type="button" onClick={() => navigate('form-builder')} className={tabClass('form-builder')}>Form Builder</button>
            </>
          )}

        </div>
      </nav>

      {/* Collapsible mobile / tablet navigation */}
      {mobileMenuOpen && (
        <nav aria-label="Mobile navigation" className="border-t border-gray-100 bg-white px-4 py-3 shadow-md lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <button type="button" onClick={() => navigate('landing')} className={`${tabClass('landing')} text-left`}>{t('nav.program', 'The program')}</button>
            <button type="button" onClick={() => navigate('apply')} className={`${tabClass('apply')} text-left`}>{t('nav.howToApply', 'How to apply')}</button>
            <button type="button" onClick={goToFaqs} className="rounded-lg px-3 py-2 text-left text-sm text-[#444444] hover:bg-gray-50">{t('nav.helpFaqs', 'Help & FAQs')}</button>
            {isAdmin && (
              <>
                <div className="my-1 border-t border-gray-100" />
                <button type="button" onClick={() => navigate('admin')} className={`${tabClass('admin')} text-left`}>Admin Workspace</button>
                <button type="button" onClick={() => navigate('matching')} className={`${tabClass('matching')} text-left`}>Matching</button>
                <button type="button" onClick={() => navigate('form-builder')} className={`${tabClass('form-builder')} text-left`}>Form Builder</button>
              </>
            )}

            <button type="button" onClick={() => { onOpenFeedback(); setMobileMenuOpen(false); }} className="rounded-lg px-3 py-2 text-left text-sm text-[#B45309] hover:bg-[#FFF7ED]">Give Feedback</button>

          </div>
        </nav>
      )}
    </header>
  );
};
