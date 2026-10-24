import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#e5e7eb] mt-16 py-8 text-xs text-[#777777]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
          <div>
            <p className="font-semibold text-[#333333] text-sm">
              Everlove Church · Korean Language Studies
            </p>
            <p className="text-[#777777] mt-0.5">Learner application & instructor matching portal</p>
          </div>
          <div className="flex flex-wrap gap-6 text-[#555555]">
            <span className="hover:text-[#008C50] cursor-pointer">Privacy information</span>
            <span>·</span>
            <span className="hover:text-[#008C50] cursor-pointer">Accessibility</span>
            <span>·</span>
            <span className="text-[#888888]">Policies & support details: to be confirmed</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-[#999999]">
          <p>
            Pre-development committee validation concept. Content and application requirements are subject to confirmation before launch.
          </p>
          <p>© 2026 Everlove Church (늘사랑교회). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
