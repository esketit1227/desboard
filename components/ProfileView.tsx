import React from 'react';
import { X, CreditCard, Check, FileText, Star, Zap, Shield, ChevronRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onTogglePro: () => void;
  isDarkMode: boolean;
}

const ProfileView: React.FC<Props> = ({ isOpen, onClose, isPro, onTogglePro, isDarkMode }) => {
  if (!isOpen) return null;

  const bgClass = isDarkMode ? 'bg-[#1C1C1E]' : 'bg-[#F2F2F7]';
  const textClass = isDarkMode ? 'text-white' : 'text-[#1D1D1F]';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-[#86868B]';
  const cardBgClass = isDarkMode ? 'bg-[#2C2C2E]' : 'bg-white';
  const hoverClass = isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50';
  const borderClass = isDarkMode ? 'border-white/10' : 'border-gray-200/50';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 py-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-2xl ${bgClass} rounded-[32px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-scale-in border ${borderClass}`}>
        
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-[#1C1C1E]/70' : 'bg-white/70'} backdrop-blur-xl border-b ${borderClass} p-5 flex justify-between items-center sticky top-0 z-10`}>
           <h2 className={`text-[17px] font-semibold ${textClass} pl-2`}>Account</h2>
           <button 
             onClick={onClose}
             className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-gray-300' : 'bg-gray-200/50 hover:bg-gray-300/50 text-[#86868B]'}`}
           >
             <X size={20} />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-8">
            
            {/* User Info Card */}
            <div className="flex items-center gap-5 mb-2 px-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-black text-white flex items-center justify-center text-2xl font-medium shadow-md border-4 border-white/10">
                    BO
                </div>
                <div>
                    <h3 className={`text-[24px] font-bold ${textClass} tracking-tight leading-tight`}>Bus1nessonly</h3>
                    <p className={`text-[15px] ${subTextClass} font-medium`}>bus1nessonly@example.com</p>
                </div>
            </div>

            {/* Subscription Section */}
            <div>
                <h4 className={`text-[13px] font-medium ${subTextClass} uppercase tracking-wider mb-3 ml-4`}>Subscription</h4>
                <div className={`${cardBgClass} rounded-[20px] overflow-hidden shadow-sm divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                    <div className="p-5 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPro ? (isDarkMode ? 'bg-white text-black' : 'bg-black text-white') : (isDarkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
                                <Zap size={20} fill={isPro ? "currentColor" : "none"} />
                            </div>
                            <div>
                                <div className={`text-[16px] font-semibold ${textClass}`}>
                                    {isPro ? 'Pro Plan' : 'Basic Plan'}
                                </div>
                                <div className={`text-[13px] ${subTextClass} font-medium`}>
                                    {isPro ? 'Next billing May 24' : 'Limited features'}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`block text-[16px] font-bold ${textClass}`}>
                                {isPro ? '$29.00' : 'Free'}
                            </span>
                            <span className={`text-[11px] ${subTextClass} font-medium`}>/month</span>
                        </div>
                    </div>
                    
                    {/* Plan Features Comparison */}
                    <div className={`p-5 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50/50'}`}>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-[14px]">
                                <Check size={16} className="text-[#0071e3]" strokeWidth={3} />
                                <span className={`${textClass} font-medium`}>Unlimited Tech Packs</span>
                            </div>
                            <div className="flex items-center gap-3 text-[14px]">
                                <Check size={16} className="text-[#0071e3]" strokeWidth={3} />
                                <span className={`${textClass} font-medium`}>AI Size Grading (XS-XL)</span>
                            </div>
                            <div className="flex items-center gap-3 text-[14px]">
                                <Check size={16} className={isPro ? "text-[#0071e3]" : "text-gray-500"} strokeWidth={3} />
                                <span className={isPro ? `${textClass} font-medium` : "text-gray-500"}>Export as Vector (SVG)</span>
                            </div>
                            <div className="flex items-center gap-3 text-[14px]">
                                <Check size={16} className={isPro ? "text-[#0071e3]" : "text-gray-500"} strokeWidth={3} />
                                <span className={isPro ? `${textClass} font-medium` : "text-gray-500"}>Costing & Yield Calculator</span>
                            </div>
                        </div>
                        <button 
                            onClick={onTogglePro}
                            className={`w-full py-3 rounded-xl text-[15px] font-semibold transition-all ${
                                isPro 
                                ? `${isDarkMode ? 'bg-transparent border border-white/20 text-white hover:bg-white/10' : 'bg-white border border-gray-200 text-[#1D1D1F] hover:bg-gray-50'}`
                                : 'bg-[#0071e3] text-white hover:bg-[#0077ED] shadow-sm'
                            }`}
                        >
                            {isPro ? 'Downgrade to Basic' : 'Upgrade to Pro'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div>
                <h4 className={`text-[13px] font-medium ${subTextClass} uppercase tracking-wider mb-3 ml-4`}>Payment Method</h4>
                <div className={`${cardBgClass} rounded-[20px] overflow-hidden shadow-sm`}>
                    <div className={`p-4 flex items-center justify-between ${hoverClass} transition-colors cursor-pointer group active:opacity-80`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-8 rounded-md border flex items-center justify-center ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                                <CreditCard size={18} className="text-gray-500" />
                            </div>
                            <div>
                                <div className={`text-[15px] font-semibold ${textClass}`}>Visa ending in 4242</div>
                                <div className={`text-[13px] ${subTextClass}`}>Expires 12/28</div>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-500" />
                    </div>
                </div>
            </div>

            {/* Billing History */}
            <div>
                <h4 className={`text-[13px] font-medium ${subTextClass} uppercase tracking-wider mb-3 ml-4`}>Billing History</h4>
                <div className={`${cardBgClass} rounded-[20px] overflow-hidden shadow-sm divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                    {[
                        { date: 'Apr 24, 2024', id: 'INV-2024-001', amount: '$29.00' },
                        { date: 'Mar 24, 2024', id: 'INV-2024-002', amount: '$29.00' },
                        { date: 'Feb 24, 2024', id: 'INV-2024-003', amount: '$29.00' },
                    ].map((invoice, i) => (
                        <div key={i} className={`p-4 flex items-center justify-between ${hoverClass} transition-colors cursor-pointer active:opacity-80`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <div className={`text-[14px] font-medium ${textClass}`}>Pro Plan Subscription</div>
                                    <div className={`text-[12px] ${subTextClass}`}>{invoice.date} • {invoice.id}</div>
                                </div>
                            </div>
                            <div className={`text-[14px] font-medium ${textClass} tabular-nums`}>
                                {invoice.amount}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center pt-2 pb-6">
                 <button className={`text-[14px] text-red-500 font-medium px-6 py-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-red-50'}`}>
                     Sign Out
                 </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileView;