import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'kr';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<string, { en: string; kr: string }> = {
  // Navigation
  'nav.program': { en: 'The program', kr: '프로그램 소개' },
  'nav.howToApply': { en: 'How to apply', kr: '신청 안내' },
  'nav.helpFaqs': { en: 'Help & FAQs', kr: '도움말 & 자주 묻는 질문' },
  'nav.signIn': { en: 'Sign in', kr: '로그인' },
  'nav.signOut': { en: 'Sign out', kr: '로그아웃' },
  'nav.adminPortal': { en: 'Admin Portal', kr: '관리자 포털' },
  'nav.committeeReview': { en: 'Committee Review', kr: '위원회 검토' },
  'nav.learnerPortal': { en: 'Applicant Portal', kr: '신청자 포털' },

  // Banner
  'banner.concept': {
    en: 'Committee review concept · Program details are not yet confirmed.',
    kr: '위원회 검토용 시연 버전 · 프로그램 세부사항은 교회 위원회 확정 전입니다.',
  },

  // Hero
  'hero.tag': { en: 'KOREAN LANGUAGE · APPLICANT PORTAL', kr: '한국어 교육 · 신청자 포털' },
  'hero.title': { en: 'Your next chapter starts with Korean.', kr: '한국어와 함께 열어가는 새로운 이야기.' },
  'hero.subtitle': {
    en: 'Take the first step in learning Korean with Everlove Church. Apply online, tell us about your learning needs, and let us help connect you with a suitable instructor.',
    kr: '늘사랑교회와 함께 한국어 학습의 첫걸음을 시작하세요. 온라인으로 신청서를 작성해 주시면 가장 알맞은 강사와 연결해 드립니다.',
  },
  'hero.badge': { en: 'A learning space for foreign residents', kr: '국내 거주 외국인을 위한 배움의 공간' },
  'hero.cardTitle': { en: "Let's begin your journey", kr: '학습 여정을 시작하세요' },
  'hero.cardDesc': {
    en: 'Share your Korean level and learning goals. Your application helps us find the right instructor match.',
    kr: '현재 한국어 수준과 배우고 싶은 목표를 알려주시면 꼭 맞는 강사를 찾아드립니다.',
  },
  'hero.startApp': { en: 'Start an application', kr: '신청서 작성하기' },
  'hero.signInContinue': { en: 'Sign in to continue', kr: '이어서 작성하기' },
  'hero.notice': {
    en: 'Reviewed by authorized church administrators. Applying does not confirm a class place.',
    kr: '교회 승인 담당자가 검토합니다. 신청서 제출이 수업 확정을 의미하지는 않습니다.',
  },

  // Levels
  'level.beginner.title': { en: 'New to Korean', kr: '한국어가 처음이신 분' },
  'level.beginner.desc': {
    en: 'Begin with Hangul and useful first expressions for everyday life in Korea.',
    kr: '한글의 기초와 한국 생활에 필요한 첫 표현을 배웁니다.',
  },
  'level.elementary.title': { en: 'Build your foundations', kr: '기초 다지기' },
  'level.elementary.desc': {
    en: 'Connect familiar words and phrases, and practise everyday conversations.',
    kr: '친숙한 단어와 문장을 연결하여 일상 회화를 연습합니다.',
  },
  'level.intermediate.title': { en: 'Grow your confidence', kr: '자신감 키우기' },
  'level.intermediate.desc': {
    en: 'Develop your expression and share your ideas on familiar topics.',
    kr: '친숙한 주제에 대해 생각을 표현하고 한국어로 자유롭게 소통합니다.',
  },

  // Form actions
  'btn.next': { en: 'Next', kr: '다음 단계' },
  'btn.previous': { en: 'Previous', kr: '이전 단계' },
  'btn.saveDraft': { en: 'Save Draft', kr: '임시 저장' },
  'btn.submit': { en: 'Submit Application', kr: '신청서 최종 제출' },
  'btn.review': { en: 'Review Application', kr: '신청 내용 검토' },
  'btn.edit': { en: 'Edit', kr: '수정' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('everlove_lang') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('everlove_lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'kr' : 'en'));
  };

  const t = (key: string, defaultText?: string): string => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
