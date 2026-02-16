import React, { useState, useEffect, useRef } from 'react';
import { 
    X, FileText, Image as ImageIcon, CheckCircle, Clock, Download, MessageSquare, 
    ChevronRight, Briefcase, File, Check, MoreHorizontal, ArrowLeft, UserPlus, 
    Link, Copy, Mail, Send, Plus, FolderPlus, Layers, LayoutDashboard, Users, 
    Kanban, CreditCard, FileSignature, BarChart3, AlertTriangle, TrendingUp, 
    Calendar, DollarSign, PieChart, Activity, AlertCircle, Hash, Eye, Phone, Paperclip, 
    Palette, PenTool, StickyNote, Star, Trash2, List, Play, Pause, Flag, CheckSquare,
    EyeOff, ThumbsUp, ThumbsDown, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw,
    Shield, Lock, FileCheck, Bell, UserCheck, Target, Award, Upload, Zap, CornerDownRight, ArrowRight
} from 'lucide-react';

export type ViewMode = 'portal' | 'crm' | 'projects' | 'finance' | 'legal' | 'analytics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialView?: ViewMode;
  isDarkMode?: boolean;
}

// --- Types ---

interface TimelineEvent {
    id: string;
    type: 'email' | 'call' | 'note' | 'meeting';
    content: string;
    date: string;
    author: string;
}

interface CreativeAsset {
    id: string;
    type: 'moodboard' | 'reference' | 'inspiration';
    url: string;
    name: string;
}

interface Lead {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    stage: 'Inquiry' | 'Call' | 'Proposal' | 'Won' | 'In Progress' | 'Completed';
    value: string;
    tags: string[];
    health: number; // 0-100
    lastContact: string;
    moodboardUrl?: string; 
    timeline: TimelineEvent[];
    creativeAssets: CreativeAsset[];
    contractStatus: 'None' | 'Drafting' | 'Sent' | 'Signed';
    revisionCount: number;
    address?: string;
}

interface Comment {
    id: string;
    author: string;
    text: string;
    timestamp: string;
    isInternal: boolean;
    role: 'Client' | 'Team';
}

interface Attachment {
    id: string;
    name: string;
    url: string;
    status: 'pending' | 'approved' | 'rejected';
    uploadedBy: string;
    date: string;
}

interface Milestone {
    id: string;
    name: string;
    dueDate: string;
    progress: number;
    status: 'on_track' | 'at_risk' | 'completed';
}

interface ProjectTask {
    id: string;
    title: string;
    assignee: string;
    status: 'Todo' | 'In Progress' | 'Review' | 'Done';
    dueDate: string;
    startDate: string; 
    duration: number; 
    revisions: number;
    maxRevisions: number; 
    isClientVisible: boolean;
    milestoneId?: string;
    timeTracked: number; 
    isTimerRunning: boolean;
    priority: 'Low' | 'Medium' | 'High';
    comments: Comment[];
    attachments: Attachment[];
}

interface Invoice {
    id: string;
    client: string;
    amount: string;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
    date: string;
    dueDate: string;
    type: 'Retainer' | 'Project' | 'One-off';
    items?: { desc: string, qty: number, price: number }[];
    installments?: { num: number, total: number, due: string }[];
    stripeLink?: string;
    autoRemind?: boolean;
}

interface Contract {
    id: string;
    title: string;
    client: string;
    status: 'Draft' | 'Sent' | 'Viewed' | 'Signed';
    type: 'NDA' | 'Retainer' | 'Project';
    value: string;
    dateCreated: string;
    lastActivity: string;
}

// --- Mock Data ---

