import React, { useState } from 'react';
import { X, Globe, Zap, Briefcase, Factory, MapPin, MoreHorizontal, CheckCircle, Heart, MessageSquare, ArrowRight, Share2, Filter, Search, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type FeedItemType = 'case_study' | 'opportunity' | 'collaboration';

interface FeedItem {
  id: string;
  type: FeedItemType;
  author: {
    name: string;
    avatar?: string;
    role: string;
    verified?: boolean;
    company?: string;
  };
  content: {
    title: string;
    description: string;
    images?: string[];
    tags: string[];
    location?: string;
    budget?: string;
    moq?: string;
    capacity?: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    timeAgo: string;
  };
}

const MOCK_FEED: FeedItem[] = [
  {
    id: '1',
    type: 'case_study',
    author: { name: 'Studio Aesthetica', role: 'Design Studio', verified: true, avatar: 'SA', company: 'Aesthetica Ltd.' },
    content: {
      title: 'Deconstructed Denim: Process & Yield',
      description: 'A deep dive into our zero-waste pattern cutting technique for the FW24 collection. We managed to reduce fabric consumption by 15% using AI nesting. See the tech pack breakdown below.',
      images: ['https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=2069&auto=format&fit=crop'],
      tags: ['Sustainability', 'Denim', 'Pattern Making', 'Zero Waste']
    },
    stats: { likes: 342, comments: 28, shares: 12, timeAgo: '2h ago' }
  },
  {
    id: '2',
    type: 'opportunity',
    author: { name: 'EuroTextile Mfg', role: 'Manufacturer', verified: true, avatar: 'ET', company: 'EuroTextile Group' },
    content: {
      title: 'Open Production Capacity: Jersey & Knits',
      description: 'We have opened a new line dedicated to small-batch organic cotton production. Ideally looking for brands focusing on premium streetwear. GOTS certified facility.',
      tags: ['Manufacturing', 'Organic Cotton', 'Portugal', 'Small Batch'],
      location: 'Porto, Portugal',
      moq: '50 units',
      capacity: '2000 units/month'
    },
    stats: { likes: 89, comments: 12, shares: 45, timeAgo: '4h ago' }
  },
  {
    id: '3',
    type: 'collaboration',
    author: { name: 'Nomad Tech', role: 'Performance Brand', verified: false, avatar: 'NT', company: 'Nomad' },
    content: {
      title: 'Seeking 3D Garment Artist',
      description: 'Looking for a CLO3D expert to visualize our upcoming GORE-TEX shell jacket range for a virtual showroom experience. Must have experience with technical materials.',
      tags: ['Hiring', '3D Design', 'CLO3D', 'Freelance'],
      budget: '$2k - $5k Project'
    },
    stats: { likes: 156, comments: 45, shares: 8, timeAgo: '5h ago' }
  },
  {
    id: '4',
    type: 'case_study',
    author: { name: 'Elena R.', role: 'Technical Designer', verified: false, avatar: 'ER' },
    content: {
      title: 'Tech Pack: Modular Utility Vest',
      description: 'Complete breakdown of hardware sourcing and magnetic closure integration. View full spec sheet attached. Solved the issue of pocket sagging by reinforcing the internal facing.',
      images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop'],
      tags: ['Tech Pack', 'Utility', 'Sourcing', 'Technical Design']
    },
    stats: { likes: 210, comments: 15, shares: 20, timeAgo: '1d ago' }
  }
];

const FeedView: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'showcase' | 'opportunities' | 'network'>('all');

  if (!isOpen) return null;

  const filteredFeed = MOCK_FEED.filter(item => {
      if (activeTab === 'all') return true;
      if (activeTab === 'showcase') return item.type === 'case_study';
      if (activeTab === 'opportunities') return item.type === 'opportunity';
      if (activeTab === 'network') return item.type === 'collaboration';
      return true;
  });

  const tabs = [
      { id: 'all', label: 'For You' },
      { id: 'showcase', label: 'Showcase' },
      { id: 'opportunities', label: 'Opportunities' },
      { id: 'network', label: 'Network' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4 md:px-8 md:py-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      {/* Main Window */}
      <div className="relative w-full max-w-6xl bg-[#F5F5F7] rounded-[32px] shadow-2xl overflow-hidden h-full max-h-[92vh] flex flex-col animate-scale-in border border-white/20">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 md:p-5 flex justify-between items-center sticky top-0 z-20">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg text-white">
                  <Globe size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-[18px] md:text-[20px] font-bold text-[#1D1D1F] tracking-tight leading-none">Professional Feed</h2>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Discover, Connect, Manufacture</p>
              </div>
           </div>
           
           {/* Desktop Tabs */}
           <div className="hidden md:flex bg-gray-100/80 rounded-lg p-1 gap-1">
               {tabs.map((tab) => (
                   <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                   >
                       {tab.label}
                   </button>
               ))}
           </div>

           <div className="flex items-center gap-2">
              <button className="md:hidden p-2 bg-gray-100 rounded-full text-gray-600"><Search size={18} /></button>
              <button onClick={onClose} className="p-2 bg-gray-200/50 hover:bg-gray-300/50 rounded-full text-[#1D1D1F] transition-colors">
                  <X size={20} />
              </button>
           </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden bg-white border-b border-gray-200/50 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all whitespace-nowrap border ${activeTab === tab.id ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Profile & Stats (Desktop Only) */}
            <div className="hidden lg:flex flex-col w-80 bg-white border-r border-gray-200/50 p-6 gap-6 overflow-y-auto">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-[#1c1c1e] to-black rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Zap size={100} /></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold border-2 border-white/10">BO</div>
                            <span className="bg-white/20 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Pro</span>
                        </div>
                        <h3 className="font-bold text-lg leading-tight mb-0.5">Bus1nessonly</h3>
                        <p className="text-white/60 text-xs mb-6">Technical Designer • NY</p>
                        <div className="flex gap-6 text-xs border-t border-white/10 pt-4">
                            <div><span className="font-bold block text-lg">24</span>Projects</div>
                            <div><span className="font-bold block text-lg">1.2k</span>Views</div>
                            <div><span className="font-bold block text-lg">18</span>Connections</div>
                        </div>
                    </div>
                </div>

                {/* Trending */}
                <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Filter size={12}/> Trending Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {['#Sustainable', '#TechWear', '#MadeInPortugal', '#VirtualFashion', '#ZeroWaste', '#SmartTextiles', '#CircularEconomy'].map(tag => (
                            <span key={tag} className="text-[11px] bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:border-gray-200 cursor-pointer transition-all">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Suggested Connections */}
                <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Recommended</h4>
                    <div className="space-y-3">
                        {[
                            { name: 'TexLab Italy', role: 'Material Supplier' },
                            { name: 'Sarah Jenkins', role: 'Pattern Maker' }
                        ].map((u, i) => (
                             <div key={i} className="flex items-center justify-between group cursor-pointer">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{u.name[0]}</div>
                                     <div>
                                         <div className="text-sm font-semibold text-gray-900 leading-none">{u.name}</div>
                                         <div className="text-[10px] text-gray-500 mt-1">{u.role}</div>
                                     </div>
                                 </div>
                                 <button className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-black hover:border-black hover:text-white transition-all">
                                     <Plus size={14} />
                                 </button>
                             </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100">
                    <button className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        <Plus size={16} /> Share Your Work
                    </button>
                </div>
            </div>

            {/* Feed List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
                <div className="max-w-2xl mx-auto space-y-6">
                    
                    {/* Create Post Input (Mobile/Desktop Inline) */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-gray-300 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">BO</div>
                        <div className="flex-1 bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-400 transition-all">Start a case study or post an opportunity...</div>
                        <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"><Briefcase size={20} /></button>
                    </div>

                    {filteredFeed.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            
                            {/* Card Header */}
                            <div className="p-4 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${item.type === 'opportunity' ? 'bg-blue-600' : 'bg-black'}`}>
                                        {item.author.avatar}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="font-bold text-sm text-gray-900">{item.author.name}</h3>
                                            {item.author.verified && <CheckCircle size={12} className="text-blue-500 fill-blue-50" />}
                                            <span className="text-gray-300">•</span>
                                            <button className="text-[11px] font-semibold text-blue-600 hover:underline">Follow</button>
                                        </div>
                                        <p className="text-xs text-gray-500">{item.author.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-medium text-gray-400">{item.stats.timeAgo}</span>
                                    <button className="text-gray-300 hover:text-black p-1 hover:bg-gray-100 rounded transition-colors"><MoreHorizontal size={16} /></button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="px-4 pb-2">
                                <h4 className="font-bold text-lg mb-2 leading-tight tracking-tight text-[#1D1D1F]">{item.content.title}</h4>
                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{item.content.description}</p>
                                
                                {item.type === 'case_study' && item.content.images && (
                                    <div className="rounded-xl overflow-hidden mb-4 border border-gray-100 relative group cursor-pointer">
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                                        <img src={item.content.images[0]} alt="Case Study" className="w-full h-auto object-cover max-h-[400px]" />
                                    </div>
                                )}

                                {item.type === 'opportunity' && (
                                    <div className="bg-blue-50/50 rounded-xl p-5 mb-4 border border-blue-100 grid grid-cols-2 gap-4 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Location</span>
                                            <div className="flex items-center gap-2 text-sm text-blue-900 font-semibold">
                                                <MapPin size={16} /> {item.content.location}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">MOQ</span>
                                            <div className="flex items-center gap-2 text-sm text-blue-900 font-semibold">
                                                <Factory size={16} /> {item.content.moq}
                                            </div>
                                        </div>
                                        <div className="col-span-2 pt-2 border-t border-blue-100/50">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-blue-700 font-medium">Capacity: {item.content.capacity}</span>
                                                <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
                                                    Connect Factory
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {item.type === 'collaboration' && (
                                    <div className="bg-purple-50/50 rounded-xl p-5 mb-4 border border-purple-100 flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Budget</span>
                                                <div className="flex items-center gap-2 text-sm text-purple-900 font-semibold">
                                                    <Briefcase size={16} /> {item.content.budget}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                                            Apply for Role <ArrowRight size={14} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {item.content.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md border border-gray-200">#{tag}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
                                <div className="flex gap-6">
                                    <button className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors group">
                                        <Heart size={18} className="group-hover:scale-110 transition-transform" /> 
                                        <span>{item.stats.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-500 transition-colors group">
                                        <MessageSquare size={18} className="group-hover:scale-110 transition-transform" /> 
                                        <span>{item.stats.comments}</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black transition-colors group">
                                        <Share2 size={18} className="group-hover:scale-110 transition-transform" /> 
                                        <span>{item.stats.shares}</span>
                                    </button>
                                </div>
                                
                                {item.type === 'case_study' && (
                                    <button className="text-xs font-bold text-black hover:underline flex items-center gap-1">
                                        View Project <ArrowRight size={12} />
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}
                    
                    {/* End of Feed */}
                    <div className="py-8 text-center">
                        <p className="text-sm text-gray-400 font-medium">You're all caught up!</p>
                        <button className="mt-2 text-xs text-blue-600 font-semibold hover:underline">Explore more tags</button>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FeedView;