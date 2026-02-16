import React, { useState, useRef, useEffect } from 'react';
import { Printer, ArrowLeft, Shirt, Sparkles, User, FolderOpen, Save, Layers, Plus, Clock, Crown, ArrowRight, Image as ImageIcon, Search, Zap, TrendingUp, Settings2, ChevronDown, Check, BarChart3, Lightbulb, Camera, Loader2, Globe, Calendar, Leaf, Footprints, GraduationCap, LineChart, ArrowUpRight, ArrowDownRight, Moon, Sun, PenTool, Briefcase, Activity, Users, Kanban, CreditCard, FileSignature, PieChart, DollarSign, Grip, X as XIcon, Layout, Minus, MoveHorizontal, MoveVertical, Grid } from 'lucide-react';
import { AppState, TechPackData, GeneratedImages, DesignAsset, Annotation, DrawingPath, PrintSettings, GraphicItem, PlacedGraphic, MeasurementLine, FloodFill } from './types';
import { analyzeGarmentImage, generateTechnicalSketch, vectorizeImage, generateRealisticMockup, recreateGraphic, modifyTechPack, translateTechPack } from './services/geminiService';
import TechPackView from './components/TechPackView';
import ProfileView from './components/ProfileView';
import DesignBankView from './components/DesignBankView';
import FactoryMatchingView from './components/FactoryMatchingView';
import ClientHubView, { ViewMode } from './components/ClientHubView';

// --- App Configuration & Widget Definitions ---

type WidgetId = 'design_assistant' | 'vault' | 'crm' | 'projects' | 'finance' | 'analytics' | 'legal' | 'calendar' | 'client_hub' | 'launcher';