const MOCK_LEADS: Lead[] = [
    { 
        id: 'l1', name: 'Sarah Jenkins', company: 'Velvet & Vine', email: 'sarah@velvetvine.com', phone: '+1 (555) 123-4567',
        stage: 'Proposal', value: '$12k', tags: ['D2C', 'Apparel'], health: 90, lastContact: '2d ago', 
        moodboardUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        contractStatus: 'Drafting', revisionCount: 0, address: '123 Fashion Ave, NY',
        timeline: [
            { id: 'e1', type: 'email', content: 'Sent initial proposal deck v1.2', date: 'Oct 24, 2:30 PM', author: 'You' },
            { id: 'c1', type: 'call', content: 'Discovery call - wants focus on sustainability', date: 'Oct 22, 10:00 AM', author: 'You' }
        ],
        creativeAssets: [
            { id: 'a1', type: 'moodboard', name: 'Fall 2024 Vibe', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop' },
            { id: 'a2', type: 'reference', name: 'Competitor Style', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop' }
        ]
    },
    { 
        id: 'l2', name: 'Mike Thompson', company: 'Urban Tread', email: 'mike@urbantread.co', phone: '+1 (555) 987-6543',
        stage: 'Inquiry', value: '$45k', tags: ['Branding', 'Footwear'], health: 60, lastContact: '1d ago', 
        moodboardUrl: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=200',
        contractStatus: 'None', revisionCount: 0, address: '456 Sole St, LA',
        timeline: [
            { id: 'e2', type: 'email', content: 'Inbound inquiry via website form', date: 'Oct 25, 9:15 AM', author: 'System' }
        ],
        creativeAssets: []
    },
    { 
        id: 'l3', name: 'Global Corp', company: 'Global Corp', email: 'procurement@global.com', phone: '+1 (555) 000-0000',
        stage: 'Won', value: '$120k', tags: ['Retainer', 'Enterprise'], health: 98, lastContact: 'Today',
        contractStatus: 'Signed', revisionCount: 2, address: '1 Corporate Way, SF',
        timeline: [
            { id: 'n1', type: 'note', content: 'Signed annual retainer agreement. Onboarding starts next week.', date: 'Today, 11:00 AM', author: 'You' }
        ],
        creativeAssets: []
    },
];

const MOCK_MILESTONES: Milestone[] = [
    { id: 'm1', name: 'Concept Phase', dueDate: 'Nov 01', progress: 80, status: 'on_track' },
    { id: 'm2', name: 'Design Development', dueDate: 'Nov 15', progress: 40, status: 'at_risk' },
    { id: 'm3', name: 'Production Files', dueDate: 'Nov 30', progress: 0, status: 'on_track' },
];

const MOCK_TASKS: ProjectTask[] = [
    { 
        id: 't1', title: 'Tech Pack: Outerwear Shell', assignee: 'BO', status: 'In Progress', 
        dueDate: 'Oct 30', startDate: 'Oct 25', duration: 5, revisions: 1, maxRevisions: 3, isClientVisible: true, milestoneId: 'm2',
        timeTracked: 120, isTimerRunning: true, priority: 'High',
        comments: [
            { id: 'c1', author: 'Client', role: 'Client', text: 'Can we adjust the pocket placement?', timestamp: '2h ago', isInternal: false }
        ],
        attachments: [
            { id: 'f1', name: 'Shell_V1.pdf', url: '#', status: 'rejected', uploadedBy: 'BO', date: 'Oct 26' }
        ]
    },
    { 
        id: 't2', title: 'Logo Concepts V2', assignee: 'Sarah', status: 'Review', 
        dueDate: 'Oct 28', startDate: 'Oct 20', duration: 8, revisions: 4, maxRevisions: 3, isClientVisible: true, milestoneId: 'm1',
        timeTracked: 340, isTimerRunning: false, priority: 'Medium',
        comments: [], attachments: []
    },
    { 
        id: 't3', title: 'Sourcing Fabric Swatches', assignee: 'Mike', status: 'Todo', 
        dueDate: 'Nov 05', startDate: 'Nov 01', duration: 4, revisions: 0, maxRevisions: 2, isClientVisible: false, milestoneId: 'm2',
        timeTracked: 0, isTimerRunning: false, priority: 'Low',
        comments: [
            { id: 'c2', author: 'Mike', role: 'Team', text: 'Waiting on supplier catalog.', timestamp: '1d ago', isInternal: true }
        ],
        attachments: []
    },
];

const MOCK_INVOICES: Invoice[] = [
    { id: 'INV-001', client: 'Acme Corp', amount: '$4,500', status: 'Paid', date: 'Oct 01', dueDate: 'Oct 15', type: 'Project', autoRemind: false },
    { id: 'INV-002', client: 'Nebula Studios', amount: '$12,000', status: 'Sent', date: 'Oct 24', dueDate: 'Nov 24', type: 'Retainer', stripeLink: 'stripe.com/pay/123', autoRemind: true },
    { id: 'INV-003', client: 'Velvet & Vine', amount: '$2,400', status: 'Draft', date: 'Oct 25', dueDate: 'Nov 25', type: 'One-off', autoRemind: false },
    { id: 'INV-004', client: 'Urban Tread', amount: '$8,000', status: 'Overdue', date: 'Sep 20', dueDate: 'Oct 20', type: 'Project', autoRemind: true },
];

const MOCK_CONTRACTS: Contract[] = [
    { id: 'c1', title: 'Annual Design Retainer', client: 'Global Corp', status: 'Signed', type: 'Retainer', value: '$120,000', dateCreated: 'Oct 01', lastActivity: 'Signed 2d ago' },
    { id: 'c2', title: 'Brand Identity Agreement', client: 'Velvet & Vine', status: 'Sent', type: 'Project', value: '$12,000', dateCreated: 'Oct 24', lastActivity: 'Viewed 1h ago' },
    { id: 'c3', title: 'NDA - Fall Collection', client: 'Urban Tread', status: 'Draft', type: 'NDA', value: '-', dateCreated: 'Oct 25', lastActivity: 'Edited 5m ago' },
];

interface HubItem {
  id: string;
  projectId: string;
  name: string;
  phase: 'Strategy' | 'Design';
  type: 'pdf' | 'deck' | 'image' | 'folder';
  status: 'pending' | 'approved' | 'in_review';
  versions: { id: string, version: string, date: string, author: string }[];
  previewUrl: string;
}

const ClientHubView: React.FC<Props> = ({ isOpen, onClose, initialView, isDarkMode }) => {
  const [activeView, setActiveView] = useState<ViewMode>('crm');
  const [selectedItem, setSelectedItem] = useState<HubItem | null>(null);

  useEffect(() => {
    if (isOpen && initialView) {
      setActiveView(initialView);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const CRMView = () => {
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'creative' | 'contracts'>('overview');
    const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
    const stages: Lead['stage'][] = ['Inquiry', 'Call' , 'Proposal', 'Won', 'In Progress', 'Completed'];

    if (selectedLead) {
        return (
            <div className="h-full flex flex-col bg-white dark:bg-black">
                <div className="border-b border-gray-100 dark:border-white/10 p-6 flex items-center justify-between sticky top-0 bg-white dark:bg-black z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                        </button>
                        <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-lg font-bold border border-black dark:border-white">
                            {selectedLead.company.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">{selectedLead.company}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-white">{selectedLead.name}</span>
                                <span>•</span>
                                <span>{selectedLead.value} Deal</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                             <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Health</div>
                             <div className="text-lg font-bold flex items-center gap-1 text-black dark:text-white">
                                 <Activity size={16}/> {selectedLead.health}%
                             </div>
                        </div>
                        <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                            Edit Profile
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    <div className="w-2/3 border-r border-gray-100 dark:border-white/10 flex flex-col">
                        <div className="flex border-b border-gray-100 dark:border-white/10 px-6">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'timeline', label: 'Timeline' },
                                { id: 'creative', label: 'Creative Assets' },
                                { id: 'contracts', label: 'Contracts' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-white/5">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-fade-in-up">
                                    <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-6 tracking-wider">Contact Information</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/10 flex items-center justify-center text-black dark:text-white border border-gray-100 dark:border-white/5"><Mail size={16}/></div>
                                                <div>
                                                    <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Email</div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedLead.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/10 flex items-center justify-center text-black dark:text-white border border-gray-100 dark:border-white/5"><Phone size={16}/></div>
                                                <div>
                                                    <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Phone</div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedLead.phone}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-6 tracking-wider">Tags & Classification</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedLead.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1.5 bg-gray-50 dark:bg-white/10 text-black dark:text-white rounded-md text-xs font-medium border border-gray-200 dark:border-white/10">
                                                    {tag}
                                                </span>
                                            ))}
                                            <button className="px-3 py-1.5 border border-dashed border-gray-300 dark:border-white/20 text-gray-400 rounded-md text-xs font-medium hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors">
                                                + Add Tag
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="space-y-6">
                                     <div className="flex gap-2">
                                         <input type="text" placeholder="Add a note..." className="flex-1 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black dark:focus:border-white text-black dark:text-white" />
                                         <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-sm font-bold">Post</button>
                                     </div>
                                     <div className="border-l border-gray-200 dark:border-white/10 ml-4 space-y-8 pl-8 py-2">
                                         {selectedLead.timeline.map(event => (
                                             <div key={event.id} className="relative">
                                                 <div className="absolute -left-[41px] w-6 h-6 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E] flex items-center justify-center text-black dark:text-white text-[10px]">
                                                     {event.type === 'email' ? <Mail size={12}/> : event.type === 'call' ? <Phone size={12}/> : <StickyNote size={12}/>}
                                                 </div>
                                                 <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                                                     <div className="flex justify-between items-start mb-1">
                                                         <span className="font-bold text-sm text-black dark:text-white capitalize">{event.type}</span>
                                                         <span className="text-xs text-gray-400">{event.date}</span>
                                                     </div>
                                                     <p className="text-sm text-gray-600 dark:text-gray-300">{event.content}</p>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-1/3 p-6 bg-white dark:bg-black flex flex-col border-l border-gray-100 dark:border-white/10">
                         <div className="mb-8">
                             <h4 className="text-xs font-bold uppercase text-gray-400 mb-6 tracking-wider">Deal Stage</h4>
                             <div className="relative pl-4 border-l border-gray-200 dark:border-white/10 space-y-6">
                                 {stages.map((stage, i) => {
                                     const currentIdx = stages.indexOf(selectedLead.stage);
                                     const status = i < currentIdx ? 'completed' : i === currentIdx ? 'current' : 'pending';
                                     return (
                                         <div key={stage} className="relative">
                                             <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 border-white dark:border-black transition-colors ${
                                                 status === 'completed' ? 'bg-black dark:bg-white' : status === 'current' ? 'bg-black dark:bg-white ring-2 ring-gray-200 dark:ring-white/20' : 'bg-gray-200 dark:bg-white/10'
                                             }`} />
                                             <div className={`text-sm font-medium ${status === 'current' ? 'text-black dark:text-white font-bold' : 'text-gray-400'}`}>{stage}</div>
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-8 overflow-hidden bg-white dark:bg-black text-black dark:text-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-3xl font-light tracking-tighter text-black dark:text-white">Lead Pipeline</h3>
                    <p className="text-gray-500 text-sm mt-1 font-light">Manage deal flow and client relationships</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-black dark:text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <BarChart3 size={16}/> Reports
                    </button>
                    <button className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm">
                        <Plus size={16}/> New Lead
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 h-full min-w-[1400px]">
                    {stages.map(stage => (
                        <div key={stage} className="flex-1 flex flex-col min-w-[280px]">
                            <div className="flex justify-between items-center mb-4 px-1">
                                <span className="font-bold text-xs text-black dark:text-white uppercase tracking-widest">{stage}</span>
                                <span className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-black dark:text-white">
                                    {leads.filter(l => l.stage === stage).length}
                                </span>
                            </div>
                            
                            <div className="flex-1 bg-gray-50/50 dark:bg-white/5 rounded-2xl p-2 border border-gray-100 dark:border-white/5 overflow-y-auto space-y-3 custom-scrollbar">
                                {leads.filter(l => l.stage === stage).map(lead => (
                                    <div 
                                        key={lead.id} 
                                        onClick={() => setSelectedLead(lead)}
                                        className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm hover:border-black dark:hover:border-white transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-black dark:text-white font-bold text-xs border border-gray-200 dark:border-white/5">{lead.company[0]}</div>
                                                <div>
                                                    <div className="font-bold text-sm text-black dark:text-white leading-tight">{lead.company}</div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5">{lead.name}</div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-bold text-black dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">{lead.value}</div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 mb-3">
                                            {lead.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between border-t border-gray-50 dark:border-white/5 pt-3 mt-1">
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                                                <Clock size={10}/> {lead.lastContact}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-black dark:text-white">
                                                 <Activity size={10} />
                                                 <span>{lead.health}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 border border-dashed border-gray-300 dark:border-white/20 rounded-xl text-xs font-bold text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors flex items-center justify-center gap-2">
                                    <Plus size={14}/> Add Deal
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  const ProjectManagementView = () => {
      const [viewMode, setViewMode] = useState<'board' | 'gantt'>('board');
      const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

      return (
      <div className="h-full flex flex-col p-8 overflow-hidden bg-white dark:bg-black">
          <div className="flex justify-between items-center mb-8">
              <div>
                  <h3 className="text-3xl font-light tracking-tighter text-black dark:text-white">Projects</h3>
                  <p className="text-gray-500 text-sm mt-1 font-light">Tasks, Revisions & Timeline</p>
              </div>
              <div className="flex items-center gap-3">
                  <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-lg">
                      <button onClick={() => setViewMode('board')} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all ${viewMode === 'board' ? 'bg-white dark:bg-white/20 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
                          <Kanban size={14}/> Board
                      </button>
                      <button onClick={() => setViewMode('gantt')} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all ${viewMode === 'gantt' ? 'bg-white dark:bg-white/20 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
                          <List size={14}/> Timeline
                      </button>
                  </div>
                  <button className="bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                      <Plus size={14}/> New Task
                  </button>
              </div>
          </div>

          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
              {MOCK_MILESTONES.map(ms => (
                  <div key={ms.id} className="min-w-[200px] bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-black dark:text-white">{ms.name}</span>
                          <span className={`w-2 h-2 rounded-full ${ms.status === 'on_track' ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-black dark:bg-white h-full rounded-full" style={{ width: `${ms.progress}%` }} />
                      </div>
                  </div>
              ))}
          </div>

          <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full overflow-y-auto pb-20 pr-2">
                  {['Todo', 'In Progress', 'Review', 'Done'].map(status => (
                      <div key={status} className="flex flex-col gap-3">
                          <div className="flex justify-between items-center px-1">
                              <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">{status}</h4>
                              <span className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-2 py-0.5 rounded text-[10px] font-bold">{MOCK_TASKS.filter(t => t.status === status).length}</span>
                          </div>
                          {MOCK_TASKS.filter(t => t.status === status).map(task => (
                              <div key={task.id} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm hover:border-black dark:hover:border-white transition-all cursor-pointer group">
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 uppercase tracking-wider">{task.priority}</span>
                                      {task.isClientVisible && <Eye size={12} className="text-black dark:text-white" />}
                                  </div>
                                  <h5 className="font-bold text-sm text-black dark:text-white leading-snug mb-3">{task.title}</h5>
                                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-white/5">
                                      <div className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[9px] font-bold">{task.assignee}</div>
                                      <span className="text-[10px] font-medium text-gray-400">{task.dueDate}</span>
                                  </div>
                              </div>
                          ))}
                          <button className="py-2 border border-dashed border-gray-200 dark:border-white/20 rounded-xl text-xs font-medium text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors flex items-center justify-center">
                              <Plus size={14}/>
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      </div>
      );
  };

  const FinanceView = () => (
      <div className="h-full flex flex-col p-8 overflow-hidden bg-white dark:bg-black">
          <div className="flex justify-between items-center mb-8">
              <div>
                  <h3 className="text-3xl font-light tracking-tighter text-black dark:text-white">Finance</h3>
                  <p className="text-gray-500 text-sm mt-1 font-light">Invoicing & Cash Flow</p>
              </div>
              <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  <Plus size={14}/> Create Invoice
              </button>
          </div>

          <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  {[
                      { label: 'Total Revenue', val: '$324,500', icon: DollarSign },
                      { label: 'Outstanding', val: '$14,400', icon: AlertCircle },
                      { label: 'Active Retainers', val: '$22,500/m', icon:  RefreshCw },
                      { label: 'Forecast', val: '$58,000', icon: TrendingUp },
                  ].map((stat, i) => (
                      <div key={i} className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col justify-between h-32">
                          <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.label}</span>
                              <div className="p-2 rounded-full bg-gray-50 dark:bg-white/10 text-black dark:text-white"><stat.icon size={16} /></div>
                          </div>
                          <div className="text-2xl font-bold tracking-tight text-black dark:text-white">{stat.val}</div>
                      </div>
                  ))}
              </div>
              
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                      <span className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">Recent Invoices</span>
                  </div>
                  <table className="w-full text-sm text-left text-black dark:text-white">
                      <thead className="text-xs text-gray-400 uppercase bg-white dark:bg-[#1C1C1E] border-b border-gray-100 dark:border-white/10">
                          <tr>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3">Client</th>
                              <th className="px-6 py-3">Amount</th>
                              <th className="px-6 py-3">Date</th>
                              <th className="px-6 py-3"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                          {MOCK_INVOICES.map(inv => (
                              <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                  <td className="px-6 py-4">
                                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border ${
                                          inv.status === 'Paid' ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 
                                          inv.status === 'Overdue' ? 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white' : 
                                          'bg-gray-100 text-gray-600 border-transparent dark:bg-white/10 dark:text-gray-300'
                                      }`}>
                                          {inv.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 font-bold text-black dark:text-white">{inv.client}</td>
                                  <td className="px-6 py-4 font-mono">{inv.amount}</td>
                                  <td className="px-6 py-4 text-gray-500 text-xs">{inv.dueDate}</td>
                                  <td className="px-6 py-4 text-right">
                                      <button className="text-gray-400 hover:text-black dark:hover:text-white"><MoreHorizontal size={16}/></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  );

  const LegalView = () => (
      <div className="h-full flex flex-col p-8 overflow-hidden bg-white dark:bg-black">
           <div className="flex justify-between items-center mb-8">
              <div>
                  <h3 className="text-3xl font-light tracking-tighter text-black dark:text-white">Contracts</h3>
                  <p className="text-gray-500 text-sm mt-1 font-light">Legal Documents & Templates</p>
              </div>
              <button className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  <Plus size={16}/> New Contract
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_CONTRACTS.map(c => (
                  <div key={c.id} className="bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm hover:border-black dark:hover:border-white transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-black dark:text-white border border-gray-100 dark:border-white/5"><FileSignature size={20}/></div>
                          <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded text-[10px] font-bold uppercase">{c.status}</span>
                      </div>
                      <h4 className="font-bold text-lg text-black dark:text-white mb-1">{c.title}</h4>
                      <p className="text-sm text-gray-500 mb-4">{c.client}</p>
                      <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between text-xs text-gray-400">
                          <span>{c.lastActivity}</span>
                          <span className="font-medium text-black dark:text-white">{c.value}</span>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const AnalyticsView = () => (
      <div className="h-full flex flex-col p-8 overflow-hidden bg-white dark:bg-black">
          <div className="flex justify-between items-center mb-8">
              <div>
                  <h3 className="text-3xl font-light tracking-tighter text-black dark:text-white">Analytics</h3>
                  <p className="text-gray-500 text-sm mt-1 font-light">Performance Metrics</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-lg">
                  <button className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-white/20 text-black dark:text-white rounded-md shadow-sm">This Month</button>
                  <button className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white">Last Quarter</button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                  { title: 'Lifetime Value', val: '$18.5k', icon: Award },
                  { title: 'Acquisition Cost', val: '$450', icon: UserPlus },
                  { title: 'Close Rate', val: '42%', icon: Target },
                  { title: 'Profit Margin', val: '62%', icon: TrendingUp },
              ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col justify-between h-32">
                      <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.title}</span>
                          <stat.icon size={16} className="text-black dark:text-white"/>
                      </div>
                      <div className="text-2xl font-bold tracking-tight text-black dark:text-white">{stat.val}</div>
                  </div>
              ))}
          </div>
      </div>
  );

  const ClientPortalView = () => {
      const [isAdminMode, setIsAdminMode] = useState(true);
      const [showShareModal, setShowShareModal] = useState(false);
      const [activeTab, setActiveTab] = useState<'dashboard' | 'files' | 'invoices' | 'messages'>('dashboard');
      
      const projectStages = ['Discovery', 'Design', 'Revision', 'Delivery'];
      const currentStageIndex = 1; // Design is active

      const ShareModal = () => (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-2xl shadow-2xl p-6 animate-scale-in border border-gray-200 dark:border-white/10">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-black dark:text-white">Share Portal</h3>
                      <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-black dark:text-white"><X size={20}/></button>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-between mb-4">
                      <code className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1 mr-2">portal.studio.os/c/velvet-vine-23</code>
                      <button className="text-xs font-bold text-black dark:text-white hover:underline">Copy</button>
                  </div>
                  <button onClick={() => { alert("Invite sent!"); setShowShareModal(false); }} className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200">Send Invite</button>
              </div>
          </div>
      );

      return (
          <div className="h-full flex flex-col bg-white dark:bg-black relative">
              {showShareModal && <ShareModal />}
              
              {/* Admin Overlay Toggle */}
              <div className="bg-black dark:bg-[#1C1C1E] text-white px-6 py-2 flex justify-between items-center text-xs font-medium sticky top-0 z-50">
                  <div className="flex items-center gap-2">
                      <Eye size={14} className="text-gray-400"/>
                      {isAdminMode ? "Admin View" : "Client Simulation"}
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white/10 rounded-lg p-0.5">
                          <button onClick={() => setIsAdminMode(true)} className={`px-3 py-1 rounded-md transition-all ${isAdminMode ? 'bg-white text-black' : 'hover:text-gray-300'}`}>Admin</button>
                          <button onClick={() => setIsAdminMode(false)} className={`px-3 py-1 rounded-md transition-all ${!isAdminMode ? 'bg-white text-black' : 'hover:text-gray-300'}`}>Client</button>
                      </div>
                      <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 bg-white text-black px-3 py-1.5 rounded-md transition-colors font-bold text-[10px] uppercase tracking-wider">
                          Share
                      </button>
                  </div>
              </div>

              {/* Portal Content */}
              <div className="flex-1 overflow-hidden flex flex-col max-w-6xl mx-auto w-full p-8">
                  {/* Brand Header */}
                  <div className="flex justify-between items-center mb-12">
                      <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-none flex items-center justify-center text-3xl font-light">V</div>
                          <div>
                              <h2 className="text-3xl font-light text-black dark:text-white leading-none tracking-tighter">Velvet & Vine</h2>
                              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Fall 2024 Collection</p>
                          </div>
                      </div>
                      {/* Nav */}
                      <div className="flex gap-1">
                          {['Overview', 'Files', 'Invoices', 'Messages'].map(tab => (
                              <button 
                                  key={tab}
                                  onClick={() => setActiveTab(tab.toLowerCase() as any)}
                                  className={`px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.toLowerCase() ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                              >
                                  {tab}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Main View Area */}
                  <div className="flex-1 overflow-y-auto">
                      {activeTab === 'dashboard' && (
                          <div className="space-y-12 animate-fade-in-up">
                              {/* Project Overview & Next Action */}
                              <div className="flex flex-col gap-6">
                                  {/* Project Details Header */}
                                  <div className="flex justify-between items-end border-b border-gray-100 dark:border-white/10 pb-6">
                                      <div>
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Active Project</span>
                                          <h2 className="text-4xl font-light text-black dark:text-white tracking-tighter">Fall 2024 Collection</h2>
                                          <p className="text-xs text-gray-500 mt-1">Ref: #VV-24-001</p>
                                      </div>
                                      <div className="text-right">
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Current Stage</span>
                                          <div className="text-xl font-medium text-black dark:text-white tracking-tight">{projectStages[currentStageIndex]}</div>
                                      </div>
                                  </div>

                                  {/* Next Action Banner */}
                                  <div className="bg-black dark:bg-[#1C1C1E] text-white p-6 flex flex-col md:flex-row justify-between items-center group cursor-pointer hover:bg-gray-900 dark:hover:bg-[#2C2C2E] transition-colors shadow-lg">
                                      <div className="mb-4 md:mb-0">
                                          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Next Action Required</div>
                                          <div className="text-lg font-medium tracking-tight">Review & Approve: Tech Pack V2</div>
                                      </div>
                                      <div className="bg-white dark:bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-2">
                                          Review Now <ArrowRight size={14}/>
                                      </div>
                                  </div>
                              </div>

                              {/* Status Tracker */}
                              <div>
                                  <h4 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">Timeline & Milestones</h4>
                                  <div className="relative">
                                      <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 dark:bg-white/10 -translate-y-1/2"></div>
                                      <div className="relative flex justify-between">
                                          {projectStages.map((step, i) => {
                                              const status = i < currentStageIndex ? 'completed' : i === currentStageIndex ? 'current' : 'pending';
                                              return (
                                                  <div key={step} className="flex flex-col items-center gap-4 bg-white dark:bg-black px-2 z-10 min-w-[100px]">
                                                      <div className={`w-3 h-3 rounded-full border-2 transition-colors ${
                                                          status === 'completed' ? 'bg-black dark:bg-white border-black dark:border-white' : 
                                                          status === 'current' ? 'bg-white dark:bg-black border-black dark:border-white ring-4 ring-gray-100 dark:ring-white/10' : 'bg-white dark:bg-black border-gray-300 dark:border-gray-600'
                                                      }`} />
                                                      <span className={`text-[10px] font-bold uppercase tracking-widest ${status === 'pending' ? 'text-gray-300 dark:text-gray-600' : 'text-black dark:text-white'}`}>{step}</span>
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  {/* Approvals */}
                                  <div className="border border-gray-200 dark:border-white/10 p-8 rounded-none flex flex-col relative group hover:border-black dark:hover:border-white transition-colors">
                                      <div className="absolute top-4 right-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Action Required</div>
                                      <h4 className="text-lg font-medium text-black dark:text-white mb-6 tracking-tight">Approvals</h4>
                                      <div className="space-y-4">
                                          <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/10">
                                              <div className="flex items-center gap-4">
                                                  <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400"><FileText size={20}/></div>
                                                  <div>
                                                      <div className="text-sm font-bold text-black dark:text-white">Tech Pack V2.pdf</div>
                                                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">Added Today</div>
                                                  </div>
                                              </div>
                                              <div className="flex gap-2">
                                                  <button className="text-xs font-bold underline decoration-1 underline-offset-4 hover:text-gray-600 dark:hover:text-gray-300 text-black dark:text-white">Review</button>
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Invoices */}
                                  <div className="border border-gray-200 dark:border-white/10 p-8 rounded-none flex flex-col group hover:border-black dark:hover:border-white transition-colors">
                                      <h4 className="text-lg font-medium text-black dark:text-white mb-6 tracking-tight">Outstanding Invoices</h4>
                                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                          <div>
                                              <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Due Oct 30</div>
                                              <div className="text-2xl font-bold text-black dark:text-white">$4,500.00</div>
                                          </div>
                                          <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-900 dark:hover:bg-gray-200">
                                              Pay Now
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  // --- Main Layout ---

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-0 py-0 overflow-hidden">
      
      <div className="w-full h-full flex flex-col animate-scale-in bg-white dark:bg-black">
        
        {/* Main Content Split */}
        <div className="flex flex-1 overflow-hidden">
            
            {/* Viewport Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-white dark:bg-black">
                <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 rounded-full text-black dark:text-white transition-colors">
                    <X size={20} />
                </button>

                {activeView === 'crm' && <CRMView />}
                {activeView === 'projects' && <ProjectManagementView />}
                {activeView === 'finance' && <FinanceView />}
                {activeView === 'legal' && <LegalView />}
                {activeView === 'analytics' && <AnalyticsView />}
                {activeView === 'portal' && <ClientPortalView />}

            </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHubView;