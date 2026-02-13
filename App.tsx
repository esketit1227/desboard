
import React, { useState, useRef, useEffect } from 'react';
import { Printer, ArrowLeft, Shirt, Sparkles, User, FolderOpen, Save, Layers, Plus, Clock, Crown, ArrowRight, Image as ImageIcon, Search, Zap, TrendingUp, Settings2, ChevronDown, Check, BarChart3, Lightbulb, Camera, Loader2, Factory, Globe, Calendar, Leaf, Footprints, GraduationCap, LineChart, ArrowUpRight, ArrowDownRight, Moon, Sun, PenTool } from 'lucide-react';
import { AppState, TechPackData, GeneratedImages, DesignAsset, Annotation, DrawingPath, PrintSettings, GraphicItem, PlacedGraphic, MeasurementLine, FloodFill } from './types';
import { analyzeGarmentImage, generateTechnicalSketch, vectorizeImage, generateRealisticMockup, recreateGraphic, modifyTechPack, translateTechPack } from './services/geminiService';
import TechPackView from './components/TechPackView';
import ProfileView from './components/ProfileView';
import DesignBankView from './components/DesignBankView';
import FactoryMatchingView from './components/FactoryMatchingView';
import FabricLibraryView from './components/FabricLibraryView';
import PinterestTrendsView from './components/PinterestTrendsView';

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
  
  // Modals
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showDesignBank, setShowDesignBank] = useState<boolean>(false);
  const [showFactoryMatching, setShowFactoryMatching] = useState<boolean>(false);
  const [showFabricLibrary, setShowFabricLibrary] = useState<boolean>(false);
  const [showPinterestTrends, setShowPinterestTrends] = useState<boolean>(false);
  const [designBankMode, setDesignBankMode] = useState<'view' | 'pick_logo'>('view');
  
  // Logic
  const [brandLogo, setBrandLogo] = useState<string | undefined>(undefined);
  const [isModifying, setIsModifying] = useState(false);
  const [designAssets, setDesignAssets] = useState<DesignAsset[]>([
    { id: '1', type: 'logo', name: 'Studio Logo Black', url: 'https://cdn.iconscout.com/icon/free/png-256/free-apple-1869032-1583196.png', date: 'Oct 24' },
  ]);
  const [isFootwearMode, setIsFootwearMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply Dark Mode Class to Body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
      const styleId = 'dynamic-print-styles';
      let styleEl = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
      styleEl.innerHTML = `@media print { @page { size: ${printSettings.format} ${printSettings.orientation}; margin: 0; } }`;
  }, [printSettings]);

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
      
      const [front, back, side, graphics] = await Promise.all([
          generateTechnicalSketch(data.sketchPrompts.front, cleanImages[0]).catch(() => null),
          generateTechnicalSketch(data.sketchPrompts.back, cleanImages.length > 1 ? cleanImages[1] : undefined).catch(() => null),
          generateTechnicalSketch(data.sketchPrompts.side, cleanImages.length > 2 ? cleanImages[2] : undefined).catch(() => null),
          data.graphics ? Promise.all(data.graphics.map(async g => {
              try { return { ...g, imageUrl: await recreateGraphic(g.description, g.technique) }; } catch { return g; }
          })) : Promise.resolve([])
      ]);

      // Auto-vectorize sketches for Illustrator export
      let frontVec = null;
      let backVec = null;
      let sideVec = null;
      try {
          // Process sequentially to avoid rate limits
          if (front) frontVec = await vectorizeImage(front).catch(() => null);
          if (back) backVec = await vectorizeImage(back).catch(() => null);
          if (side) sideVec = await vectorizeImage(side).catch(() => null);
      } catch (e) {
          console.warn("Vectorization failed", e);
      }

      setGeneratedImages({ frontSketch: front, backSketch: back, sideSketch: side, frontVector: frontVec, backVector: backVec, sideVector: sideVec, mockup: null });
      
      let frontPlacedGraphics: PlacedGraphic[] = [];
      if (data && front) {
          frontPlacedGraphics = data.graphics?.map((g, i) => ({
              id: `pg-${Date.now()}-${i}`,
              x: 50, // Center placeholder
              y: 40 + (i * 15),
              width: 25,
              imageUrl: 'https://via.placeholder.com/150/000000/FFFFFF?text=LOGO+HERE'
          })) || [];
      }
      
      // Intelligent Measurement Line Placement Logic
      const generateSmartLines = (measurements: any[] = []): MeasurementLine[] => {
          return measurements.slice(0, 8).map((m, i) => {
              const code = m.code.toUpperCase();
              const desc = m.description.toLowerCase();
              let start = { x: 36, y: 50 };
              let end = { x: 64, y: 50 };

              // Heuristics for placement
              if (desc.includes('shoulder') || code === 'HPS') {
                  start = { x: 36, y: 22 }; end = { x: 64, y: 22 };
              } else if (desc.includes('chest') || desc.includes('bust')) {
                  start = { x: 34, y: 38 }; end = { x: 66, y: 38 };
              } else if (desc.includes('waist')) {
                  start = { x: 36, y: 55 }; end = { x: 64, y: 55 };
              } else if (desc.includes('hem') || desc.includes('bottom')) {
                  start = { x: 34, y: 85 }; end = { x: 66, y: 85 };
              } else if (desc.includes('sleeve') || desc.includes('arm')) {
                  start = { x: 66, y: 24 }; end = { x: 88, y: 55 };
              } else if (desc.includes('length')) {
                  start = { x: 50, y: 15 }; end = { x: 50, y: 85 }; // Vertical center line
              } else {
                  // Fallback stacking
                  start = { x: 36, y: 30 + (i * 10) };
                  end = { x: 64, y: 30 + (i * 10) };
              }

              return {
                  id: `auto-${Date.now()}-${i}`,
                  start,
                  end,
                  label: m.code
              };
          });
      };

      const frontLines = generateSmartLines(data.measurements);

      setTechData(prev => prev ? { 
          ...prev, 
          frontPlacedGraphics,
          graphics: graphics as GraphicItem[],
          frontFills: [],
          backFills: [],
          sideFills: [],
          frontMeasurementLines: frontLines,
          backMeasurementLines: [],
          sideMeasurementLines: []
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
          const [front, back, side] = await Promise.all([
              generateTechnicalSketch(newData.sketchPrompts.front).catch(() => null),
              generateTechnicalSketch(newData.sketchPrompts.back).catch(() => null),
              generateTechnicalSketch(newData.sketchPrompts.side).catch(() => null),
          ]);
          
          let frontVec = null, backVec = null, sideVec = null;
          try {
              if (front) frontVec = await vectorizeImage(front).catch(() => null);
              if (back) backVec = await vectorizeImage(back).catch(() => null);
              if (side) sideVec = await vectorizeImage(side).catch(() => null);
          } catch(e) { console.warn("Vector update failed", e); }

          setGeneratedImages(prev => ({ ...prev, frontSketch: front, backSketch: back, sideSketch: side, frontVector: frontVec, backVector: backVec, sideVector: sideVec }));
      } catch (e) {
          console.error(e);
          alert("Failed to modify design. Please try again.");
      } finally {
          setIsModifying(false);
      }
  };

  const handleTranslate = async (lang: string) => {
      if (!techData) return;
      try {
          const newData = await translateTechPack(techData, lang);
          setTechData(newData);
      } catch (e) {
          alert("Translation failed.");
      }
  };
  
  const handleFabricSelect = (fabric: any, replaceIndex?: number) => {
      if (!techData) return;
      if (replaceIndex !== undefined && replaceIndex >= 0) {
          const newBom = [...techData.bom];
          newBom[replaceIndex] = {
              ...newBom[replaceIndex],
              item: fabric.name,
              description: `${fabric.composition}, ${fabric.weight}`,
              supplier: 'Fabric Library',
              unitPrice: fabric.price,
              totalPrice: (parseFloat(fabric.price.replace('$','')) * parseFloat(newBom[replaceIndex].quantity || '1')).toFixed(2)
          };
          setTechData({ ...techData, bom: newBom, fabrication: `${fabric.name} (${fabric.composition})` });
      }
      setShowFabricLibrary(false);
  };
  
  const handlePinterestTechPack = async (imageUrl: string) => {
      setShowPinterestTrends(false);
      setIsFootwearMode(false);
      setState(AppState.IDLE); setTechData(null); setGeneratedImages({ frontSketch: null, backSketch: null, sideSketch: null }); setErrorMsg(null);
      try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              setUploadedImages([base64]);
              processImages([base64], 'clothing');
          };
          reader.readAsDataURL(blob);
      } catch (e) {
          console.error("Failed to fetch Pinterest image", e);
          alert("Could not load image from Pinterest. Please try another pin.");
          setState(AppState.IDLE);
      }
  };

  const triggerPrint = () => window.print();
  const resetApp = () => { setState(AppState.IDLE); setUploadedImages([]); setTechData(null); };
  const updateTechData = (d: TechPackData) => setTechData(d);
  const handleVectorize = async (side: 'front'|'back'|'side') => { 
      if(!isProMode) { setShowProfile(true); return; } 
      setVectorizingSide(side); 
      try { 
          const svg = await vectorizeImage(side==='front'?generatedImages.frontSketch!:(side==='back'?generatedImages.backSketch!:generatedImages.sideSketch!)); 
          setGeneratedImages(p=>({...p, [side==='front'?'frontVector':(side==='back'?'backVector':'sideVector')]: svg})); 
      } finally { 
          setVectorizingSide(null); 
      } 
  };
  
  const handleGenerateMockup = async () => { 
      setIsGeneratingMockup(true); 
      if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey && (window as any).aistudio.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
        }
      }
      try { 
          const m = await generateRealisticMockup(techData!, generatedImages.frontSketch); 
          setGeneratedImages(p=>({...p, mockup: m})); 
      } catch(e) { 
          console.error(e);
          alert("Failed to generate mockup. Please ensure you have selected a valid API Key."); 
      } finally { 
          setIsGeneratingMockup(false); 
      } 
  };

  const handleDirectLogoUpload = (file: File) => { const r = new FileReader(); r.onload = (e) => { const url = e.target?.result as string; setDesignAssets(p => [{id:Date.now().toString(), type:'logo', name:file.name, url, date: 'Now'}, ...p]); setBrandLogo(url); }; r.readAsDataURL(file); };
  
  const cardClass = isDarkMode ? 'glass-card-dark border-white/10 hover:bg-white/5' : 'glass-card hover:bg-white/50';
  const textClass = isDarkMode ? 'text-white' : 'text-black';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden selection:bg-purple-500/30 ${isDarkMode ? 'text-white' : 'text-[#1D1D1F]'}`}>
      <ProfileView isOpen={showProfile} onClose={() => setShowProfile(false)} isPro={isProMode} onTogglePro={() => setIsProMode(!isProMode)} isDarkMode={isDarkMode} />
      <DesignBankView isOpen={showDesignBank} onClose={() => setShowDesignBank(false)} assets={designAssets} onUpload={() => {}} onDelete={() => {}} onSelect={(a) => { if(a.type==='logo') { setBrandLogo(a.url); setShowDesignBank(false); }}} mode={designBankMode} />
      {techData && <FactoryMatchingView isOpen={showFactoryMatching} onClose={() => setShowFactoryMatching(false)} data={techData} />}
      <FabricLibraryView isOpen={showFabricLibrary} onClose={() => setShowFabricLibrary(false)} onSelect={handleFabricSelect} techData={techData} />
      <PinterestTrendsView isOpen={showPinterestTrends} onClose={() => setShowPinterestTrends(false)} onGenerate={handlePinterestTechPack} />

      {state === AppState.IDLE && uploadedImages.length === 0 ? (
          <div className="min-h-screen p-4 md:p-12 flex flex-col justify-center max-w-7xl mx-auto">
             <div className="flex justify-between items-center mb-8 md:mb-12 animate-fade-in-up">
                 <div className="flex flex-col">
                     <h1 className={`text-[40px] leading-none mb-2 tracking-tighter ${textClass}`}>
                        <span className="font-black tracking-tighter">des</span><span className="font-thin tracking-normal">board</span>
                     </h1>
                     <div className={`text-[16px] md:text-[20px] font-light tracking-tight ${subTextClass}`}>Good Morning, <span className="font-medium">Bus1nessonly</span></div>
                 </div>
                 <div className="flex items-center gap-4">
                     <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-full transition-all border shadow-sm ${isDarkMode ? 'bg-white/10 border-white/20 text-yellow-400' : 'bg-white/50 border-white/40 text-gray-600'}`}>
                         {isDarkMode ? <Sun size={18} strokeWidth={1.5}/> : <Moon size={18} strokeWidth={1.5}/>}
                     </button>
                     <button className={`p-3 rounded-full transition-all border shadow-sm ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white/50 border-white/40 text-black'}`}><Search size={18} strokeWidth={1.5} /></button>
                     <div onClick={() => setShowProfile(true)} className="w-10 h-10 rounded-full cursor-pointer bg-black text-white flex items-center justify-center font-medium text-xs hover:scale-105 transition-transform shadow-lg border border-white/20">BO</div>
                 </div>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-auto gap-4 md:gap-6 md:auto-rows-[180px] mb-8 pb-10 animate-fade-in-up">
                 
                 <div onClick={() => fileInputRef.current?.click()} className={`col-span-2 md:row-span-2 ${cardClass} rounded-[32px] p-8 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01]`}>
                     <div className="relative z-10 h-full flex flex-col justify-between">
                         <div className={`${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                             <Plus size={24} strokeWidth={1.5}/>
                         </div>
                         <div>
                             <h2 className={`text-[32px] font-light tracking-tighter mb-1 ${textClass}`}>New Tech Pack</h2>
                             <p className={`${subTextClass} font-light text-sm`}>Generate specifications from photos</p>
                         </div>
                     </div>
                     <input type="file" multiple ref={fileInputRef} onChange={(e) => handleFileChange(e, 'clothing')} className="hidden" />
                 </div>

                 <div onClick={() => { setDesignBankMode('view'); setShowDesignBank(true); }} className={`col-span-2 md:col-span-2 ${cardClass} rounded-[32px] p-6 cursor-pointer hover:scale-[1.01] transition-all flex flex-col justify-between`}>
                     <div className="flex justify-between items-start">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-gray-100/50'}`}><FolderOpen size={20} strokeWidth={1.5} className={textClass}/></div>
                         <ArrowRight size={20} strokeWidth={1} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}/>
                     </div>
                     <div>
                         <div className={`${textClass} font-medium text-xl tracking-tight`}>Design Bank</div>
                         <div className={`${subTextClass} font-light text-sm mt-1`}>{designAssets.length} assets stored</div>
                     </div>
                 </div>

                 {/* My Projects Section - Inserted below Design Bank */}
                 <div className={`col-span-2 md:col-span-2 ${cardClass} rounded-[32px] p-6 cursor-pointer hover:scale-[1.01] transition-all flex flex-col justify-between`}>
                     <div className="flex justify-between items-center mb-3">
                         <div className="flex items-center gap-2">
                             <PenTool size={20} strokeWidth={1.5} className={textClass} />
                             <span className={`${textClass} font-medium tracking-tight text-lg`}>My Projects</span>
                         </div>
                         <ArrowRight size={16} className={`${subTextClass}`} />
                     </div>
                     <div className="flex gap-3 overflow-hidden">
                         {[1, 2, 3].map((i) => (
                             <div key={i} className={`flex-1 aspect-[3/4] rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/50 border-white/50'} flex items-center justify-center p-2 relative group overflow-hidden`}>
                                 <svg viewBox="0 0 100 100" className={`w-full h-full opacity-60 group-hover:scale-110 transition-transform duration-500 ${isDarkMode ? 'stroke-white' : 'stroke-black'}`} fill="none" strokeWidth="2">
                                     {i === 1 && <path d="M25,30 L10,35 L15,50 L25,45 V85 H75 V45 L85,50 L90,35 L75,30 C75,30 65,40 50,40 C35,40 25,30 25,30 Z" />}
                                     {i === 2 && <path d="M30,20 L30,90 M70,20 L70,90 M30,20 L70,20 M30,90 L70,90" />}
                                     {i === 3 && <circle cx="50" cy="50" r="30" />}
                                 </svg>
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                             </div>
                         ))}
                     </div>
                 </div>

                 <div onClick={() => { setDesignBankMode('view'); setShowDesignBank(true); }} className={`col-span-1 ${cardClass} rounded-[32px] p-5 flex flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-all`}>
                     <div className="flex justify-between items-start">
                         <div className={`${subTextClass} text-[10px] font-bold uppercase tracking-widest`}>Production</div>
                         <Factory size={16} strokeWidth={1.5} className={textClass}/>
                     </div>
                     <div>
                        <div className={`${textClass} text-lg font-medium leading-tight mb-1`}>Factory Network</div>
                        <div className={`${subTextClass} text-xs font-light`}>Find manufacturers</div>
                     </div>
                 </div>

                 <div onClick={() => setShowFabricLibrary(true)} className={`col-span-1 ${cardClass} rounded-[32px] p-5 flex flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-all`}>
                    <div className="flex justify-between items-start">
                        <div className={`${subTextClass} text-[10px] font-bold uppercase tracking-widest`}>Resources</div>
                        <Layers size={16} strokeWidth={1.5} className={textClass}/>
                    </div>
                    <div>
                       <div className={`${textClass} text-lg font-medium leading-tight mb-1`}>Fabric Library</div>
                       <div className={`${subTextClass} text-xs font-light`}>Browse textiles</div>
                    </div>
                 </div>

                 <div onClick={() => setShowPinterestTrends(true)} className={`col-span-1 md:col-span-2 ${cardClass} rounded-[32px] p-5 flex flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-all`}>
                    <div className="flex justify-between items-start">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Pinterest API</div>
                        <TrendingUp size={16} strokeWidth={1.5} className={textClass}/>
                    </div>
                    <div>
                        <div className={`${textClass} text-lg font-medium leading-tight`}>Trending Now</div>
                        <div className={`${subTextClass} text-[10px] font-medium mt-1 flex items-center gap-1`}>
                            Explore live trends
                        </div>
                    </div>
                 </div>

                 <div className={`col-span-1 md:col-span-2 ${cardClass} rounded-[32px] p-6 flex flex-col cursor-pointer hover:scale-[1.01] transition-all`}>
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
                        <div className={`flex items-center justify-between p-2 rounded-xl border ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-white/50 border-white/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center leading-none ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                                    <span className={`text-[7px] font-bold uppercase ${subTextClass}`}>Jun</span>
                                    <span className={`text-[11px] font-bold ${textClass}`}>02</span>
                                </div>
                                <div>
                                    <div className={`text-[12px] font-medium ${textClass}`}>Production Start</div>
                                    <div className={`text-[10px] ${subTextClass}`}>Confirmed</div>
                                </div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                    </div>
                 </div>
                 
                 <div className={`col-span-2 ${cardClass} rounded-[32px] p-6 flex flex-col justify-between cursor-pointer transition-all`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <LineChart size={18} strokeWidth={1.5} className={textClass}/>
                            <span className={`${textClass} font-medium tracking-tight text-sm`}>Material Market</span>
                        </div>
                        <div className={`${subTextClass} text-[10px]`}>Live Updates</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className={`rounded-xl p-3 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/50 border-white/60'}`}>
                            <div className={`${subTextClass} text-[10px] uppercase font-bold`}>Cotton</div>
                            <div className={`${textClass} text-lg font-medium flex items-center gap-1`}>
                                $0.92 <span className="text-[10px] text-green-500 flex items-center bg-green-500/10 px-1 rounded"><ArrowUpRight size={8}/> 1.2%</span>
                            </div>
                        </div>
                        <div className={`rounded-xl p-3 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/50 border-white/60'}`}>
                            <div className={`${subTextClass} text-[10px] uppercase font-bold`}>Poly</div>
                            <div className={`${textClass} text-lg font-medium flex items-center gap-1`}>
                                $0.45 <span className="text-[10px] text-red-500 flex items-center bg-red-500/10 px-1 rounded"><ArrowDownRight size={8}/> 0.5%</span>
                            </div>
                        </div>
                        <div className={`rounded-xl p-3 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/50 border-white/60'}`}>
                            <div className={`${subTextClass} text-[10px] uppercase font-bold`}>Silk</div>
                            <div className={`${textClass} text-lg font-medium flex items-center gap-1`}>
                                $42.0 <span className="text-[10px] text-green-500 flex items-center bg-green-500/10 px-1 rounded"><ArrowUpRight size={8}/> 3.1%</span>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
          </div>
      ) : (
          <div className="min-h-screen">
             <nav className={`fixed top-6 left-1/2 -translate-x-1/2 ${isDarkMode ? 'bg-black/70 border-white/10' : 'bg-white/70 border-white/50'} backdrop-blur-2xl border shadow-xl rounded-full px-6 h-14 flex items-center gap-6 z-50 no-print w-auto min-w-[320px] max-w-2xl justify-between transition-all animate-fade-in-up`}>
                  <div className="flex items-center gap-3">
                      <button onClick={resetApp} className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}`}><ArrowLeft size={18} strokeWidth={1.5}/></button>
                      <span className={`font-medium text-sm tracking-tight ${textClass}`}>{techData?.styleName || 'Processing'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                        {state === AppState.COMPLETE && (
                            <button onClick={triggerPrint} className={`${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} px-5 py-2 rounded-full text-[11px] font-semibold tracking-wide transition-all shadow-lg`}>Export PDF</button>
                        )}
                  </div>
             </nav>
             
             <main className="container mx-auto px-4 pt-32 pb-20 flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] animate-fade-in-up">
                {(state === AppState.ANALYZING || state === AppState.GENERATING_SKETCHES) && (
                    <div className="flex flex-col items-center justify-center w-full">
                        <div className="loading-logo-text mb-8">
                             <h1 className={`text-[60px] leading-none ${textClass} select-none`}>
                                <span className="font-black tracking-tighter">des</span><span className="font-thin tracking-normal">board</span>
                             </h1>
                        </div>
                        <h2 className={`text-lg font-light tracking-tight animate-pulse ${textClass}`}>
                            {state === AppState.ANALYZING ? "Analyzing construction..." : "Rendering technical sketches..."}
                        </h2>
                    </div>
                )}
                {state === AppState.ERROR && (<div className="text-red-500 text-center mt-20 font-light">{errorMsg} <button onClick={resetApp} className={`underline font-medium block mt-4 ${textClass}`}>Try Again</button></div>)}
                {state === AppState.COMPLETE && techData && (
                    <TechPackView 
                        data={techData} 
                        images={generatedImages} 
                        originalImages={uploadedImages} 
                        isProMode={isProMode} 
                        onDataChange={updateTechData} 
                        brandLogo={brandLogo}
                        onOpenLogoPicker={() => { setDesignBankMode('pick_logo'); setShowDesignBank(true); }}
                        onUploadLogo={handleDirectLogoUpload}
                        onSaveToBank={() => {}}
                        onVectorize={handleVectorize}
                        vectorizingSide={vectorizingSide}
                        onAnnotationChange={(side, a) => setTechData({...techData, [side==='front'?'frontAnnotations':(side==='back'?'backAnnotations':'sideAnnotations')]: a})}
                        onDrawingChange={(side, d) => setTechData({...techData, [side==='front'?'frontDrawings':(side==='back'?'backDrawings':'sideDrawings')]: d})}
                        onMeasurementLineChange={(side, l) => setTechData({...techData, [side==='front'?'frontMeasurementLines':(side==='back'?'backMeasurementLines':'sideMeasurementLines')]: l})}
                        onSketchReplace={(side, b64) => { const c = b64.includes('base64,')?b64.split('base64,')[1]:b64; setGeneratedImages(p=>({...p, [side==='front'?'frontSketch':(side==='back'?'backSketch':'sideSketch')]: c})); }}
                        onGenerateMockup={handleGenerateMockup}
                        isGeneratingMockup={isGeneratingMockup}
                        printSettings={printSettings}
                        onPrintSettingsChange={setPrintSettings}
                        onTriggerPrint={triggerPrint}
                        onModifyDesign={handleModifyDesign}
                        isModifying={isModifying}
                        onOpenFactoryMatching={() => setShowFactoryMatching(true)}
                        onTranslate={handleTranslate}
                        onPlacedGraphicsChange={(side, g) => setTechData({...techData, [side==='front'?'frontPlacedGraphics':(side==='back'?'backPlacedGraphics':'sidePlacedGraphics')]: g})}
                        onRecolorPathsChange={(side, p) => setTechData({...techData, [side==='front'?'frontRecolorPaths':'backRecolorPaths']: p})}
                        isFootwearMode={isFootwearMode}
                        onFillsChange={(side, f) => setTechData({...techData, [side==='front'?'frontFills':(side==='back'?'backFills':'sideFills')]: f})}
                    />
                )}
             </main>
          </div>
      )}
    </div>
  );
};

export default App;