interface AppConfig {
    id: WidgetId;
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    iconBg: string;
    render?: (props: any) => React.ReactNode;
}

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`font-sans leading-none select-none flex items-baseline ${className}`}>
    <span className="font-[900] tracking-[-0.06em]">des</span>
    <span className="font-[100] tracking-[-0.03em]">board</span>
  </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [techData, setTechData] = useState<TechPackData | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages>({ frontSketch: null, backSketch: null, sideSketch: null, frontVector: null, backVector: null, sideVector: null, mockup: null });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProMode, setIsProMode] = useState<boolean>(false);
  const [vectorizingSide, setVectorizingSide] = useState<'front' | 'back' | 'side' | null>(null);
  const [isGeneratingMockup, setIsGeneratingMockup] = useState<boolean>(false);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({ format: 'a4', orientation: 'portrait' });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  // Dashboard State
  const [activeWidgetIds, setActiveWidgetIds] = useState<WidgetId[]>([
      'design_assistant', 'launcher', 'vault', 'crm', 'projects', 'finance', 'analytics', 'legal', 'client_hub', 'calendar'
  ]);

  // Drag and Drop State
  const [draggedId, setDraggedId] = useState<WidgetId | null>(null);

  // Widget Layout State
  const [layout, setLayout] = useState<Record<WidgetId, { w: number, h: number }>>({
      design_assistant: { w: 2, h: 2 },
      launcher: { w: 2, h: 1 },
      vault: { w: 1, h: 1 },
      crm: { w: 1, h: 1 },
      projects: { w: 1, h: 1 },
      finance: { w: 1, h: 1 },
      analytics: { w: 1, h: 1 },
      legal: { w: 1, h: 1 },
      client_hub: { w: 1, h: 1 },
      calendar: { w: 2, h: 1 },
  });

  // Helper maps for Tailwind classes to avoid purging
  const colSpanMap: Record<number, string> = { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4' };
  const rowSpanMap: Record<number, string> = { 1: 'row-span-1', 2: 'row-span-2', 3: 'row-span-3', 4: 'row-span-4' };

  // Modals
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showDesignBank, setShowDesignBank] = useState<boolean>(false);
  const [showFactoryMatching, setShowFactoryMatching] = useState<boolean>(false);
  const [showClientHub, setShowClientHub] = useState<boolean>(false);
  const [designBankMode, setDesignBankMode] = useState<'view' | 'pick_logo'>('view');
  
  // Logic
  const [brandLogo, setBrandLogo] = useState<string | undefined>(undefined);
  const [isModifying, setIsModifying] = useState(false);
  const [designAssets, setDesignAssets] = useState<DesignAsset[]>([
    { id: 'f1', type: 'folder', name: 'FW24 Collection', date: 'Oct 24', parentId: null },
    { id: 'f2', type: 'folder', name: 'Client Assets', date: 'Oct 23', parentId: null },
    { id: '1', type: 'logo', name: 'Studio Logo Black', url: 'https://cdn.iconscout.com/icon/free/png-256/free-apple-1869032-1583196.png', date: 'Oct 24', parentId: 'f2', client: 'Acme Co', status: 'completed' },
  ]);
  const [isFootwearMode, setIsFootwearMode] = useState(false);

  // Studio OS State
  const [studioInitialView, setStudioInitialView] = useState<ViewMode>('crm');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply Dark Mode Class to Body and HTML for Tailwind
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
      const styleId = 'dynamic-print-styles';
      let styleEl = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
      styleEl.innerHTML = `@media print { @page { size: ${printSettings.format} ${printSettings.orientation}; margin: 0; } }`;
  }, [printSettings]);

  // Handle Splash Screen Timer
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setSplashFading(true);
    }, 2200);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const handleOpenStudio = (view: ViewMode) => {
      if (isEditMode) return;
      setStudioInitialView(view);
      setShowClientHub(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'clothing' | 'footwear' = 'clothing') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsFootwearMode(type === 'footwear');
    setState(AppState.IDLE); setTechData(null); setGeneratedImages({ frontSketch: null, backSketch: null, sideSketch: null }); setErrorMsg(null);
    const promises = Array.from(files).map((file: File) => new Promise<string>(resolve => {
        const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(file);
    }));
    Promise.all(promises).then(imgs => { setUploadedImages(imgs); processImages(imgs, type); });
  };

  const processImages = async (base64Images: string[], type: 'clothing' | 'footwear') => {
    setState(AppState.ANALYZING);
    try {
      const cleanImages = base64Images.map(img => img.split(',')[1]);
      const data = await analyzeGarmentImage(cleanImages, type); 
      setTechData(data);
      setState(AppState.GENERATING_SKETCHES);
      
      const front = await generateTechnicalSketch(data.sketchPrompts.front, cleanImages[0]).catch(() => null);
      if (front) await new Promise(r => setTimeout(r, 5000)); 

      const back = await generateTechnicalSketch(data.sketchPrompts.back, cleanImages.length > 1 ? cleanImages[1] : undefined).catch(() => null);
      if (back) await new Promise(r => setTimeout(r, 5000));

      const side = await generateTechnicalSketch(data.sketchPrompts.side, cleanImages.length > 2 ? cleanImages[2] : undefined).catch(() => null);
      
      const graphics: GraphicItem[] = [];
      if (data.graphics) {
          for (const g of data.graphics) {
              try {
                  const imageUrl = await recreateGraphic(g.description, g.technique);
                  graphics.push({ ...g, imageUrl });
              } catch (e) {
                  graphics.push(g);
              }
          }
      }

      let frontVec = null, backVec = null, sideVec = null;
      try {
          if (front) { frontVec = await vectorizeImage(front).catch(() => null); await new Promise(r => setTimeout(r, 1000)); }
          if (back) { backVec = await vectorizeImage(back).catch(() => null); await new Promise(r => setTimeout(r, 1000)); }
          if (side) { sideVec = await vectorizeImage(side).catch(() => null); }
      } catch (e) { console.warn("Vectorization failed", e); }

      setGeneratedImages({ frontSketch: front, backSketch: back, sideSketch: side, frontVector: frontVec, backVector: backVec, sideVector: sideVec, mockup: null });
      
      let frontPlacedGraphics: PlacedGraphic[] = [];
      if (data && front) {
          frontPlacedGraphics = data.graphics?.map((g, i) => ({
              id: `pg-${Date.now()}-${i}`,
              x: 50,
              y: 40 + (i * 15),
              width: 25,
              imageUrl: 'https://via.placeholder.com/150/000000/FFFFFF?text=LOGO+HERE'
          })) || [];
      }
      
      // Intelligent Measurement Line Placement Logic (Shortened for brevity as per original)
      const frontLines = (data.measurements || []).slice(0,5).map((m, i) => ({ id: `auto-${i}`, start: {x: 36, y: 30 + i*10}, end: {x: 64, y: 30 + i*10}, label: m.code }));

      setTechData(prev => prev ? { 
          ...prev, 
          frontPlacedGraphics,
          graphics: graphics,
          frontFills: [], backFills: [], sideFills: [],
          frontMeasurementLines: frontLines, backMeasurementLines: [], sideMeasurementLines: []
      } : null);

      setState(AppState.COMPLETE);
    } catch (error: any) {
      console.error(error); setErrorMsg(error.message); setState(AppState.ERROR);
    }
  };

  const handleModifyDesign = async (instruction: string) => {
      if (!techData) return;
      setIsModifying(true);
      try {
          const newData = await modifyTechPack(techData, instruction);
          setTechData(newData);
          // Simplified re-gen flow
          const front = await generateTechnicalSketch(newData.sketchPrompts.front).catch(() => null);
          setGeneratedImages(prev => ({ ...prev, frontSketch: front }));
      } catch (e) { console.error(e); alert("Failed to modify design."); } finally { setIsModifying(false); }
  };

  const handleTranslate = async (lang: string) => {
      if (!techData) return;
      try { const newData = await translateTechPack(techData, lang); setTechData(newData); } catch (e) { alert("Translation failed."); }
  };
  
  const handleSaveToBank = () => {
    if (!techData) return;
    const newAsset: DesignAsset = {
        id: Date.now().toString(), type: 'techpack', name: techData.styleName || 'Untitled', date: new Date().toLocaleDateString(),
        data: { techData, images: generatedImages, originalImages: uploadedImages },
        status: 'pending',
        parentId: null // Default to root
    };
    setDesignAssets(prev => [newAsset, ...prev]);
    alert("Saved!");
  };

  const triggerPrint = () => window.print();
  const resetApp = () => { setState(AppState.IDLE); setUploadedImages([]); setTechData(null); };
  const updateTechData = (d: TechPackData) => setTechData(d);
  const handleVectorize = async (side: 'front'|'back'|'side') => { 
      if(!isProMode) { setShowProfile(true); return; } 
      setVectorizingSide(side); 
      try { const svg = await vectorizeImage(side==='front'?generatedImages.frontSketch!:(side==='back'?generatedImages.backSketch!:generatedImages.sideSketch!)); setGeneratedImages(p=>({...p, [side==='front'?'frontVector':(side==='back'?'backVector':'sideVector')]: svg})); } finally { setVectorizingSide(null); } 
  };
  
  const handleGenerateMockup = async () => { 
      setIsGeneratingMockup(true); 
      if ((window as any).aistudio?.hasSelectedApiKey) { if (!await (window as any).aistudio.hasSelectedApiKey()) await (window as any).aistudio.openSelectKey(); }
      try { const m = await generateRealisticMockup(techData!, generatedImages.frontSketch); setGeneratedImages(p=>({...p, mockup: m})); } catch(e) { alert("Failed to generate mockup."); } finally { setIsGeneratingMockup(false); } 
  };

  const handleDirectLogoUpload = (file: File) => { const r = new FileReader(); r.onload = (e) => { const url = e.target?.result as string; setDesignAssets(p => [{id:Date.now().toString(), type:'logo', name:file.name, url, date: 'Now', parentId: null}, ...p]); setBrandLogo(url); }; r.readAsDataURL(file); };
  
  const cardClass = isDarkMode ? 'glass-card-dark border-white/10 hover:bg-white/5' : 'glass-card hover:bg-white/50';
  const textClass = isDarkMode ? 'text-white' : 'text-black';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  
  // Monochrome Style Helper
  const monoIconBg = isDarkMode ? 'bg-white/10' : 'bg-gray-100';

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, id: WidgetId) => {
      setDraggedId(id);
      e.dataTransfer.effectAllowed = 'move';
      // Optional: Set a drag image if desired
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: WidgetId) => {
      e.preventDefault();
      if (!draggedId || draggedId === targetId) return;

      const newOrder = [...activeWidgetIds];
      const sourceIndex = newOrder.indexOf(draggedId);
      const targetIndex = newOrder.indexOf(targetId);

      // Remove from old pos
      newOrder.splice(sourceIndex, 1);
      // Insert at new pos
      newOrder.splice(targetIndex, 0, draggedId);

      setActiveWidgetIds(newOrder);
      setDraggedId(null);
  };

  // --- Widget Definition Map ---
  const APP_CONFIGS: Record<WidgetId, AppConfig> = {
      design_assistant: {
          id: 'design_assistant',
          title: 'Design Assistant',
          subtitle: 'Generate specifications from photos',
          icon: Plus,
          color: isDarkMode ? 'bg-white text-black' : 'bg-black text-white',
          iconBg: isDarkMode ? 'bg-white' : 'bg-black',
          render: (props) => (
             <div onClick={() => !isEditMode && fileInputRef.current?.click()} className={`h-full flex flex-col justify-between relative`}>
                 <div className="relative z-10 h-full flex flex-col justify-between">
                     <div className={`${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                         <Plus size={24} strokeWidth={1.5}/>
                     </div>
                     <div>
                         <h2 className={`text-[32px] font-light tracking-tighter mb-1 ${textClass}`}>Design Assistant</h2>
                         <p className={`${subTextClass} font-light text-sm`}>Generate specifications from photos</p>
                     </div>
                 </div>
                 <input type="file" multiple ref={fileInputRef} onChange={(e) => handleFileChange(e, 'clothing')} className="hidden" />
             </div>
          )
      },
      launcher: {
          id: 'launcher',
          title: 'App Launcher',
          subtitle: 'External Tools',
          icon: Grid,
          color: textClass,
          iconBg: monoIconBg,
          render: () => (
              <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                          <Grid size={18} strokeWidth={1.5} className={textClass} />
                          <span className={`${textClass} font-medium tracking-tight text-sm`}>App Launcher</span>
                      </div>
                  </div>
                  <div className="flex-1 flex items-center gap-3 px-2">
                      {/* Photoshop */}
                      <a href="#" onClick={(e) => e.preventDefault()} className="group flex-1 aspect-square rounded-xl bg-[#001E36] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-sm border border-[#31A8FF]/20 relative overflow-hidden">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform z-10" alt="Ps"/>
                          <div className="absolute inset-0 bg-[#31A8FF]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </a>
                      {/* Illustrator */}
                      <a href="#" onClick={(e) => e.preventDefault()} className="group flex-1 aspect-square rounded-xl bg-[#330000] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-sm border border-[#FF9A00]/20 relative overflow-hidden">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fb/Adobe_Illustrator_CC_icon.svg" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform z-10" alt="Ai"/>
                          <div className="absolute inset-0 bg-[#FF9A00]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </a>
                      {/* Lightroom */}
                      <a href="#" onClick={(e) => e.preventDefault()} className="group flex-1 aspect-square rounded-xl bg-[#001E36] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-sm border border-[#31A8FF]/20 relative overflow-hidden">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b6/Adobe_Photoshop_Lightroom_CC_logo.svg" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform z-10" alt="Lr"/>
                          <div className="absolute inset-0 bg-[#31A8FF]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </a>
                  </div>
              </div>
          )
      },
      vault: {
          id: 'vault',
          title: 'Vault',
          subtitle: `${designAssets.length} assets`,
          icon: FolderOpen,
          color: textClass,
          iconBg: monoIconBg,
      },
      crm: {
          id: 'crm',
          title: 'CRM',
          subtitle: '3 Proposals',
          icon: Users,
          color: textClass,
          iconBg: monoIconBg,
      },
      projects: {
          id: 'projects',
          title: 'Projects',
          subtitle: '4 Active • 2 Review',
          icon: Kanban,
          color: textClass,
          iconBg: monoIconBg,
      },
      finance: {
          id: 'finance',
          title: '$42.5k',
          subtitle: 'Revenue',
          icon: DollarSign,
          color: textClass,
          iconBg: monoIconBg,
      },
      analytics: {
          id: 'analytics',
          title: 'Studio Mode',
          subtitle: 'Studio Health',
          icon: PieChart,
          color: textClass,
          iconBg: monoIconBg,
      },
      legal: {
          id: 'legal',
          title: 'Contracts',
          subtitle: 'Templates & Sign',
          icon: FileSignature,
          color: textClass,
          iconBg: monoIconBg,
      },
      client_hub: {
          id: 'client_hub',
          title: 'Client Hub',
          subtitle: 'Portals & Requests',
          icon: Globe,
          color: textClass,
          iconBg: monoIconBg,
      },
      calendar: {
          id: 'calendar',
          title: 'Calendar',
          subtitle: 'Upcoming',
          icon: Calendar,
          color: textClass,
          iconBg: monoIconBg,
          render: (props) => (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} strokeWidth={1.5} className={textClass} />
                        <span className={`${textClass} font-medium tracking-tight text-sm`}>Calendar</span>
                    </div>
                    <div className={`${subTextClass} text-[10px]`}>Upcoming</div>
                </div>
                <div className="space-y-3">
                    <div className={`flex items-center justify-between p-2 rounded-xl border ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-white/50 border-white/50'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center leading-none ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                                <span className={`text-[7px] font-bold uppercase ${subTextClass}`}>May</span>
                                <span className={`text-[11px] font-bold ${textClass}`}>24</span>
                            </div>
                            <div>
                                <div className={`text-[12px] font-medium ${textClass}`}>Sample Review</div>
                                <div className={`text-[10px] ${subTextClass}`}>10:00 AM • Studio</div>
                            </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                </div>
            </div>
          )
      }
  };

  const handleWidgetClick = (id: WidgetId) => {
      if (isEditMode) return;
      if (id === 'design_assistant') return; // Handled internally by input ref
      if (id === 'launcher') return; // No action on container click
      if (id === 'vault') { setDesignBankMode('view'); setShowDesignBank(true); return; }
      if (id === 'calendar') return; // Just a view for now
      
      // Studio apps
      if (['crm', 'projects', 'finance', 'analytics', 'legal', 'client_hub'].includes(id)) {
          const viewMode = id === 'client_hub' ? 'portal' : (id as ViewMode);
          handleOpenStudio(viewMode);
      }
  };

  const toggleWidget = (id: WidgetId) => {
      if (activeWidgetIds.includes(id)) {
          setActiveWidgetIds(prev => prev.filter(w => w !== id));
      } else {
          setActiveWidgetIds(prev => [...prev, id]);
      }
  };

  const updateWidgetSize = (id: WidgetId, dW: number, dH: number) => {
      setLayout(prev => {
          const current = prev[id] || { w: 1, h: 1 };
          const newW = Math.max(1, Math.min(4, current.w + dW));
          const newH = Math.max(1, Math.min(4, current.h + dH));
          return { ...prev, [id]: { w: newW, h: newH } };
      });
  };

  // --- Dock Component ---
  const Dock = () => (
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-2xl border border-white/20 rounded-2xl p-2.5 flex items-center gap-3 shadow-2xl z-[60] transition-all duration-300 ${isEditMode ? 'translate-y-0 scale-100' : 'translate-y-32 scale-90 opacity-0 pointer-events-none hover:translate-y-0 hover:scale-100 hover:opacity-100 pointer-events-auto'}`}>
          {Object.values(APP_CONFIGS).map((app) => {
              const isActive = activeWidgetIds.includes(app.id);
              return (
                  <div key={app.id} className="relative group">
                      <button 
                          onClick={() => isEditMode ? toggleWidget(app.id) : handleWidgetClick(app.id)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-2 active:scale-95 ${app.iconBg} ${isActive && isEditMode ? 'opacity-50 grayscale' : 'shadow-lg'}`}
                          title={app.title}
                      >
                          <app.icon size={24} className={app.color.split(' ')[0].includes('bg') ? 'text-white' : app.color} strokeWidth={1.5} />
                      </button>
                      
                      {/* Active Dot */}
                      {isActive && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full dark:bg-white/80"></div>}
                      
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {app.title}
                      </div>
                  </div>
              );
          })}
          <div className="w-px h-8 bg-black/10 dark:bg-white/10 mx-1"></div>
          {/* Edit Mode Toggle in Dock */}
          <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:bg-white/40 ${isEditMode ? 'bg-black text-white shadow-inner' : 'bg-transparent text-black dark:text-white'}`}
              title={isEditMode ? "Done" : "Customize"}
          >
              {isEditMode ? <Check size={20} /> : <Settings2 size={20} />}
          </button>
      </div>
  );

  if (showClientHub) {
      return (
          <>
            <ClientHubView isOpen={true} onClose={() => setShowClientHub(false)} initialView={studioInitialView} isDarkMode={isDarkMode} />
          </>
      );
  }

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden selection:bg-purple-500/30 ${isDarkMode ? 'text-white' : 'text-[#1D1D1F]'}`}>
      
      {/* Splash Screen */}
      {showSplash && (
          <div className={`fixed inset-0 z-[100] flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-[#F2F2F7]'} ${splashFading ? 'animate-fade-out' : ''}`}>
              <div className="flex flex-col items-center animate-fade-in-up">
                  <div className={`text-[80px] md:text-[120px] ${isDarkMode ? 'text-white' : 'text-black'} loading-logo-text`}>
                      <Logo />
                  </div>
              </div>
          </div>
      )}

      <ProfileView isOpen={showProfile} onClose={() => setShowProfile(false)} isPro={isProMode} onTogglePro={() => setIsProMode(!isProMode)} isDarkMode={isDarkMode} />
      <DesignBankView 
        isOpen={showDesignBank} 
        onClose={() => setShowDesignBank(false)} 
        assets={designAssets} 
        onUpload={handleDirectLogoUpload} 
        onDelete={(id) => setDesignAssets(p => p.filter(a => a.id !== id))} 
        onSelect={(a) => { if(a.type==='logo') { setBrandLogo(a.url); setShowDesignBank(false); }}} 
        onUpdateAsset={(id, updates) => setDesignAssets(p => p.map(a => a.id === id ? { ...a, ...updates } : a))}
        onCreateFolder={(name, parentId) => setDesignAssets(p => [{ id: Date.now().toString(), type: 'folder', name, date: new Date().toLocaleDateString(), parentId: parentId }, ...p])}
        mode={designBankMode}
        isDarkMode={isDarkMode}
      />
      {techData && <FactoryMatchingView isOpen={showFactoryMatching} onClose={() => setShowFactoryMatching(false)} data={techData} />}

      {/* Main Content Area */}
      {techData ? (
         <div className="relative animate-fade-in-up">
             <div className="absolute top-4 left-4 z-50 no-print">
                 <button onClick={resetApp} className="p-2 bg-white/50 hover:bg-white backdrop-blur rounded-full text-black shadow-sm transition-all"><ArrowLeft size={20}/></button>
             </div>
             <TechPackView 
                data={techData} 
                images={generatedImages} 
                originalImages={uploadedImages}
                isProMode={isProMode}
                onDataChange={updateTechData}
                brandLogo={brandLogo}
                onOpenLogoPicker={() => { setDesignBankMode('pick_logo'); setShowDesignBank(true); }}
                onUploadLogo={handleDirectLogoUpload}
                onSaveToBank={handleSaveToBank}
                onVectorize={handleVectorize}
                vectorizingSide={vectorizingSide}
                onAnnotationChange={(side, a) => setTechData(prev => prev ? {...prev, [side === 'front' ? 'frontAnnotations' : side === 'back' ? 'backAnnotations' : 'sideAnnotations']: a} : null)}
                onDrawingChange={(side, d) => setTechData(prev => prev ? {...prev, [side === 'front' ? 'frontDrawings' : side === 'back' ? 'backDrawings' : 'sideDrawings']: d} : null)}
                onMeasurementLineChange={(side, l) => setTechData(prev => prev ? {...prev, [side === 'front' ? 'frontMeasurementLines' : side === 'back' ? 'backMeasurementLines' : 'sideMeasurementLines']: l} : null)}
                onPlacedGraphicsChange={(side, g) => setTechData(prev => prev ? {...prev, [side === 'front' ? 'frontPlacedGraphics' : side === 'back' ? 'backPlacedGraphics' : 'sidePlacedGraphics']: g} : null)}
                onFillsChange={(side, f) => setTechData(prev => prev ? {...prev, [side === 'front' ? 'frontFills' : side === 'back' ? 'backFills' : 'sideFills']: f} : null)}
                onSketchReplace={(side, b64) => setGeneratedImages(prev => ({...prev, [side === 'front' ? 'frontSketch' : side === 'back' ? 'backSketch' : 'sideSketch']: b64}))}
                onGenerateMockup={handleGenerateMockup}
                isGeneratingMockup={isGeneratingMockup}
                printSettings={printSettings}
                onPrintSettingsChange={setPrintSettings}
                onTriggerPrint={triggerPrint}
                onModifyDesign={handleModifyDesign}
                isModifying={isModifying}
                onOpenFactoryMatching={() => setShowFactoryMatching(true)}
                onTranslate={handleTranslate}
                isFootwearMode={isFootwearMode}
                isDarkMode={isDarkMode}
             />
         </div>
      ) : (
          state === AppState.IDLE && uploadedImages.length === 0 ? (
          <div className="min-h-screen p-4 md:p-12 flex flex-col justify-center max-w-7xl mx-auto relative pb-32">
             
             {/* Header */}
             <div className="flex justify-between items-center mb-8 md:mb-12 animate-fade-in-up">
                 <div className="flex flex-col">
                     <div className={`text-[40px] mb-2 ${textClass}`}>
                         <Logo />
                     </div>
                     <div className={`text-[16px] md:text-[20px] font-light tracking-tight ${subTextClass}`}>Good Morning, <span className="font-medium">Bus1nessonly</span></div>
                 </div>
                 <div className="flex items-center gap-4">
                     <button onClick={() => setIsEditMode(!isEditMode)} className={`p-3 rounded-full transition-all border shadow-sm ${isEditMode ? 'bg-black text-white border-black' : (isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white/50 border-white/40 text-black')}`}>
                         {isEditMode ? <Check size={18} /> : <Settings2 size={18} strokeWidth={1.5} />}
                     </button>
                     <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-full transition-all border shadow-sm ${isDarkMode ? 'bg-white/10 border-white/20 text-yellow-400' : 'bg-white/50 border-white/40 text-gray-600'}`}>
                         {isDarkMode ? <Sun size={18} strokeWidth={1.5}/> : <Moon size={18} strokeWidth={1.5}/>}
                     </button>
                     <button className={`p-3 rounded-full transition-all border shadow-sm ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white/50 border-white/40 text-black'}`}><Search size={18} strokeWidth={1.5} /></button>
                     <div onClick={() => setShowProfile(true)} className="w-10 h-10 rounded-full cursor-pointer bg-black text-white flex items-center justify-center font-medium text-xs hover:scale-105 transition-transform shadow-lg border border-white/20">BO</div>
                 </div>
             </div>
             
             {/* Dashboard Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-auto gap-4 md:gap-6 md:auto-rows-[180px] mb-8 animate-fade-in-up">
                 
                 {activeWidgetIds.map(id => {
                     const app = APP_CONFIGS[id];
                     if (!app) return null;
                     
                     const dims = layout[id] || { w: 1, h: 1 };
                     const colClass = colSpanMap[dims.w] || 'col-span-1';
                     const rowClass = rowSpanMap[dims.h] || 'row-span-1';
                     
                     return (
                         <div 
                            key={id}
                            draggable={isEditMode}
                            onDragStart={(e) => isEditMode && handleDragStart(e, id)}
                            onDragOver={(e) => isEditMode && handleDragOver(e)}
                            onDrop={(e) => isEditMode && handleDrop(e, id)}
                            onClick={() => handleWidgetClick(id)}
                            className={`
                                col-span-${Math.min(2, dims.w)} md:${colClass} ${rowClass}
                                ${cardClass} rounded-[32px] p-5 
                                cursor-pointer flex flex-col justify-between group relative
                                transition-all duration-300
                                ${isEditMode ? 'animate-jiggle ring-2 ring-gray-300/50 scale-[0.98] cursor-move' : 'hover:scale-[1.01]'}
                                ${draggedId === id ? 'opacity-50' : ''}
                            `}
                         >
                             {isEditMode && (
                                <>
                                    <div className="absolute inset-0 z-30 bg-white/20 backdrop-blur-[1px] rounded-[32px] pointer-events-none" />
                                    
                                    {/* Delete Button */}
                                    <div className="absolute top-2 left-2 z-50 pointer-events-auto">
                                        <button onClick={(e) => { e.stopPropagation(); toggleWidget(id); }} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-sm transition-colors flex items-center justify-center">
                                            <XIcon size={12} strokeWidth={3} />
                                        </button>
                                    </div>

                                    {/* Resize Controls */}
                                    <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-50 pointer-events-auto">
                                        {/* Width Controls */}
                                        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-lg p-1 shadow-sm">
                                            <button onClick={(e) => { e.stopPropagation(); updateWidgetSize(id, -1, 0); }} className="p-1 hover:bg-white/20 rounded text-white"><Minus size={10} /></button>
                                            <MoveHorizontal size={10} className="text-white opacity-50" />
                                            <button onClick={(e) => { e.stopPropagation(); updateWidgetSize(id, 1, 0); }} className="p-1 hover:bg-white/20 rounded text-white"><Plus size={10} /></button>
                                        </div>
                                        {/* Height Controls */}
                                        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-lg p-1 shadow-sm">
                                            <button onClick={(e) => { e.stopPropagation(); updateWidgetSize(id, 0, -1); }} className="p-1 hover:bg-white/20 rounded text-white"><Minus size={10} /></button>
                                            <MoveVertical size={10} className="text-white opacity-50" />
                                            <button onClick={(e) => { e.stopPropagation(); updateWidgetSize(id, 0, 1); }} className="p-1 hover:bg-white/20 rounded text-white"><Plus size={10} /></button>
                                        </div>
                                    </div>
                                </>
                             )}

                             {app.render ? app.render({}) : (
                                 <>
                                     <div className="flex justify-between items-start pointer-events-none">
                                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${app.iconBg} ${app.color}`}>
                                             <app.icon size={20} strokeWidth={1.5}/>
                                         </div>
                                     </div>
                                     <div className="pointer-events-none">
                                         <div className={`${textClass} font-medium text-lg tracking-tight`}>{app.title}</div>
                                         <div className={`${subTextClass} font-light text-xs mt-1`}>{app.subtitle}</div>
                                     </div>
                                 </>
                             )}
                         </div>
                     );
                 })}
                 
                 {/* Add Button in Edit Mode */}
                 {isEditMode && (
                     <div className={`col-span-1 row-span-1 rounded-[32px] border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 opacity-50`}>
                         <Plus size={32} />
                     </div>
                 )}
                 
             </div>

             {/* Dock / App Library */}
             <Dock />

          </div>
          ) : (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
                <Loader2 className="animate-spin mb-4 text-black" size={48} />
                <h2 className="text-xl font-bold tracking-tight loading-logo-text">Analyzing Garment...</h2>
                <p className="text-gray-400 mt-2 text-sm">Identifying construction details & measurements</p>
            </div>
          )
      )}
    </div>
  );
};

export default App;