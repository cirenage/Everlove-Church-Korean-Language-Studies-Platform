import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  MessageSquare,
  Users,
  CheckCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  Info,
} from 'lucide-react';

interface LandingPageProps {
  onStartApplication: () => void;
  onSignInClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartApplication, onSignInClick }) => {
  const { t, lang } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Can I apply if I am completely new to Korean?',
      qKr: '한국어를 전혀 몰라도 신청할 수 있나요?',
      a: 'Yes, you can describe yourself as a first-time learner. Final participation requirements and beginner class availability are to be confirmed by the church committee.',
      aKr: '네, 한국어를 처음 접하시는 분도 신청 가능합니다. 최종 개설 일정과 기초반 인원은 위원회 확정 후 안내됩니다.',
    },
    {
      q: 'When and where are classes, and what do they cost?',
      qKr: '수업 일정, 장소 및 수강료는 어떻게 되나요?',
      a: 'Schedules, location, fees, and enrollment dates are not yet confirmed. This MVP platform supports requirements gathering and application processing rather than announcing a finalized schedule.',
      aKr: '수업 시간표, 장소(늘사랑교회 본관/교육관 또는 온라인) 및 비용 정책은 교회 위원회 검토 중이며 추후 확정 공지됩니다.',
    },
    {
      q: 'Will I be matched with an instructor right away?',
      qKr: '신청 즉시 강사와 바로 매칭되나요?',
      a: 'No. Authorized church administrators first review your application, your learning goals, and schedule availability. Placement and timing are confirmed after administrative review.',
      aKr: '아닙니다. 담당자가 신청서의 학습 목표와 시간대를 꼼꼼히 검토한 후, 가장 적합한 강사와 개별 매칭을 진행합니다.',
    },
    {
      q: 'Who will review my information?',
      qKr: '제 신청 정보는 누가 확인하나요?',
      a: 'Applications are strictly restricted to authorized Everlove Church administrators and assigned instructors. Full privacy policy and retention terms will be published before live rollout.',
      aKr: '승인된 늘사랑교회 한국어학당 운영진 및 매칭된 담당 강사에게만 제한적으로 공유되며, 안전하게 관리됩니다.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7F5]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Introduction */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#008C50] text-xs font-semibold tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008C50]"></span>
                {t('hero.tag', 'KOREAN LANGUAGE · APPLICANT PORTAL')}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#333333] leading-[1.15]">
                Your next chapter <br />
                <span className="text-[#008C50]">starts with Korean.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#555555] leading-relaxed max-w-xl">
                {t(
                  'hero.subtitle',
                  'Take the first step in learning Korean with Everlove Church. Apply online, tell us about your learning needs, and let us help connect you with a suitable instructor.'
                )}
              </p>

              <div className="flex items-center gap-2 text-sm text-[#008C50] font-medium pt-2">
                <Users className="w-4 h-4 text-[#4AA83C]" />
                <span>{t('hero.badge', 'A learning space for foreign residents in Korea')}</span>
              </div>
            </div>

            {/* Right Column: Learner Application Card matching Figma */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
                    {t('hero.cardTag', 'LEARNER APPLICATION')}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-[#008C50]" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-[#333333] mb-3">
                  {t('hero.cardTitle', "Let's begin your journey")}
                </h2>
                <p className="text-sm text-[#666666] leading-relaxed mb-8">
                  {t(
                    'hero.cardDesc',
                    'Share your Korean level and learning goals. Your application helps us find the right instructor match.'
                  )}
                </p>

                <div className="space-y-3">
                  <button
                    onClick={onStartApplication}
                    className="w-full flex items-center justify-center gap-2 bg-[#008C50] hover:bg-[#007340] text-white py-3.5 px-6 rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all"
                  >
                    <span>{t('hero.startApp', 'Start an application')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onSignInClick}
                    className="w-full text-center py-2.5 text-sm font-medium text-[#555555] hover:text-[#008C50] transition-colors"
                  >
                    {t('hero.signInContinue', 'Sign in to continue a draft')}
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-2.5 text-xs text-[#777777]">
                  <ShieldCheck className="w-4 h-4 text-[#4AA83C] shrink-0 mt-0.5" />
                  <p>
                    {t(
                      'hero.notice',
                      'Reviewed by authorized church administrators. Applying does not confirm a class place.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Provisional info banner */}
          <div className="mt-12 bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
            <Info className="w-5 h-5 text-[#F3981B] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[#555555]">
              <span className="font-semibold text-[#333333]">Before you apply: </span>
              Class schedules, location, fees, enrollment dates, and participation requirements are to be confirmed by the Everlove Church committee.
            </div>
          </div>
        </div>
      </section>

      {/* Learning with Purpose / Level Cards Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
              LEARNING WITH PURPOSE
            </span>
            <h2 className="text-3xl font-bold text-[#333333] mt-2 mb-4">
              A starting point that feels right for you
            </h2>
            <p className="text-sm text-[#666666]">
              Learning begins with your current level and everyday goals. Use these level options to describe where you are today; available classes and placement will be confirmed after review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Beginner */}
            <div className="bg-[#FAFBF9] rounded-2xl p-8 border border-gray-200/70 hover:border-[#008C50]/40 transition-all hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#E8F5E9] text-[#008C50]">
                    BEGINNER
                  </span>
                  <Sparkles className="w-5 h-5 text-[#4AA83C]" />
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">New to Korean</h3>
                <p className="text-sm text-[#666666] leading-relaxed mb-6">
                  Begin with Hangul and useful first expressions for everyday life in Korea.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200/60 text-xs text-[#555555] font-medium">
                <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200">Hangul</span>
                <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200">Greetings</span>
                <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200">Simple phrases</span>
              </div>
            </div>

            {/* Elementary */}
            <div className="bg-[#FAFBF9] rounded-2xl p-8 border border-gray-200/70 hover:border-[#008C50]/40 transition-all hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#E8F5E9] text-[#008C50]">
                    ELEMENTARY
                  </span>
                  <BookOpen className="w-5 h-5 text-[#008C50]" />
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">Build your foundations</h3>
                <p className="text-sm text-[#666666] leading-relaxed mb-6">
                  Connect familiar words and phrases, and practise everyday conversations.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200/60 text-xs text-[#555555] font-medium">
                <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200">Daily conversation</span>
                <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200">Essential vocabulary</span>
              </div>
            </div>

            {/* Intermediate */}
            <div className="bg-[#FAFBF9] rounded-2xl p-8 border border-gray-200/70 hover:border-[#008C50]/40 transition-all hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#FFF7ED] text-[#D97706]">
                    INTERMEDIATE
                  </span>
                  <MessageSquare className="w-5 h-5 text-[#F3981B]" />
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">Grow your confidence</h3>
                <p className="text-sm text-[#666666] leading-relaxed mb-6">
                  Develop your expression and share your ideas on familiar topics with Korean speakers.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200/60 text-xs text-[#555555] font-medium">
                <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200">Expressing ideas</span>
                <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200">Understanding context</span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[#777777] mt-8">
            Not sure of your level? That's okay. Describe what you can do and what you would like to learn in your application.
          </p>
        </div>
      </section>

      {/* Clear Path Forward Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
              A CLEAR PATH FORWARD
            </span>
            <h2 className="text-3xl font-bold text-[#333333] mt-2 mb-3">
              From application to the right connection
            </h2>
            <p className="text-sm text-[#666666]">
              Start by telling us about yourself. Review and suitable instructor matching come next.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <span className="text-2xl font-bold text-[#008C50] mb-3 block">01</span>
              <h3 className="text-lg font-bold text-[#333333] mb-2">Apply online</h3>
              <p className="text-sm text-[#666666]">
                Tell us how to reach you, your current Korean level, and what you hope to learn.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <span className="text-2xl font-bold text-[#008C50] mb-3 block">02</span>
              <h3 className="text-lg font-bold text-[#333333] mb-2">Application review</h3>
              <p className="text-sm text-[#666666]">
                Authorized church administrators review your application and learning needs.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <span className="text-2xl font-bold text-[#008C50] mb-3 block">03</span>
              <h3 className="text-lg font-bold text-[#008C50] mb-2">Instructor matching</h3>
              <p className="text-sm text-[#666666]">
                Your needs and instructor availability guide a suitable match. Class arrangements are confirmed afterward.
              </p>
            </div>
          </div>

          {/* Preparation card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h4 className="text-lg font-bold text-[#333333] mb-1">A little preparation helps</h4>
              <p className="text-xs text-[#777777]">
                Use this as a preparation guide. Final required fields and review timelines are to be confirmed.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-[#444444]">
              <div className="flex items-center gap-1.5 bg-[#F5F7F5] px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-[#008C50]" />
                <span>Contact information</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F5F7F5] px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-[#008C50]" />
                <span>Your level and goals</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F5F7F5] px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-[#008C50]" />
                <span>Your availability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs-section" className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left side support card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#FAFBF9] rounded-2xl p-8 border border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider text-[#008C50]">
                  HERE TO HELP
                </span>
                <h3 className="text-2xl font-bold text-[#333333] mt-2 mb-4">
                  Support for your next step
                </h3>
                <p className="text-sm text-[#666666] leading-relaxed mb-6">
                  For questions about applying, choosing a level, or accessibility needs, learner support arrangements and contact options will be published once confirmed.
                </p>
                <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs text-[#777777]">
                  <span className="font-semibold text-[#333333]">Contact details & support hours: </span>
                  to be confirmed by church committee.
                </div>
              </div>
            </div>

            {/* Right side Accordion */}
            <div className="lg:col-span-7">
              <h3 className="text-xl font-bold text-[#333333] mb-6">
                A few things you may be wondering
              </h3>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-[#FAFBF9]"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left p-5 flex items-center justify-between text-sm sm:text-base font-semibold text-[#333333] hover:text-[#008C50] transition-colors"
                    >
                      <span>{lang === 'en' ? faq.q : faq.qKr}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          openFaq === index ? 'rotate-180 text-[#008C50]' : ''
                        }`}
                      />
                    </button>
                    {openFaq === index && (
                      <div className="px-5 pb-5 text-sm text-[#666666] leading-relaxed border-t border-gray-100 pt-3 bg-white">
                        {lang === 'en' ? faq.a : faq.aKr}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
