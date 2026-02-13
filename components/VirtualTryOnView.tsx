
import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, Shirt, User, ChevronRight, Loader2, Camera, Download } from 'lucide-react';
import { DesignAsset } from '../types';
import { generateVirtualTryOn } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  designAssets: DesignAsset[];
}

const MODELS = [
    { id: 'm1', name: 'Studio M', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop' },
    { id: 'm2', name: 'Studio F', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop' },
    { id: 'm3', name: 'Street M', url: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=1887&auto=format&fit=crop' },
];

const VirtualTryOnView: React.FC<Props> = ({ isOpen, onClose, designAssets }) => {
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [uploadedModel, setUploadedModel] = useState<string | null>(null);
    const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const techPacks = designAssets.filter(a => a.type === 'techpack');

    const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setUploadedModel(ev.target?.result as string);
                setSelectedModel('upload');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const getModelImageSrc = () => {
        if (selectedModel === 'upload') return uploadedModel;
        return MODELS.find(m => m.id === selectedModel)?.url;
    };

    const handleGenerate = async () => {
        const modelSrc = getModelImageSrc();
        const garment = techPacks.find(t => t.id === selectedGarmentId);
        
        if (!modelSrc || !garment || !garment.data) return;

        // Ensure API Key
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey && window.aistudio.openSelectKey) {
               await window.aistudio.openSelectKey();
            }
        }

        setIsGenerating(true);
        setResultImage(null);

        try {
            // Convert model URL to base64 if needed (for presets)
            let modelBase64 = modelSrc;
            if (modelSrc.startsWith('http')) {
                const resp = await fetch(modelSrc);
                const blob = await resp.blob();
                modelBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                }) as string;
            }
            const cleanModelBase64 = modelBase64.split('base64,')[1];
            
            // Get garment reference (mockup or sketch)
            const garmentRef = garment.data.images.mockup || garment.data.images.frontSketch;
            
            // Generate
            const result = await generateVirtualTryOn(
                cleanModelBase64,
                `${garment.data.techData.styleName}, ${garment.data.techData.colorWay}, ${garment.data.techData.description}`,
                garmentRef || undefined
            );
            
            setResultImage(result);

        } catch (error: any) {
            console.error(error);
            alert("Failed to generate try-on. " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-4 md:px-6 md:py-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
            
            <div className="relative w-full max-w-6xl bg-[#1C1C1E] rounded-[32px] shadow-2xl overflow-hidden h-full max-h-[90vh] flex flex-col md:flex-row animate-scale-in border border-white/10 text-white">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} />
                </button>

                {/* Left Panel: Configuration */}
                <div className="w-full md:w-[400px] flex flex-col border-b md:border-b-0 md:border-r border-white/10 bg-[#2C2C2E] p-6 overflow-y-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/50">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Virtual Studio</h2>
                    </div>

                    {/* Step 1: Model */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
                            Select Model
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`aspect-[3/4] rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors ${selectedModel === 'upload' ? 'bg-white/10 border-purple-500' : ''}`}
                            >
                                <Camera size={24} className="text-gray-400" />
                                <span className="text-xs font-medium text-gray-400">Upload Photo</span>
                            </div>
                            {MODELS.map(m => (
                                <div 
                                    key={m.id}
                                    onClick={() => setSelectedModel(m.id)}
                                    className={`aspect-[3/4] rounded-xl overflow-hidden cursor-pointer relative group ${selectedModel === m.id ? 'ring-2 ring-purple-500' : ''}`}
                                >
                                    <img src={m.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                    {selectedModel === m.id && (
                                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                            <div className="bg-purple-600 p-1 rounded-full"><ChevronRight size={12} /></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleModelUpload} className="hidden" accept="image/*" />
                    </div>

                    {/* Step 2: Garment */}
                    <div className="mb-8 flex-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">2</span>
                            Select Garment
                        </h3>
                        
                        {techPacks.length === 0 ? (
                            <div className="p-4 bg-white/5 rounded-xl text-center text-sm text-gray-400">
                                No saved Tech Packs found. Save a design first.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {techPacks.map(tp => (
                                    <div 
                                        key={tp.id}
                                        onClick={() => setSelectedGarmentId(tp.id)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedGarmentId === tp.id ? 'bg-purple-600/20 border-purple-500' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                                                {tp.data?.images.frontSketch ? (
                                                    <img src={`data:image/png;base64,${tp.data.images.frontSketch}`} className="w-full h-full object-contain mix-blend-multiply" />
                                                ) : <Shirt size={16} className="text-black" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-white">{tp.name}</div>
                                                <div className="text-xs text-gray-400">{tp.data?.techData.colorWay}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action */}
                    <button 
                        onClick={handleGenerate}
                        disabled={!selectedModel || !selectedGarmentId || isGenerating}
                        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-lg
                            ${!selectedModel || !selectedGarmentId 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : isGenerating 
                                    ? 'bg-purple-900 text-purple-200'
                                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40 hover:shadow-purple-700/60'
                            }`}
                    >
                        {isGenerating ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                Rendering...
                            </div>
                        ) : (
                            "Generate Try-On"
                        )}
                    </button>
                </div>

                {/* Right Panel: Preview */}
                <div className="flex-1 bg-black/50 flex items-center justify-center p-8 relative">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-black to-black"></div>
                    
                    {resultImage ? (
                        <div className="relative max-h-full max-w-full rounded-lg shadow-2xl overflow-hidden group">
                            <img src={`data:image/jpeg;base64,${resultImage}`} className="max-h-[80vh] w-auto object-contain" />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a 
                                    href={`data:image/jpeg;base64,${resultImage}`} 
                                    download="virtual-try-on.jpg"
                                    className="p-2 bg-white/20 backdrop-blur hover:bg-white/40 rounded-full text-white"
                                >
                                    <Download size={20} />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 relative z-10">
                            {isGenerating ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                                    <p className="text-lg font-medium text-purple-300">AI is fitting the garment...</p>
                                    <p className="text-sm mt-2 opacity-60">This may take up to 20 seconds</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Shirt size={40} className="opacity-20" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-300 mb-2">Ready to Render</h3>
                                    <p className="max-w-xs mx-auto text-sm opacity-60">Select a model and a tech pack from the left panel to see the magic.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default VirtualTryOnView;
