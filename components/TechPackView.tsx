
import React, { useState, useEffect, useRef, useId } from 'react';
import { TechPackData, GeneratedImages, MeasurementPoint, ConstructionDetail, MaterialItem, Colorway, Annotation, DrawingPath, PrintSettings, CostingSummary, GraphicItem, MeasurementLine, PlacedGraphic, PaletteColor, LabelDetail, PackagingDetail, ReferenceImage, FloodFill } from '../types';
import { Plus, Image as ImageIcon, Loader2, Lock, Trash2, MapPin, X, PenTool, Upload, Undo, Palette, MousePointer, Wand2, Download, Printer, Sparkles, DollarSign, Calculator, Shirt, Copy, Eye, ZoomIn, ZoomOut, Maximize2, Minimize2, Settings2, Check, FileText, Globe, Factory, Send, TrendingUp, RefreshCw, Ruler, ImagePlus, Move, Scale, AlertCircle, Zap, FileCode, Tag, Package, PaintBucket, Camera, Droplet, Eraser, Grid, Table, LayoutList } from 'lucide-react';
import { generateFitComments } from '../services/geminiService';

interface Props {
  data: TechPackData;
  images: GeneratedImages;
  originalImages: string[];
  isProMode: boolean;
  onDataChange: (data: TechPackData) => void;
  brandLogo?: string;
  onOpenLogoPicker: () => void;
  onUploadLogo?: (file: File) => void;
  onSaveToBank: () => void;
  onVectorize?: (side: 'front' | 'back' | 'side') => void;
  vectorizingSide?: 'front' | 'back' | 'side' | null;
  onAnnotationChange?: (side: 'front' | 'back' | 'side', annotations: Annotation[]) => void;
  onDrawingChange?: (side: 'front' | 'back' | 'side', drawings: DrawingPath[]) => void;
  onRecolorPathsChange?: (side: 'front' | 'back' | 'side', paths: DrawingPath[]) => void;
  onMeasurementLineChange?: (side: 'front' | 'back' | 'side', lines: MeasurementLine[]) => void;
  onPlacedGraphicsChange?: (side: 'front' | 'back' | 'side', graphics: PlacedGraphic[]) => void;
  onSketchReplace?: (side: 'front' | 'back' | 'side', base64: string) => void;
  onGenerateMockup?: () => void;
  isGeneratingMockup?: boolean;
  printSettings?: PrintSettings;
  onPrintSettingsChange?: (settings: PrintSettings) => void;
  onTriggerPrint?: () => void;
  onModifyDesign?: (instruction: string) => void;
  isModifying?: boolean;
  onOpenFactoryMatching?: () => void;
  onTranslate?: (lang: string) => void;
  isFootwearMode?: boolean;
  onFillsChange?: (side: 'front' | 'back' | 'side', fills: FloodFill[]) => void;
}

const formatImageSrc = (src: string | undefined | null) => {
    if (!src) return '';
    if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) {
        return src;
    }
    return `data:image/jpeg;base64,${src}`;
};

const LABEL_TEMPLATES = [
    { name: 'Woven Main', src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgODAiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiMxMTEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXNpemU9IjI0Ij5CUkFORCBOQU1FPC90ZXh0Pjwvc3ZnPg==' },
    { name: 'Care Label', src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMzAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI0MCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXNpemU9IjEyIj4xMDAlIENPVFRPTjwvdGV4dD48Y2lyY2xlIGN4PSI1MCIgY3k9IjEwMCIgcj0iMTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iNTAlIiB5PSIyNTAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJhcmlhbCIgZm9udC1zaXplPSIxMCI+TUFERSBJTiBQT1JUVUdBTDwvdGV4dD48L3N2Zz4=' },
];

const PATTERNS = [
    { name: 'Stripes', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTSAwIDAgTCAwIDIwIE0gMTAgMCBMIDEwIDIwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==' },
    { name: 'Check', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMzMzIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMzMzIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==' },
    { name: 'Dots', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==' },
    { name: 'Houndstooth', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGwxMCAxMHYxMEgwVjB6bTEwIDEwbDEwIDEwdjEwSDEwVjEweiIgZmlsbD0iIzMzMyIgZmlsbC1vcGFjaXR5PSIwLjUiLz48L3N2Zz4=' },
];

const PageHeader: React.FC<{ 
    data: TechPackData; 
    brandLogo?: string;
    onOpenLogoPicker?: () => void;
    onUploadLogo?: (file: File) => void;
    title?: string;
    pageNumber: string;
    onUpdateField: (field: keyof TechPackData, value: string) => void;
}> = ({ data, brandLogo, onOpenLogoPicker, onUploadLogo, title = "TECHNICAL SPECIFICATION", pageNumber, onUpdateField }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
    <div className="border-b border-black pb-4 mb-4 flex justify-between items-end h-[100px]">
        <div className="flex items-center gap-6 h-full">
             <div className="relative group h-full flex items-center">
                 {brandLogo ? (
                    <div onClick={onOpenLogoPicker} className="cursor-pointer h-full">
                        <img src={brandLogo} alt="Brand" className="h-full w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                    </div>
                 ) : (
                    <div onClick={onOpenLogoPicker} className="h-16 w-16 bg-gray-50 flex items-center justify-center rounded-lg cursor-pointer no-print group-hover:bg-gray-100 transition-colors border border-gray-200">
                        <ImageIcon size={24} className="text-gray-300" strokeWidth={1.5} />
                    </div>
                 )}
                 <button 
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="absolute -bottom-2 -right-2 bg-black text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity no-print hover:scale-110"
                    title="Upload Logo"
                 >
                    <Plus size={10} strokeWidth={2} />
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onUploadLogo?.(e.target.files[0])} />
             </div>
             <div>
                <h1 className="text-[20px] font-bold uppercase tracking-tight leading-none mb-2 text-black">
                    <EditableField value={data.styleName} onChange={(v) => onUpdateField('styleName', v)} className="font-bold"/>
                </h1>
                <div className="flex gap-6 text-[11px] uppercase font-medium text-gray-500 tracking-wider">
                    <span className="flex gap-1">Style #: <EditableField value={data.styleNumber} onChange={(v) => onUpdateField('styleNumber', v)} className="w-24 text-black font-semibold" /></span>
                    <span className="flex gap-1">Season: <EditableField value={data.season} onChange={(v) => onUpdateField('season', v)} className="w-24 text-black font-semibold" /></span>
                    <span className="flex gap-1">Date: <span className="text-black font-semibold">{new Date().toLocaleDateString()}</span></span>
                </div>
             </div>
        </div>
        <div className="text-right">
             <div className="text-[14px] font-bold uppercase tracking-widest text-black mb-1">{title}</div>
             <div className="text-[10px] font-medium text-gray-400">Page {pageNumber}</div>
        </div>
    </div>
    );
};

const PageFooter: React.FC = () => (
    <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between text-[9px] uppercase text-gray-400 font-medium tracking-widest">
        <span>Confidential Property</span>
        <span>Generated by Gemini AI</span>
    </div>
);

const EditableField: React.FC<{
    value: string;
    onChange: (val: string) => void;
    className?: string;
    as?: 'input' | 'textarea';
    placeholder?: string;
    type?: string;
}> = ({ value, onChange, className = '', as = 'input', placeholder, type = 'text' }) => {
    const Component = as;
    return (
        <Component
            type={type}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
            className={`bg-transparent hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-black/10 rounded-sm transition-all outline-none border-b border-transparent hover:border-gray-200 focus:border-black px-0.5 ${className}`}
            placeholder={placeholder}
            spellCheck={false}
        />
    );
};

const AnnotationCanvas: React.FC<{
    imageSrc: string | null;
    annotations: Annotation[];
    drawings: DrawingPath[];
    measurementLines: MeasurementLine[];
    placedGraphics: PlacedGraphic[];
    fills?: FloodFill[];
    onChangeAnnotations: (newAnnotations: Annotation[]) => void;
    onChangeDrawings: (newDrawings: DrawingPath[]) => void;
    onChangeMeasurementLines: (newLines: MeasurementLine[]) => void;
    onChangePlacedGraphics: (newGraphics: PlacedGraphic[]) => void;
    onFillsChange?: (newFills: FloodFill[]) => void;
    activeId: string | null;
    onSetActiveId: (id: string | null) => void;
    mode: 'annotate' | 'draw' | 'measure' | 'place_graphic' | 'view' | 'bucket';
    drawingColor: string;
    drawingPattern: string | null;
    onReplaceImage: (file: File) => void;
    onAddGraphic: (file: File) => void;
    hideGraphics?: boolean;
    measurements?: MeasurementPoint[];
    showColor?: boolean;
    mainColor?: string;
}> = ({ imageSrc, annotations, drawings, measurementLines, placedGraphics, fills = [], onChangeAnnotations, onChangeDrawings, onChangeMeasurementLines, onChangePlacedGraphics, onFillsChange, activeId, onSetActiveId, mode, drawingColor, drawingPattern, onReplaceImage, onAddGraphic, hideGraphics = false, measurements, showColor = false, mainColor = '#FFFFFF' }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [isDraggingGraphic, setIsDraggingGraphic] = useState<string | null>(null);
    const [isDraggingLineEnd, setIsDraggingLineEnd] = useState<{ id: string, type: 'start' | 'end' } | null>(null);
    const [measureStart, setMeasureStart] = useState<{x: number, y: number} | null>(null);
    const [replacingGraphicId, setReplacingGraphicId] = useState<string | null>(null);
    const [currentDrawingPath, setCurrentDrawingPath] = useState<{x: number, y: number}[]>([]);
    const [fillCanvasUrl, setFillCanvasUrl] = useState<string | null>(null);
    const canvasId = useId();

    const currentPathRef = useRef<{x: number, y: number}[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const graphicInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const processingCanvasRef = useRef<HTMLCanvasElement | null>(null);
    
    // Flood Fill Logic (Updated for Patterns)
    useEffect(() => {
        if (!imageSrc || !processingCanvasRef.current || fills.length === 0) {
            setFillCanvasUrl(null);
            return;
        }

        const canvas = processingCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = formatImageSrc(imageSrc);
        img.onload = async () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const tempCtx = document.createElement('canvas').getContext('2d');
            if(!tempCtx) return;
            tempCtx.canvas.width = canvas.width;
            tempCtx.canvas.height = canvas.height;
            tempCtx.drawImage(img, 0, 0);
            
            const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;
            
            const fillImageData = ctx.createImageData(width, height);
            const fillData = fillImageData.data;

            // Load all unique pattern images first
            const patternImages: Record<string, ImageData> = {};
            const uniquePatterns = Array.from(new Set(fills.map(f => f.patternUrl).filter(Boolean)));
            
            for (const url of uniquePatterns) {
                if (!url) continue;
                await new Promise<void>((resolve) => {
                    const pImg = new Image();
                    pImg.crossOrigin = 'anonymous';
                    pImg.src = url;
                    pImg.onload = () => {
                        const pCanvas = document.createElement('canvas');
                        // Use natural dimensions for pattern tiling
                        pCanvas.width = pImg.width || 100;
                        pCanvas.height = pImg.height || 100;
                        const pCtx = pCanvas.getContext('2d');
                        if (pCtx) {
                            pCtx.drawImage(pImg, 0, 0);
                            patternImages[url] = pCtx.getImageData(0, 0, pCanvas.width, pCanvas.height);
                        }
                        resolve();
                    };
                    pImg.onerror = () => resolve(); // continue even if fail
                });
            }

            fills.forEach(fill => {
                const startX = Math.floor(fill.x * width);
                const startY = Math.floor(fill.y * height);
                const startPos = (startY * width + startX) * 4;
                
                const targetR = data[startPos];
                const targetG = data[startPos + 1];
                const targetB = data[startPos + 2];
                
                const isMatch = (pos: number) => {
                    const dr = Math.abs(data[pos] - targetR);
                    const dg = Math.abs(data[pos + 1] - targetG);
                    const db = Math.abs(data[pos + 2] - targetB);
                    return dr < 30 && dg < 30 && db < 30; 
                };
                
                if (!isMatch(startPos)) return;

                const stack = [[startX, startY]];
                const seen = new Set();
                
                let r, g, b;
                if (!fill.patternUrl) {
                    r = parseInt(fill.color.slice(1, 3), 16);
                    g = parseInt(fill.color.slice(3, 5), 16);
                    b = parseInt(fill.color.slice(5, 7), 16);
                }

                while (stack.length) {
                    const [cx, cy] = stack.pop()!;
                    const key = cx + ',' + cy;
                    if (seen.has(key)) continue;
                    
                    const pos = (cy * width + cx) * 4;
                    if (cx >= 0 && cx < width && cy >= 0 && cy < height && isMatch(pos)) {
                        seen.add(key);
                        
                        if (fill.patternUrl && patternImages[fill.patternUrl]) {
                            const pData = patternImages[fill.patternUrl];
                            const pX = cx % pData.width;
                            const pY = cy % pData.height;
                            const pPos = (pY * pData.width + pX) * 4;
                            fillData[pos] = pData.data[pPos];
                            fillData[pos + 1] = pData.data[pPos + 1];
                            fillData[pos + 2] = pData.data[pPos + 2];
                            fillData[pos + 3] = pData.data[pPos + 3]; // Preserve alpha for transparency
                        } else {
                            fillData[pos] = r!;
                            fillData[pos + 1] = g!;
                            fillData[pos + 2] = b!;
                            fillData[pos + 3] = 255; 
                        }

                        stack.push([cx + 1, cy]);
                        stack.push([cx - 1, cy]);
                        stack.push([cx, cy + 1]);
                        stack.push([cx, cy - 1]);
                    }
                }
            });
            
            ctx.putImageData(fillImageData, 0, 0);
            setFillCanvasUrl(canvas.toDataURL());
        };

    }, [imageSrc, fills]);


    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        return { x: ((clientX - rect.left) / rect.width), y: ((clientY - rect.top) / rect.height) };
    };

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageSrc) return;
        const rawCoords = getCoords(e);
        const percentCoords = { x: rawCoords.x * 100, y: rawCoords.y * 100 };
        
        if (mode === 'annotate') {
            const newId = Date.now().toString();
            const nextNumber = annotations.length + 1;
            onChangeAnnotations([...annotations, { id: newId, x: percentCoords.x, y: percentCoords.y, number: nextNumber, text: `Detail note ${nextNumber}` }]);
            onSetActiveId(newId);
        } else if (mode === 'place_graphic') {
            graphicInputRef.current?.click();
        } else if (mode === 'bucket') {
            const newFill: FloodFill = {
                id: Date.now().toString(),
                x: rawCoords.x,
                y: rawCoords.y,
                color: drawingColor,
                patternUrl: drawingPattern || undefined,
                tolerance: 30
            };
            onFillsChange?.([...fills, newFill]);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string, type: 'annotation' | 'line' | 'graphic') => {
        e.stopPropagation();
        if (type === 'annotation') onChangeAnnotations(annotations.filter(a => a.id !== id).map((a, i) => ({...a, number: i + 1})));
        else if (type === 'line') onChangeMeasurementLines(measurementLines.filter(l => l.id !== id));
        else if (type === 'graphic') onChangePlacedGraphics(placedGraphics.filter(g => g.id !== id));
        onSetActiveId(null);
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const rawCoords = getCoords(e);
        const percentCoords = { x: rawCoords.x * 100, y: rawCoords.y * 100 };
        
        if (mode === 'draw') { 
            setIsDrawing(true); 
            currentPathRef.current = [percentCoords];
            setCurrentDrawingPath([percentCoords]);
        }
        else if (mode === 'measure') setMeasureStart(percentCoords);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        const rawCoords = getCoords(e);
        const percentCoords = { x: rawCoords.x * 100, y: rawCoords.y * 100 };

        if (mode === 'draw' && isDrawing) {
            currentPathRef.current.push(percentCoords);
            setCurrentDrawingPath([...currentPathRef.current]);
        }
        else if (isDraggingGraphic) onChangePlacedGraphics(placedGraphics.map(g => g.id === isDraggingGraphic ? { ...g, x: percentCoords.x, y: percentCoords.y } : g));
        else if (isDraggingLineEnd) onChangeMeasurementLines(measurementLines.map(l => l.id === isDraggingLineEnd.id ? { ...l, [isDraggingLineEnd.type]: percentCoords } : l));
    };

    const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (mode === 'draw' && isDrawing) {
            setIsDrawing(false);
            if (currentPathRef.current.length > 1) {
                const newPath = { id: Date.now().toString(), points: [...currentPathRef.current], color: drawingColor, width: drawingColor === '#FFFFFF' ? 8 : 2 };
                onChangeDrawings([...drawings, newPath]);
            }
            currentPathRef.current = [];
            setCurrentDrawingPath([]);
        } else if (mode === 'measure' && measureStart) {
            const rawCoords = getCoords(e);
            const percentCoords = { x: rawCoords.x * 100, y: rawCoords.y * 100 };
            
            if (Math.abs(percentCoords.x - measureStart.x) > 1) onChangeMeasurementLines([...measurementLines, { id: Date.now().toString(), start: measureStart, end: percentCoords, label: '?' }]);
            setMeasureStart(null);
        } else if (isDraggingGraphic) setIsDraggingGraphic(null);
        else if (isDraggingLineEnd) setIsDraggingLineEnd(null);
    };

    const pointsToPath = (points: {x: number, y: number}[]) => {
        if (points.length === 0) return '';
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
        return d;
    };

    const arrowHeadId = `arrowhead-${canvasId}`;
    const arrowStartId = `arrowhead-start-${canvasId}`;

    return (
        <div ref={containerRef} className={`relative w-full h-full group select-none overflow-hidden touch-none ${mode === 'draw' ? 'cursor-crosshair' : mode === 'measure' ? 'cursor-text' : mode === 'place_graphic' ? 'cursor-copy' : mode === 'bucket' ? 'cursor-cell' : ''}`}
            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}>
            <canvas ref={processingCanvasRef} className="hidden" />
            
            {imageSrc ? (
                 <div className="relative w-full h-full">
                    <div onClick={handleImageClick} className="w-full h-full relative">
                        {/* Fill Layer (Canvas Result) - Behind Line Art */}
                        {fillCanvasUrl && (
                            <img 
                                src={fillCanvasUrl}
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
                            />
                        )}

                        {/* Standard Image Rendering - using multiply to let fills show through white areas */}
                        <img 
                            src={formatImageSrc(imageSrc)} 
                            alt="Sketch" 
                            className={`w-full h-full object-contain pointer-events-none relative z-10 mix-blend-multiply`} 
                        />
                        
                        {!hideGraphics && placedGraphics.map(g => (
                            <div key={g.id} className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move ${activeId === g.id ? 'z-30 ring-1 ring-blue-500' : 'z-20'}`}
                                style={{ left: `${g.x}%`, top: `${g.y}%`, width: `${g.width}%` }} onMouseDown={(e) => { e.stopPropagation(); setIsDraggingGraphic(g.id); onSetActiveId(g.id); }}>
                                <img src={g.imageUrl} className="w-full h-auto object-contain pointer-events-none" />
                                {activeId === g.id && mode === 'place_graphic' && (
                                    <>
                                        <button onClick={(e) => handleDelete(e, g.id, 'graphic')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 no-print"><X size={10} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); setReplacingGraphicId(g.id); replaceInputRef.current?.click(); }} className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full p-0.5 no-print"><RefreshCw size={10} /></button>
                                        <div className="absolute top-full left-0 mt-1 bg-white border p-1 no-print" onMouseDown={e => e.stopPropagation()}>
                                            <input type="range" min="5" max="50" value={g.width} onChange={(e) => onChangePlacedGraphics(placedGraphics.map(pg => pg.id === g.id ? {...pg, width: parseInt(e.target.value)} : pg))} className="w-16 h-1" />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* SVG Layer for Freehand Drawings (Vector Scaled) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Saved Drawings */}
                        {drawings.map(path => (
                            <path key={path.id} d={pointsToPath(path.points)} stroke={path.color} strokeWidth={path.width} fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
                        ))}
                        
                        {/* Live Drawing Preview */}
                        {currentDrawingPath.length > 1 && (
                            <path d={pointsToPath(currentDrawingPath)} stroke={drawingColor} strokeWidth={drawingColor === '#FFFFFF' ? 8 : 2} fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity="0.8" />
                        )}
                    </svg>

                    {/* Separate SVG Layer for Measurement Lines (Pixel Based Coordinates) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-50">
                        <defs>
                            <marker id={arrowHeadId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="red" />
                            </marker>
                            <marker id={arrowStartId} viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                <path d="M 10 0 L 0 5 L 10 10 z" fill="red" />
                            </marker>
                        </defs>
                        {measurementLines.map(line => (
                            <g key={line.id} onClick={(e) => { e.stopPropagation(); onSetActiveId(line.id); }} className="pointer-events-auto cursor-pointer">
                                {/* Invisible thick stroke for easier clicking */}
                                <line x1={`${line.start.x}%`} y1={`${line.start.y}%`} x2={`${line.end.x}%`} y2={`${line.end.y}%`} stroke="transparent" strokeWidth="8" />
                                {/* Visible red line with arrows */}
                                <line x1={`${line.start.x}%`} y1={`${line.start.y}%`} x2={`${line.end.x}%`} y2={`${line.end.y}%`} stroke="red" strokeWidth="2" markerEnd={`url(#${arrowHeadId})`} markerStart={`url(#${arrowStartId})`} />
                            </g>
                        ))}
                    </svg>
                    
                    {/* Absolute HTML Elements for Measurement Labels and Controls */}
                    {measurementLines.map(line => {
                        const matched = measurements?.find(m => m.code === line.label);
                        const midX = (line.start.x + line.end.x) / 2;
                        const midY = (line.start.y + line.end.y) / 2;
                        return (
                            <React.Fragment key={line.id}>
                                {activeId === line.id && mode === 'measure' && (
                                    <>
                                        <div className="absolute w-3 h-3 bg-white border-2 border-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-move z-50 shadow-sm" style={{ left: `${line.start.x}%`, top: `${line.start.y}%` }} onMouseDown={(e) => { e.stopPropagation(); setIsDraggingLineEnd({id: line.id, type: 'start'}); }} />
                                        <div className="absolute w-3 h-3 bg-white border-2 border-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-move z-50 shadow-sm" style={{ left: `${line.end.x}%`, top: `${line.end.y}%` }} onMouseDown={(e) => { e.stopPropagation(); setIsDraggingLineEnd({id: line.id, type: 'end'}); }} />
                                    </>
                                )}
                                <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center pointer-events-none" style={{ left: `${midX}%`, top: `${midY}%` }}>
                                    <div className={`bg-white/95 border rounded px-1.5 py-0.5 flex items-center shadow-sm pointer-events-auto ${activeId === line.id ? 'border-red-500 ring-2 ring-red-100' : 'border-red-200'}`} onClick={(e) => { e.stopPropagation(); onSetActiveId(line.id); }}>
                                        <input type="text" value={line.label} onChange={(e) => onChangeMeasurementLines(measurementLines.map(l => l.id === line.id ? {...l, label: e.target.value} : l))} className={`w-8 text-[10px] outline-none text-red-600 font-bold bg-transparent text-center`} placeholder="POM" />
                                        {activeId === line.id && mode === 'measure' && <button onClick={(e) => handleDelete(e, line.id, 'line')} className="ml-1 text-red-500 hover:text-red-700 no-print"><X size={10}/></button>}
                                    </div>
                                    {matched && <div className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm mt-0.5 pointer-events-auto">{matched.target}</div>}
                                </div>
                            </React.Fragment>
                        );
                    })}

                    {/* Annotations */}
                    {annotations.map((ann) => (
                        <div key={ann.id} className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-transform cursor-pointer border border-white z-50 ${activeId === ann.id ? 'bg-red-500 text-white scale-110' : 'bg-red-500/80 text-white hover:bg-red-500 hover:scale-110'}`} style={{ left: `${ann.x}%`, top: `${ann.y}%` }} onClick={(e) => { e.stopPropagation(); onSetActiveId(ann.id); }}>
                            {ann.number}
                            {activeId === ann.id && mode === 'annotate' && (<button onClick={(e) => handleDelete(e, ann.id, 'annotation')} className="absolute -top-2 -right-2 bg-black text-white rounded-full p-0.5 no-print"><X size={8} /></button>)}
                        </div>
                    ))}
                    
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onReplaceImage(e.target.files[0])} />
                    <input type="file" ref={graphicInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onAddGraphic(e.target.files[0])} />
                    <input type="file" ref={replaceInputRef} className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0] && replacingGraphicId) { const r = new FileReader(); r.onload = (ev) => onChangePlacedGraphics(placedGraphics.map(g => g.id === replacingGraphicId ? { ...g, imageUrl: ev.target!.result as string } : g)); r.readAsDataURL(e.target.files[0]); } setReplacingGraphicId(null); }} />
                 </div>
            ) : (
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"><Upload size={24} className="mb-2" /><span className="text-xs font-medium">Upload Sketch</span><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onReplaceImage(e.target.files[0])} /></div>
            )}
        </div>
    );
};

const TechPackView: React.FC<Props> = (props) => {
  const { data, images, originalImages, isProMode, onDataChange, brandLogo, onOpenLogoPicker, onUploadLogo, onSaveToBank, onVectorize, vectorizingSide, onAnnotationChange, onDrawingChange, onSketchReplace, onGenerateMockup, isGeneratingMockup, printSettings, onPrintSettingsChange, onTriggerPrint, onModifyDesign, isModifying, onOpenFactoryMatching, onTranslate, onMeasurementLineChange, onPlacedGraphicsChange, onRecolorPathsChange, isFootwearMode, onFillsChange } = props;
  
  const [activeSketch, setActiveSketch] = useState<'front' | 'back' | 'side'>('front');
  const [editMode, setEditMode] = useState<'annotate' | 'draw' | 'measure' | 'place_graphic' | 'bucket'>('annotate');
  const [drawingColor, setDrawingColor] = useState('#EF4444');
  const [drawingPattern, setDrawingPattern] = useState<string | null>(null);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [viewAllAngles, setViewAllAngles] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showLabelTemplates, setShowLabelTemplates] = useState<string | null>(null);
  const patternInputRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // QC Mode State
  const [qcMode, setQcMode] = useState(false);
  const [isAnalysingFit, setIsAnalysingFit] = useState(false);

  const activeAnnotations = activeSketch === 'front' ? (data.frontAnnotations || []) : (activeSketch === 'back' ? (data.backAnnotations || []) : (data.sideAnnotations || []));

  const handleUndo = () => {
    const side = activeSketch;
    if (editMode === 'draw') {
        const current = side === 'front' ? (data.frontDrawings || []) : (side === 'back' ? (data.backDrawings || []) : (data.sideDrawings || []));
        if (current.length > 0) onDrawingChange?.(side, current.slice(0, -1));
    } else if (editMode === 'annotate') {
        const current = side === 'front' ? (data.frontAnnotations || []) : (side === 'back' ? (data.backAnnotations || []) : (data.sideAnnotations || []));
        if (current.length > 0) onAnnotationChange?.(side, current.slice(0, -1));
    } else if (editMode === 'measure') {
        const current = side === 'front' ? (data.frontMeasurementLines || []) : (side === 'back' ? (data.backMeasurementLines || []) : (data.sideMeasurementLines || []));
        if (current.length > 0) onMeasurementLineChange?.(side, current.slice(0, -1));
    } else if (editMode === 'place_graphic') {
        const current = side === 'front' ? (data.frontPlacedGraphics || []) : (side === 'back' ? (data.backPlacedGraphics || []) : (data.sidePlacedGraphics || []));
        if (current.length > 0) onPlacedGraphicsChange?.(side, current.slice(0, -1));
    } else if (editMode === 'bucket') {
        const current = side === 'front' ? (data.frontFills || []) : (side === 'back' ? (data.backFills || []) : (data.sideFills || []));
        if (current.length > 0) onFillsChange?.(side, current.slice(0, -1));
    }
  };

  const handleAddPlacedGraphic = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target?.result) {
            const newGraphic: PlacedGraphic = {
                id: Date.now().toString(),
                x: 50,
                y: 50,
                width: 30,
                imageUrl: e.target.result as string
            };
            const current = activeSketch === 'front' ? (data.frontPlacedGraphics || []) : (activeSketch === 'back' ? (data.backPlacedGraphics || []) : (data.sidePlacedGraphics || []));
            onPlacedGraphicsChange?.(activeSketch, [...current, newGraphic]);
        }
    };
    reader.readAsDataURL(file);
  };

  const handleAddReferenceImage = (file: File, category: ReferenceImage['category']) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          if (e.target?.result) {
              const newRef: ReferenceImage = {
                  id: Date.now().toString(),
                  url: e.target.result as string,
                  category: category,
                  notes: ''
              };
              onDataChange({
                  ...data,
                  referenceImages: [...(data.referenceImages || []), newRef]
              });
          }
      };
      reader.readAsDataURL(file);
  };

  const handleRemoveReferenceImage = (id: string) => {
      onDataChange({
          ...data,
          referenceImages: (data.referenceImages || []).filter(img => img.id !== id)
      });
  };

  const handleAddPaletteColor = () => {
      const newPalette = [...(data.palette || []), { name: 'New Color', hex: '#000000', pantone: '19-0000 TCX' }];
      onDataChange({ ...data, palette: newPalette });
  };

  const handleUpdatePaletteColor = (index: number, field: keyof PaletteColor, value: string) => {
      const newPalette = [...(data.palette || [])];
      newPalette[index] = { ...newPalette[index], [field]: value };
      onDataChange({ ...data, palette: newPalette });
  };
  
  const handleRemovePaletteColor = (index: number) => {
      const newPalette = [...(data.palette || [])];
      newPalette.splice(index, 1);
      onDataChange({ ...data, palette: newPalette });
  };

  // Colorways Handlers
  const handleAddColorway = () => {
      const newColorways = [...(data.colorways || []), { name: 'New Color', code: '#ffffff' }];
      onDataChange({ ...data, colorways: newColorways });
  };

  const handleUpdateColorway = (index: number, field: keyof Colorway, value: string) => {
      const newColorways = [...(data.colorways || [])];
      newColorways[index] = { ...newColorways[index], [field]: value };
      onDataChange({ ...data, colorways: newColorways });
  };

  const handleRemoveColorway = (index: number) => {
      const newColorways = [...(data.colorways || [])];
      newColorways.splice(index, 1);
      onDataChange({ ...data, colorways: newColorways });
  };

  const handlePatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  setDrawingPattern(ev.target.result as string);
                  setDrawingColor('#000000');
                  setEditMode('bucket'); // Switch to bucket tool
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleExportPDF = () => {
      setShowExportMenu(false);
      onTriggerPrint?.();
  };

  const handleExportExcel = () => {
      setShowExportMenu(false);
      
      try {
          let csvContent = "Style Name,Style Number,Season\n";
          csvContent += `"${(data.styleName || '').replace(/"/g, '""')}","${(data.styleNumber || '').replace(/"/g, '""')}","${(data.season || '').replace(/"/g, '""')}"\n\n`;

          // Measurements
          csvContent += "MEASUREMENTS\n";
          csvContent += "Code,Description,Tolerance,Target,Actual,Variance,Status\n";
          (data.measurements || []).forEach(m => {
              const row = [
                  m.code, 
                  m.description, 
                  m.tolerance, 
                  m.target, 
                  m.actual || '', 
                  m.variance || '', 
                  m.status || ''
              ];
              csvContent += row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(",") + "\n";
          });

          csvContent += "\nBILL OF MATERIALS\n";
          csvContent += "Placement,Item,Description,Supplier,Quantity,Unit Price,Total Price\n";
          (data.bom || []).forEach(b => {
              const row = [
                  b.placement, 
                  b.item, 
                  b.description, 
                  b.supplier, 
                  b.quantity, 
                  b.unitPrice || '', 
                  b.totalPrice || ''
              ];
              csvContent += row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(",") + "\n";
          });

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `${(data.styleName || 'Style').replace(/[^a-z0-9]/gi, '_')}_TechPack_Data.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      } catch (e) {
          console.error("Export Excel failed", e);
          alert("Failed to export Excel file");
      }
  };

  const handleExportAI = () => {
      setShowExportMenu(false);
      try {
          // Helper to generate group content
          const generateGroup = (id: string, xOffset: number, imgSrc: string | null, vectorSrc: string | null | undefined, drawings: DrawingPath[], lines: MeasurementLine[]) => {
              let backgroundContent = '';
              if (vectorSrc) {
                  // Clean vector and wrap in g
                  const cleanVector = vectorSrc.replace(/<\/?svg[^>]*>/g, '');
                  backgroundContent = `<g id="${id}_Vector">${cleanVector}</g>`;
              } else if (imgSrc) {
                  backgroundContent = `<g id="${id}_Image"><image x="0" y="0" width="1000" height="1000" preserveAspectRatio="xMidYMid meet" xlink:href="${formatImageSrc(imgSrc)}" /></g>`;
              }

              const drawingsContent = drawings.map(d => {
                  const pathData = d.points.map((p, i) => `${i===0?'M':'L'} ${p.x * 10} ${p.y * 10}`).join(' ');
                  return `<path d="${pathData}" stroke="${d.color}" stroke-width="${d.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
              }).join('\n');

              const measurementsContent = lines.map(l => {
                  const x1 = l.start.x * 10; const y1 = l.start.y * 10;
                  const x2 = l.end.x * 10; const y2 = l.end.y * 10;
                  return `<g><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="red" stroke-width="2" />
                          <text x="${(x1+x2)/2}" y="${(y1+y2)/2 - 10}" fill="red" font-family="Arial" font-size="12" text-anchor="middle">${l.label}</text></g>`;
              }).join('\n');

              return `<g transform="translate(${xOffset}, 0)">
                  <text x="500" y="50" font-family="Arial" font-size="24" text-anchor="middle" fill="#000">${id.toUpperCase()}</text>
                  ${backgroundContent}
                  <g id="${id}_Drawings">${drawingsContent}</g>
                  <g id="${id}_Measurements">${measurementsContent}</g>
              </g>`;
          };

          const frontGroup = generateGroup('Front', 0, images.frontSketch, images.frontVector, data.frontDrawings || [], data.frontMeasurementLines || []);
          const backGroup = generateGroup('Back', 1050, images.backSketch, images.backVector, data.backDrawings || [], data.backMeasurementLines || []);
          const sideGroup = generateGroup('Side', 2100, images.sideSketch, images.sideVector, data.sideDrawings || [], data.sideMeasurementLines || []);

          const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
            <svg width="3200" height="1100" viewBox="-50 -50 3250 1150" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <rect x="-50" y="-50" width="3250" height="1150" fill="#fff"/>
              <text x="1600" y="0" font-family="Arial" font-size="36" text-anchor="middle" font-weight="bold">${data.styleName} - ${data.styleNumber}</text>
              ${frontGroup}
              ${backGroup}
              ${sideGroup}
            </svg>`;

          const blob = new Blob([svgContent], {type: 'image/svg+xml'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${(data.styleName || 'Style').replace(/[^a-z0-9]/gi, '_')}_TechPack_CAD.svg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      } catch (e) {
          console.error("Export AI failed", e);
          alert("Failed to export Illustrator file");
      }
  };

  const handleAutoMeasure = () => {
    // Try to match existing measurements from the table to create smart, labelled lines
    if (data.measurements && data.measurements.length > 0) {
        const newLines: MeasurementLine[] = data.measurements.slice(0, 5).map((m, i) => {
            const code = m.code.toUpperCase();
            const desc = m.description.toLowerCase();
            let start = { x: 36, y: 50 };
            let end = { x: 64, y: 50 };

            // Improved Heuristics for typical Flat Sketch
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
                start = { x: 50, y: 15 }; end = { x: 50, y: 85 }; 
            } else {
                start = { x: 36, y: 30 + (i * 10) };
                end = { x: 64, y: 30 + (i * 10) };
            }

            return {
                id: Date.now().toString() + i,
                start,
                end,
                label: m.code
            };
        });
        onMeasurementLineChange?.(activeSketch, newLines);
    } else {
        const newLines: MeasurementLine[] = [
             { id: Date.now().toString(), start: { x: 36, y: 22 }, end: { x: 64, y: 22 }, label: 'A' },
             { id: (Date.now()+1).toString(), start: { x: 34, y: 38 }, end: { x: 66, y: 38 }, label: 'B' },
             { id: (Date.now()+2).toString(), start: { x: 50, y: 15 }, end: { x: 50, y: 85 }, label: 'C' },
        ];
        onMeasurementLineChange?.(activeSketch, newLines);
    }
  };

  useEffect(() => {
    const handleResize = () => {
        if (containerRef.current) {
            const windowWidth = window.innerWidth;
            const a4Width = 794; 
            if (windowWidth < (a4Width + 32)) {
                setIsMobile(true);
                setScale((windowWidth - 32) / a4Width);
            } else {
                setIsMobile(false);
                setScale(1);
            }
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveScale = (isMobile && !zoomEnabled) ? scale : 1;

  const updateField = (field: keyof TechPackData, value: string) => { onDataChange({ ...data, [field]: value }); };
  const updateNestedField = (arrayField: keyof Pick<TechPackData, 'measurements' | 'bom' | 'construction' | 'labels' | 'packaging'>, index: number, field: string, value: string) => {
    const newArray = [...(data[arrayField] || [])] as any[];
    newArray[index] = { ...newArray[index], [field]: value };
    onDataChange({ ...data, [arrayField]: newArray });
  };
  
  const handleQCInput = (index: number, actualValue: string) => {
      const target = parseFloat(data.measurements[index].target.replace(/[^0-9.]/g, ''));
      const actual = parseFloat(actualValue.replace(/[^0-9.]/g, ''));
      const tolerance = parseFloat(data.measurements[index].tolerance.replace(/[^0-9.]/g, ''));
      
      let variance = '';
      let status: 'pass' | 'fail' | 'pending' = 'pending';

      if (!isNaN(target) && !isNaN(actual)) {
          const diff = actual - target;
          variance = (diff > 0 ? '+' : '') + diff.toFixed(1) + 'cm';
          if (!isNaN(tolerance)) {
              status = Math.abs(diff) <= tolerance ? 'pass' : 'fail';
          }
      }

      const newMeasurements = [...data.measurements];
      newMeasurements[index] = { 
          ...newMeasurements[index], 
          actual: actualValue,
          variance: variance,
          status: status
      };
      onDataChange({ ...data, measurements: newMeasurements });
  };

  const handleAnalyzeFit = async () => {
      setIsAnalysingFit(true);
      try {
          const comments = await generateFitComments(data);
          onDataChange({ ...data, fitComments: comments });
      } finally {
          setIsAnalysingFit(false);
      }
  };

  const TechPackPage = ({ children, pageNum, className = '' }: { children?: React.ReactNode, pageNum: string, className?: string }) => (
      <div className={`tech-pack-page-wrapper mb-8 relative transition-all duration-300 ${zoomEnabled ? 'overflow-auto pb-4' : 'overflow-hidden'} ${className}`}
        style={{ height: zoomEnabled ? 'auto' : `${1123 * effectiveScale}px`, width: zoomEnabled ? '100%' : (effectiveScale === 1 ? '794px' : '100%') }}>
          <div className="tech-pack-page bg-white shadow-2xl shadow-black/5 mx-auto origin-top-left absolute top-0 left-0 transition-transform duration-300 flex flex-col"
            style={{ width: '794px', height: '1123px', padding: '40px', transform: zoomEnabled ? 'none' : `scale(${effectiveScale})`,
                left: zoomEnabled ? '0' : '50%', marginLeft: zoomEnabled ? '0' : (effectiveScale === 1 ? '-397px' : '0'),
                ...(effectiveScale !== 1 && !zoomEnabled ? { left: '0', marginLeft: '0' } : {})
            }}>
            <PageHeader data={data} brandLogo={brandLogo} onOpenLogoPicker={onOpenLogoPicker} onUploadLogo={onUploadLogo} pageNumber={pageNum} onUpdateField={updateField} />
            <div className="flex-1 flex flex-col overflow-hidden">
                {children}
            </div>
            <PageFooter />
          </div>
      </div>
  );

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full relative print-container">
      {/* Sticky Action Bar */}
      <div className="sticky top-24 z-40 mb-8 flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-full px-2 py-2 no-print animate-fade-in-up w-fit mx-auto">
           <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
               <button onClick={() => setZoomEnabled(!zoomEnabled)} className="p-2.5 rounded-full hover:bg-black/5 text-gray-700 transition-colors" title="Toggle Zoom">
                   {zoomEnabled ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
               </button>
               <button onClick={() => isMobile ? setScale(scale === 1 ? (window.innerWidth - 32)/794 : 1) : null} className="p-2.5 rounded-full hover:bg-black/5 text-gray-700 transition-colors md:hidden" title="Fit to Screen">
                   <ZoomIn size={18} />
               </button>
           </div>

           <div className="flex items-center gap-2 px-2">
                <div className="relative">
                    <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2.5 rounded-full hover:bg-black/5 text-gray-700 transition-colors" title="Print Settings">
                        <Settings2 size={18} />
                    </button>
                    {showSettingsMenu && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 p-2 text-xs flex flex-col gap-1">
                            <div className="px-2 py-1 font-bold text-gray-400 uppercase tracking-wider">Format</div>
                            <button onClick={() => onPrintSettingsChange?.({...printSettings!, format: 'a4'})} className={`flex items-center justify-between px-3 py-2 rounded-lg ${printSettings?.format === 'a4' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>A4 {printSettings?.format === 'a4' && <Check size={12}/>}</button>
                            <button onClick={() => onPrintSettingsChange?.({...printSettings!, format: 'letter'})} className={`flex items-center justify-between px-3 py-2 rounded-lg ${printSettings?.format === 'letter' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Letter {printSettings?.format === 'letter' && <Check size={12}/>}</button>
                            <div className="h-px bg-gray-100 my-1"/>
                            <button onClick={() => onPrintSettingsChange?.({...printSettings!, orientation: 'portrait'})} className={`flex items-center justify-between px-3 py-2 rounded-lg ${printSettings?.orientation === 'portrait' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Portrait {printSettings?.orientation === 'portrait' && <Check size={12}/>}</button>
                            <button onClick={() => onPrintSettingsChange?.({...printSettings!, orientation: 'landscape'})} className={`flex items-center justify-between px-3 py-2 rounded-lg ${printSettings?.orientation === 'landscape' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Landscape {printSettings?.orientation === 'landscape' && <Check size={12}/>}</button>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button onClick={() => setShowLangMenu(!showLangMenu)} className="p-2.5 rounded-full hover:bg-black/5 text-gray-700 transition-colors" title="Translate">
                        <Globe size={18} />
                    </button>
                    {showLangMenu && (
                         <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-200 p-2 text-xs flex flex-col gap-1">
                             <div className="px-2 py-1 font-bold text-gray-400 uppercase tracking-wider">Translate To</div>
                             {['Chinese', 'Spanish', 'Portuguese', 'Vietnamese', 'Turkish'].map(lang => (
                                 <button key={lang} onClick={() => { onTranslate?.(lang); setShowLangMenu(false); }} className="px-3 py-2 rounded-lg hover:bg-gray-100 text-left">{lang}</button>
                             ))}
                         </div>
                    )}
                </div>

                <button onClick={onOpenFactoryMatching} className="p-2.5 rounded-full hover:bg-black/5 text-gray-700 transition-colors" title="Find Factories">
                    <Factory size={18} />
                </button>
           </div>

           <div className="h-6 w-px bg-gray-300 mx-1"></div>

           <div className="relative flex items-center gap-1 pl-2">
                <input 
                    type="text" 
                    value={modificationPrompt} 
                    onChange={(e) => setModificationPrompt(e.target.value)}
                    placeholder="Ask AI to modify..." 
                    className="w-48 bg-gray-100 rounded-full px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all border border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && modificationPrompt && onModifyDesign?.(modificationPrompt)}
                />
                <button 
                    onClick={() => modificationPrompt && onModifyDesign?.(modificationPrompt)} 
                    disabled={isModifying || !modificationPrompt}
                    className="p-2 bg-black text-white rounded-full hover:scale-105 transition-all shadow-md disabled:opacity-50 disabled:scale-100"
                >
                    {isModifying ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                </button>
           </div>

           <div className="h-6 w-px bg-gray-300 mx-1"></div>

           {/* Unified Export Actions */}
           <div className="relative pr-2">
               <button 
                   onClick={() => setShowExportMenu(!showExportMenu)}
                   className="bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wide hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
               >
                   <Download size={14} /> Export
               </button>
               
               {showExportMenu && (
                   <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-2 text-xs flex flex-col gap-1 z-50 animate-scale-in origin-top-right">
                       <div className="px-2 py-1.5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Download Options</div>
                       
                       <button onClick={handleExportPDF} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors group w-full">
                           <div className="p-1.5 bg-red-100 text-red-600 rounded-md group-hover:bg-red-200 transition-colors"><Printer size={14}/></div>
                           <div>
                               <div className="font-bold text-gray-900">PDF Document</div>
                               <div className="text-[10px] text-gray-500">Full Tech Pack (Print)</div>
                           </div>
                       </button>

                       <button onClick={handleExportAI} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors group w-full">
                           <div className="p-1.5 bg-orange-100 text-orange-600 rounded-md group-hover:bg-orange-200 transition-colors"><FileCode size={14}/></div>
                           <div>
                               <div className="font-bold text-gray-900">Adobe Illustrator</div>
                               <div className="text-[10px] text-gray-500">Vector Sketches (SVG)</div>
                           </div>
                       </button>

                       <button onClick={handleExportExcel} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors group w-full">
                           <div className="p-1.5 bg-green-100 text-green-600 rounded-md group-hover:bg-green-200 transition-colors"><Table size={14}/></div>
                           <div>
                               <div className="font-bold text-gray-900">Excel / CSV</div>
                               <div className="text-[10px] text-gray-500">BOM & Measurements</div>
                           </div>
                       </button>
                   </div>
               )}
           </div>
      </div>
      
      {/* PAGE 1: TECHNICAL SKETCHES & CONSTRUCTION */}
      <TechPackPage pageNum="01 OF 07">
         <div className="h-full flex flex-col gap-4">
             {/* Large Sketch Viewer */}
             <div className="flex-1 flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center mb-2 no-print">
                    <h3 className="text-[12px] font-bold uppercase tracking-wider text-black">
                        {isFootwearMode ? 'Lateral, Sole & Medial Views' : 'Technical Sketches'}
                    </h3>
                    <div className="flex items-center gap-2 bg-gray-100/80 backdrop-blur-sm rounded-full p-1 border border-gray-200">
                        {/* View Mode Toggle */}
                        <button 
                            onClick={() => setViewAllAngles(!viewAllAngles)}
                            className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase rounded-full transition-all mr-2 ${viewAllAngles ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                            title="Toggle All Views for Print"
                        >
                            <LayoutList size={12} /> {viewAllAngles ? 'Stacked Views' : 'Tabbed View'}
                        </button>

                        {!viewAllAngles && (
                            <div className="flex bg-white rounded-full p-0.5 mr-2 shadow-sm">
                                <button onClick={() => setActiveSketch('front')} className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full transition-all ${activeSketch === 'front' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}>
                                    {isFootwearMode ? 'Lateral' : 'Front'}
                                </button>
                                <button onClick={() => setActiveSketch('side')} className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full transition-all ${activeSketch === 'side' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}>
                                    {isFootwearMode ? 'Medial' : 'Side'}
                                </button>
                                <button onClick={() => setActiveSketch('back')} className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full transition-all ${activeSketch === 'back' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}>
                                    {isFootwearMode ? 'Sole' : 'Back'}
                                </button>
                            </div>
                        )}
                        <div className="h-4 w-px bg-gray-300 mx-1" />
                        <button onClick={() => setEditMode('annotate')} className={`p-1.5 rounded-full hover:bg-white ${editMode === 'annotate' ? 'text-black bg-white shadow-sm' : 'text-gray-500'}`} title="Annotate"><MapPin size={16} /></button>
                        <button onClick={() => setEditMode('place_graphic')} className={`p-1.5 rounded-full hover:bg-white ${editMode === 'place_graphic' ? 'text-black bg-white shadow-sm' : 'text-gray-500'}`} title="Place Graphic"><ImagePlus size={16} /></button>
                        <button onClick={() => setEditMode('bucket')} className={`p-1.5 rounded-full hover:bg-white ${editMode === 'bucket' ? 'text-black bg-white shadow-sm' : 'text-gray-500'}`} title="Fill Color/Pattern (Bucket)"><PaintBucket size={16} /></button>
                        <button onClick={() => setEditMode('draw')} className={`p-1.5 rounded-full hover:bg-white ${editMode === 'draw' ? 'text-black bg-white shadow-sm' : 'text-gray-500'}`} title="Draw"><PenTool size={16} /></button>
                        <div className="h-4 w-px bg-gray-300 mx-1" />
                        <button onClick={handleUndo} className="p-1.5 text-gray-500 hover:text-black hover:bg-white rounded-full transition-all" title="Undo"><Undo size={16} /></button>
                        <div className="flex items-center gap-1 ml-1 pl-1 border-l border-gray-200">
                            {/* Color Picker for Tools */}
                            <div className="relative group">
                                {drawingPattern ? (
                                    <div className="w-5 h-5 rounded-full border border-gray-300 shadow-sm cursor-pointer overflow-hidden relative">
                                        <img src={drawingPattern} className="w-full h-full object-cover" />
                                        <button onClick={() => setDrawingPattern(null)} className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100"><X size={10}/></button>
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 rounded-full border border-gray-300 shadow-sm cursor-pointer" style={{backgroundColor: drawingColor}}>
                                        <input type="color" value={drawingColor} onChange={(e) => setDrawingColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Pattern Selector */}
                            <div className="relative group">
                                <button className="p-1 rounded-full hover:bg-gray-100" title="Select Pattern">
                                    <Grid size={14} />
                                </button>
                                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border p-2 grid grid-cols-2 gap-1 w-32 hidden group-hover:grid z-50">
                                    {PATTERNS.map((p, i) => (
                                        <div key={i} onClick={() => { setDrawingPattern(p.src); setDrawingColor('#000000'); setEditMode('bucket'); }} className="aspect-square border rounded hover:border-blue-500 cursor-pointer p-1" title={p.name}>
                                            <img src={p.src} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {/* Upload Custom Pattern */}
                                    <div onClick={() => patternInputRef.current?.click()} className="aspect-square border rounded hover:border-blue-500 cursor-pointer p-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500 hover:text-black hover:bg-gray-100" title="Upload Pattern">
                                         <Upload size={12} className="mb-1"/>
                                         <span className="text-[8px] font-bold">Upload</span>
                                    </div>
                                    <div onClick={() => setDrawingPattern(null)} className="aspect-square border rounded hover:border-blue-500 cursor-pointer flex items-center justify-center text-[10px] bg-gray-50">None</div>
                                </div>
                                <input type="file" ref={patternInputRef} className="hidden" accept="image/*" onChange={handlePatternUpload} />
                            </div>

                            <button onClick={() => setDrawingColor('#EF4444')} className="w-3 h-3 rounded-full bg-red-500 hover:scale-110 transition-transform" />
                            <button onClick={() => setDrawingColor('#000000')} className="w-3 h-3 rounded-full bg-black hover:scale-110 transition-transform" />
                            <button onClick={() => setDrawingColor('#FFFFFF')} className="w-3 h-3 rounded-full bg-white border border-gray-200 hover:scale-110 transition-transform" title="Eraser" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                    {/* View All Angles Mode */}
                    {viewAllAngles ? (
                        <div className="space-y-4">
                            {['front', 'back', 'side'].map((angle) => (
                                <div key={angle} className="border border-gray-100 rounded-xl overflow-hidden bg-white relative h-[400px]">
                                    <div className="absolute top-2 left-2 z-10 bg-white/80 px-2 py-1 rounded text-[10px] font-bold uppercase">{angle}</div>
                                    <AnnotationCanvas 
                                        imageSrc={angle === 'front' ? images.frontSketch : (angle === 'back' ? images.backSketch : images.sideSketch)}
                                        annotations={angle === 'front' ? (data.frontAnnotations || []) : (angle === 'back' ? (data.backAnnotations || []) : (data.sideAnnotations || []))}
                                        drawings={angle === 'front' ? (data.frontDrawings || []) : (angle === 'back' ? (data.backDrawings || []) : (data.sideDrawings || []))}
                                        measurementLines={[]}
                                        placedGraphics={angle === 'front' ? (data.frontPlacedGraphics || []) : (angle === 'back' ? (data.backPlacedGraphics || []) : (data.sidePlacedGraphics || []))}
                                        fills={angle === 'front' ? (data.frontFills || []) : (angle === 'back' ? (data.backFills || []) : (data.sideFills || []))}
                                        onChangeAnnotations={() => {}}
                                        onChangeDrawings={() => {}}
                                        onChangeMeasurementLines={() => {}}
                                        onChangePlacedGraphics={() => {}}
                                        onFillsChange={() => {}}
                                        activeId={null}
                                        onSetActiveId={() => {}}
                                        mode="view"
                                        drawingColor={drawingColor}
                                        drawingPattern={drawingPattern}
                                        onReplaceImage={() => {}}
                                        onAddGraphic={() => {}}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden bg-white relative min-h-[400px]">
                            <AnnotationCanvas 
                                imageSrc={activeSketch === 'front' ? images.frontSketch : (activeSketch === 'back' ? images.backSketch : images.sideSketch)}
                                annotations={activeSketch === 'front' ? (data.frontAnnotations || []) : (activeSketch === 'back' ? (data.backAnnotations || []) : (data.sideAnnotations || []))}
                                drawings={activeSketch === 'front' ? (data.frontDrawings || []) : (activeSketch === 'back' ? (data.backDrawings || []) : (data.sideDrawings || []))}
                                measurementLines={[]} /* Hide measurement lines on Page 01 */
                                placedGraphics={activeSketch === 'front' ? (data.frontPlacedGraphics || []) : (activeSketch === 'back' ? (data.backPlacedGraphics || []) : (data.sidePlacedGraphics || []))}
                                fills={activeSketch === 'front' ? (data.frontFills || []) : (activeSketch === 'back' ? (data.backFills || []) : (data.sideFills || []))}
                                onChangeAnnotations={(newA) => onAnnotationChange?.(activeSketch, newA)}
                                onChangeDrawings={(newD) => onDrawingChange?.(activeSketch, newD)}
                                onChangeMeasurementLines={(newL) => onMeasurementLineChange?.(activeSketch, newL)}
                                onChangePlacedGraphics={(newG) => onPlacedGraphicsChange?.(activeSketch, newG)}
                                onFillsChange={(newF) => onFillsChange?.(activeSketch, newF)}
                                activeId={activeAnnotationId}
                                onSetActiveId={setActiveAnnotationId}
                                mode={editMode}
                                drawingColor={drawingColor}
                                drawingPattern={drawingPattern}
                                onReplaceImage={(f) => { const reader = new FileReader(); reader.onload = (e) => onSketchReplace?.(activeSketch, e.target?.result as string); reader.readAsDataURL(f); }}
                                onAddGraphic={handleAddPlacedGraphic}
                            />
                        </div>
                    )}
                    
                    {/* Sketch Callouts / Annotations List (Only visible in single view mode) */}
                    {!viewAllAngles && activeAnnotations.length > 0 && (
                        <div className="mt-1 px-1">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-2">
                                <MapPin size={10} /> Sketch Callouts
                            </h4>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                                {activeAnnotations.map((ann) => (
                                    <div key={ann.id} className="flex items-start gap-2 group">
                                         <div 
                                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 cursor-pointer transition-all border border-white shadow-sm ${activeAnnotationId === ann.id ? 'bg-red-600 text-white scale-110' : 'bg-red-500 text-white group-hover:scale-110'}`}
                                            onMouseEnter={() => setActiveAnnotationId(ann.id)}
                                            onMouseLeave={() => setActiveAnnotationId(null)}
                                         >
                                             {ann.number}
                                         </div>
                                         <EditableField 
                                            value={ann.text} 
                                            onChange={(val) => {
                                                const updated = activeAnnotations.map(a => a.id === ann.id ? { ...a, text: val } : a);
                                                onAnnotationChange?.(activeSketch, updated);
                                            }}
                                            className="text-[10px] text-gray-700 w-full"
                                            placeholder="Describe detail..."
                                         />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
             </div>
             
             {/* Construction & Palette Split View */}
             <div className="h-1/3 mt-2 flex gap-8">
                 {/* Construction Table */}
                 <div className="flex-1 flex flex-col overflow-hidden">
                     <h3 className="text-[12px] font-bold uppercase tracking-wider border-b border-gray-100 pb-2 mb-2 text-gray-400">Construction Details</h3>
                     <div className="h-full overflow-hidden">
                         <table className="w-full text-[10px]">
                             <thead><tr className="border-b border-black text-left"><th className="pb-2 font-bold uppercase w-1/3 text-black">Feature</th><th className="pb-2 font-bold uppercase text-black">Instruction</th></tr></thead>
                             <tbody className="divide-y divide-gray-50">{data.construction.map((item, idx) => (<tr key={idx}><td className="py-2 pr-4 font-medium text-gray-800"><EditableField value={item.feature} onChange={(v) => updateNestedField('construction', idx, 'feature', v)} /></td><td className="py-2 text-gray-500"><EditableField value={item.instruction} onChange={(v) => updateNestedField('construction', idx, 'instruction', v)} className="w-full"/></td></tr>))}</tbody>
                         </table>
                     </div>
                 </div>

                 {/* Right Column: Colorways & Palette */}
                 <div className="w-64 flex flex-col border-l border-gray-100 pl-8 gap-6">
                      
                      {/* NEW: Colorways Section */}
                      <div className="flex flex-col flex-1 overflow-hidden min-h-[100px]">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                            <h3 className="text-[12px] font-bold uppercase tracking-wider text-gray-400">Colorways</h3>
                            <button onClick={handleAddColorway} className="bg-gray-100 hover:bg-gray-200 text-black p-1 rounded-full transition-colors no-print"><Plus size={12}/></button>
                          </div>
                          <div className="overflow-y-auto space-y-2 pr-1">
                            {(data.colorways || []).map((cw, idx) => (
                                <div key={idx} className="group relative bg-gray-50 rounded-lg p-2 border hover:border-gray-300 transition-all border-gray-100 flex items-center gap-2">
                                    <div className="relative w-6 h-6 rounded-full border border-gray-200 shadow-sm flex-shrink-0 overflow-hidden" style={{backgroundColor: cw.code}}>
                                         <input type="color" value={cw.code} onChange={(e) => handleUpdateColorway(idx, 'code', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                    </div>
                                    <EditableField value={cw.name} onChange={(v) => handleUpdateColorway(idx, 'name', v)} className="text-[10px] font-bold text-black w-full" />
                                    <button onClick={() => handleRemoveColorway(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity no-print"><X size={12} /></button>
                                </div>
                            ))}
                            {(!data.colorways || data.colorways.length === 0) && (
                                <div className="text-[10px] text-gray-400 text-center py-2 italic">No colorways added</div>
                            )}
                          </div>
                      </div>

                      {/* Color Palette Section */}
                      <div className="flex flex-col flex-1 overflow-hidden min-h-[150px]">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                            <h3 className="text-[12px] font-bold uppercase tracking-wider text-gray-400">Color Palette</h3>
                            <button onClick={handleAddPaletteColor} className="bg-gray-100 hover:bg-gray-200 text-black p-1 rounded-full transition-colors no-print"><Plus size={12}/></button>
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {(data.palette || []).map((color, idx) => (
                                <div key={idx} className={`group relative bg-gray-50 rounded-lg p-2 border hover:border-gray-300 transition-all border-gray-100`}>
                                    <div className="flex gap-3">
                                        <div className="relative w-8 h-8 rounded border border-gray-200 shadow-sm flex-shrink-0 overflow-hidden" style={{backgroundColor: color.hex}}>
                                             <input type="color" value={color.hex} onChange={(e) => handleUpdatePaletteColor(idx, 'hex', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <EditableField value={color.name} onChange={(v) => handleUpdatePaletteColor(idx, 'name', v)} className="text-[10px] font-bold text-black w-full" />
                                            <div className="flex justify-between items-center mt-0.5">
                                                <EditableField value={color.pantone} onChange={(v) => handleUpdatePaletteColor(idx, 'pantone', v)} className="text-[9px] text-gray-500 w-full" />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemovePaletteColor(idx)} className="absolute -top-1.5 -right-1.5 bg-white shadow border border-gray-200 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity no-print"><X size={10} /></button>
                                    <button onClick={() => setDrawingColor(color.hex)} className="absolute bottom-1 right-1 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 no-print" title="Use Color"><PaintBucket size={12} /></button>
                                </div>
                            ))}
                            {(!data.palette || data.palette.length === 0) && (
                                <div className="text-[10px] text-gray-400 text-center py-4 italic">No colors extracted</div>
                            )}
                          </div>
                      </div>
                 </div>
             </div>
         </div>
      </TechPackPage>

      <TechPackPage pageNum="02 OF 07">
          <div className="h-full flex flex-col gap-6">
              <div className="flex justify-between items-center mb-2 no-print">
                   <h3 className="text-[12px] font-bold uppercase tracking-wider text-black">Measurement Specs</h3>
                   <div className="flex gap-2 items-center">
                       <button 
                         onClick={() => setQcMode(!qcMode)} 
                         className={`px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${qcMode ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                       >
                           <Scale size={12} /> {qcMode ? 'Exit QC Mode' : 'Start QC Audit'}
                       </button>

                       <button onClick={() => setEditMode('measure')} className={`p-1.5 rounded-full hover:bg-white transition-all ${editMode === 'measure' ? 'text-black bg-white shadow-sm' : 'text-gray-500'}`} title="Measure"><Ruler size={16} strokeWidth={1.5} /></button>
                       <button onClick={handleAutoMeasure} className={`p-1.5 rounded-full hover:bg-white text-gray-500 hover:text-black transition-all`} title="Auto Measure"><Move size={16} strokeWidth={1.5} /></button>
                   </div>
              </div>
              <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden bg-white relative min-h-[500px]">
                    <AnnotationCanvas 
                        imageSrc={activeSketch === 'front' ? images.frontSketch : (activeSketch === 'back' ? images.backSketch : images.sideSketch)}
                        annotations={[]}
                        drawings={activeSketch === 'front' ? (data.frontDrawings || []) : (activeSketch === 'back' ? (data.backDrawings || []) : (data.sideDrawings || []))}
                        measurementLines={activeSketch === 'front' ? (data.frontMeasurementLines || []) : (activeSketch === 'back' ? (data.backMeasurementLines || []) : (data.sideMeasurementLines || []))}
                        placedGraphics={[]}
                        fills={activeSketch === 'front' ? (data.frontFills || []) : (activeSketch === 'back' ? (data.backFills || []) : (data.sideFills || []))}
                        onChangeAnnotations={() => {}}
                        onChangeDrawings={() => {}}
                        onChangeMeasurementLines={(newL) => onMeasurementLineChange?.(activeSketch, newL)}
                        onChangePlacedGraphics={() => {}}
                        activeId={activeAnnotationId}
                        onSetActiveId={setActiveAnnotationId}
                        mode={editMode === 'measure' ? 'measure' : 'view'}
                        drawingColor={drawingColor}
                        drawingPattern={drawingPattern}
                        onReplaceImage={() => {}}
                        onAddGraphic={() => {}}
                        hideGraphics={true}
                        measurements={data.measurements}
                    />
              </div>
              <div className="h-1/3 overflow-hidden rounded-xl border border-gray-200 mt-4 flex flex-col">
                 <div className="overflow-y-auto flex-1">
                    <table className="w-full text-[10px]">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                            <tr className="text-left">
                                <th className="py-2 px-3 font-semibold text-gray-600 w-12">Code</th>
                                <th className="py-2 px-3 font-semibold text-gray-600">Point of Measure</th>
                                <th className="py-2 px-3 font-semibold text-gray-600 w-16">Tol.</th>
                                <th className="py-2 px-3 font-semibold text-gray-600 w-16">Spec</th>
                                {qcMode && <th className="py-2 px-3 font-bold text-black w-20 bg-red-50">Actual</th>}
                                {qcMode && <th className="py-2 px-3 font-bold text-black w-20 bg-red-50">Var</th>}
                                {qcMode && <th className="py-2 px-3 font-bold text-black w-16 bg-red-50">Status</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.measurements.map((m, idx) => (
                                <tr key={idx} className={qcMode && m.status === 'fail' ? 'bg-red-50/50' : ''}>
                                    <td className="py-2 px-3"><EditableField value={m.code} onChange={(v) => updateNestedField('measurements', idx, 'code', v)} /></td>
                                    <td className="py-2 px-3"><EditableField value={m.description} onChange={(v) => updateNestedField('measurements', idx, 'description', v)} /></td>
                                    <td className="py-2 px-3"><EditableField value={m.tolerance} onChange={(v) => updateNestedField('measurements', idx, 'tolerance', v)} /></td>
                                    <td className="py-2 px-3 font-bold"><EditableField value={m.target} onChange={(v) => updateNestedField('measurements', idx, 'target', v)} /></td>
                                    
                                    {qcMode && (
                                        <>
                                            <td className="py-2 px-3 bg-red-50/30">
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-white border border-gray-300 rounded px-1 py-0.5 text-center focus:border-red-500 outline-none"
                                                    value={m.actual || ''}
                                                    onChange={(e) => handleQCInput(idx, e.target.value)}
                                                    placeholder="-"
                                                />
                                            </td>
                                            <td className={`py-2 px-3 font-medium bg-red-50/30 ${m.status === 'fail' ? 'text-red-600' : 'text-gray-600'}`}>{m.variance || '-'}</td>
                                            <td className="py-2 px-3 bg-red-50/30">
                                                {m.status === 'pass' && <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[8px] font-bold">PASS</span>}
                                                {m.status === 'fail' && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[8px] font-bold">FAIL</span>}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
                 
                 {qcMode && (
                     <div className="p-3 border-t border-gray-200 bg-gray-50 flex flex-col gap-2">
                         <div className="flex justify-between items-center">
                             <h4 className="text-[10px] font-bold uppercase flex items-center gap-2"><Sparkles size={10}/> AI Fit Comments</h4>
                             <button onClick={handleAnalyzeFit} disabled={isAnalysingFit} className="text-[9px] bg-black text-white px-3 py-1 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-1">
                                 {isAnalysingFit ? <Loader2 size={10} className="animate-spin"/> : <Zap size={10}/>} Generate Factory Comments
                             </button>
                         </div>
                         <EditableField 
                             value={data.fitComments || ''} 
                             onChange={(v) => updateField('fitComments', v)} 
                             as="textarea" 
                             className="w-full h-16 bg-white border border-gray-200 rounded-lg p-2 text-[10px]" 
                             placeholder="AI will generate fit comments here based on failed measurements..."
                         />
                     </div>
                 )}
              </div>
          </div>
      </TechPackPage>

      <TechPackPage pageNum="03 OF 07">
        <div className="flex flex-col gap-8 h-full">
            <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2 border-b border-gray-100 pb-2 text-gray-400">Design Description</h3>
                <EditableField value={data.description} onChange={(v) => updateField('description', v)} as="textarea" className="w-full h-32 text-[11px] leading-relaxed resize-none text-gray-800"/>
            </div>
            
            <div className="flex-1">
                 <h3 className="text-[12px] font-bold uppercase tracking-wider border-b border-gray-100 pb-2 mb-2 text-black">Bill of Materials (BOM)</h3>
                 <table className="w-full text-[10px]"><thead className="border-b border-black text-left"><tr><th className="pb-2 font-bold">Item</th><th className="pb-2 font-bold">Description</th><th className="pb-2 font-bold">Qty</th></tr></thead><tbody>{data.bom.map((item, idx) => (<tr key={idx} className="border-b border-gray-50"><td className="py-2"><EditableField value={item.item} onChange={(v) => updateNestedField('bom', idx, 'item', v)} /></td><td className="py-2"><EditableField value={item.description} onChange={(v) => updateNestedField('bom', idx, 'description', v)} /></td><td className="py-2"><EditableField value={item.quantity} onChange={(v) => updateNestedField('bom', idx, 'quantity', v)} /></td></tr>))}</tbody></table>
            </div>

            <div className="mt-4 bg-gray-50/50 border border-gray-100 rounded-xl p-5 mb-auto">
                 <h4 className="text-[10px] font-bold uppercase flex items-center gap-2 mb-3 text-black"><DollarSign size={12}/> Estimated Costing</h4>
                 <div className="grid grid-cols-3 gap-4 text-[10px]">
                     <div>
                         <span className="block text-gray-400 mb-1">Materials</span>
                         <span className="font-bold text-lg text-black">$0.00</span>
                     </div>
                     <div>
                         <span className="block text-gray-400 mb-1">Labor</span>
                         <span className="font-bold text-lg text-gray-300">--</span>
                     </div>
                     <div>
                         <span className="block text-gray-400 mb-1">Total FOB</span>
                         <span className="font-bold text-lg text-gray-300">--</span>
                     </div>
                 </div>
            </div>
        </div>
      </TechPackPage>

      <TechPackPage pageNum="04 OF 07">
          <div className="h-full flex flex-col">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-6">
                 <h3 className="text-[12px] font-bold uppercase tracking-wider text-black">Artwork & Branding</h3>
                 <button onClick={() => onDataChange({...data, graphics: [...(data.graphics || []), {id: Date.now().toString(), placement: 'New', description: '', dimensions: '', technique: '', colors: ''}]})} className="text-[10px] flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-black font-medium transition-colors no-print"><Plus size={12}/> Add Graphic</button>
              </div>
              <div className="grid grid-cols-2 gap-8">
                  {(data.graphics || []).map((g, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white flex flex-col group hover:shadow-lg transition-all duration-300">
                          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                              <span className="text-[11px] font-bold uppercase tracking-tight"><EditableField value={g.placement} onChange={(v) => {const u = [...(data.graphics||[])]; u[idx].placement=v; onDataChange({...data, graphics: u})}} /></span>
                              <span className="text-[10px] text-gray-500 bg-white border border-gray-100 px-2 py-0.5 rounded shadow-sm"><EditableField value={g.technique} onChange={(v) => {const u = [...(data.graphics||[])]; u[idx].technique=v; onDataChange({...data, graphics: u})}} /></span>
                          </div>
                          <div className="aspect-[4/3] relative flex items-center justify-center p-8 relative group/img cursor-pointer transition-colors bg-white">
                              <input type="file" className="absolute inset-0 opacity-0 z-10 cursor-pointer" accept="image/*" onChange={(e) => { const reader = new FileReader(); reader.onload = (ev) => { if (ev.target?.result && data.graphics) { const updated = [...data.graphics]; updated[idx] = { ...updated[idx], imageUrl: ev.target.result as string }; onDataChange({ ...data, graphics: updated }); } }; e.target.files?.[0] && reader.readAsDataURL(e.target.files[0]); }} />
                              {g.imageUrl ? (<img src={formatImageSrc(g.imageUrl)} className="max-w-full max-h-full object-contain" />) : (<div className="flex flex-col items-center text-gray-200"><ImageIcon size={40} strokeWidth={1} /><span className="text-[10px] mt-2 font-medium">Upload or Generate</span></div>)}
                          </div>
                          <div className="p-5 bg-gray-50/30 space-y-3 text-[10px] border-t border-gray-50">
                              <div className="grid grid-cols-3 gap-4">
                                  <div><span className="block text-gray-400 uppercase text-[9px] font-semibold tracking-wider mb-1">Dimensions</span><EditableField value={g.dimensions} onChange={(v) => {const u = [...(data.graphics||[])]; u[idx].dimensions=v; onDataChange({...data, graphics: u})}} className="text-gray-900" /></div>
                                  <div className="col-span-2"><span className="block text-gray-400 uppercase text-[9px] font-semibold tracking-wider mb-1">Colors</span><EditableField value={g.colors} onChange={(v) => {const u = [...(data.graphics||[])]; u[idx].colors=v; onDataChange({...data, graphics: u})}} className="text-gray-900" /></div>
                              </div>
                              <div><span className="block text-gray-400 uppercase text-[9px] font-semibold tracking-wider mb-1">Description</span><EditableField value={g.description} onChange={(v) => {const u = [...(data.graphics||[])]; u[idx].description=v; onDataChange({...data, graphics: u})}} className="w-full text-gray-600" /></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </TechPackPage>

      <TechPackPage pageNum="05 OF 07">
          <div className="h-full flex flex-col gap-6">
              <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                     <h3 className="text-[12px] font-bold uppercase tracking-wider text-black flex items-center gap-2"><Tag size={12}/> Labels & Trims</h3>
                     <button onClick={() => onDataChange({...data, labels: [...(data.labels || []), {id: Date.now().toString(), type: 'Label', material: 'TBD', dimensions: 'TBD', placement: 'TBD'}]})} className="text-[10px] flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-black font-medium transition-colors no-print"><Plus size={12}/> Add Label</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(data.labels || []).map((label, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-white flex p-4 gap-4 relative group/label">
                               <div className="absolute top-2 right-2 opacity-0 group-hover/label:opacity-100 transition-opacity no-print">
                                    <button onClick={() => setShowLabelTemplates('label')} className="p-1 bg-gray-100 rounded hover:bg-gray-200 text-xs text-gray-600">Template</button>
                               </div>
                               {showLabelTemplates === 'label' && (
                                   <div className="absolute inset-0 bg-white/95 z-20 p-2 grid grid-cols-2 gap-2 overflow-y-auto">
                                       {LABEL_TEMPLATES.map((tmpl, tIdx) => (
                                           <div key={tIdx} onClick={() => { const updated = [...(data.labels || [])]; updated[idx] = { ...updated[idx], imageUrl: tmpl.src }; onDataChange({ ...data, labels: updated }); setShowLabelTemplates(null); }} className="border p-2 cursor-pointer hover:bg-gray-50 flex flex-col items-center">
                                               <img src={tmpl.src} className="h-10 mb-1" />
                                               <span className="text-[8px]">{tmpl.name}</span>
                                           </div>
                                       ))}
                                       <button onClick={() => setShowLabelTemplates(null)} className="col-span-2 text-[10px] text-gray-500">Close</button>
                                   </div>
                               )}

                              <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center relative cursor-pointer group flex-shrink-0">
                                   <input type="file" className="absolute inset-0 opacity-0 z-10 cursor-pointer" accept="image/*" onChange={(e) => { const reader = new FileReader(); reader.onload = (ev) => { if (ev.target?.result && data.labels) { const updated = [...data.labels]; updated[idx] = { ...updated[idx], imageUrl: ev.target.result as string }; onDataChange({ ...data, labels: updated }); } }; e.target.files?.[0] && reader.readAsDataURL(e.target.files[0]); }} />
                                   {label.imageUrl ? <img src={formatImageSrc(label.imageUrl)} className="max-w-full max-h-full object-contain"/> : <Tag size={20} className="text-gray-300 group-hover:text-gray-400"/>}
                              </div>
                              <div className="flex-1 space-y-2 text-[10px]">
                                  <div className="flex justify-between">
                                      <span className="text-gray-400 uppercase text-[9px] font-bold">Type</span>
                                      <EditableField value={label.type} onChange={(v) => updateNestedField('labels', idx, 'type', v)} className="text-right font-bold w-32" />
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-400 uppercase text-[9px] font-bold">Material</span>
                                      <EditableField value={label.material} onChange={(v) => updateNestedField('labels', idx, 'material', v)} className="text-right w-32" />
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-400 uppercase text-[9px] font-bold">Size</span>
                                      <EditableField value={label.dimensions} onChange={(v) => updateNestedField('labels', idx, 'dimensions', v)} className="text-right w-32" />
                                  </div>
                                  <div className="pt-2 border-t border-gray-50">
                                      <span className="text-gray-400 uppercase text-[9px] font-bold block mb-1">Placement</span>
                                      <EditableField value={label.placement} onChange={(v) => updateNestedField('labels', idx, 'placement', v)} className="w-full text-gray-700" />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4 mt-4">
                     <h3 className="text-[12px] font-bold uppercase tracking-wider text-black flex items-center gap-2"><Package size={12}/> Packaging & Hangtags</h3>
                     <button onClick={() => onDataChange({...data, packaging: [...(data.packaging || []), {id: Date.now().toString(), type: 'Packaging', description: 'TBD', material: 'TBD', dimensions: 'TBD'}]})} className="text-[10px] flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-black font-medium transition-colors no-print"><Plus size={12}/> Add Item</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(data.packaging || []).map((pkg, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-white flex p-4 gap-4">
                              <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center relative cursor-pointer group flex-shrink-0">
                                   <input type="file" className="absolute inset-0 opacity-0 z-10 cursor-pointer" accept="image/*" onChange={(e) => { const reader = new FileReader(); reader.onload = (ev) => { if (ev.target?.result && data.packaging) { const updated = [...data.packaging]; updated[idx] = { ...updated[idx], imageUrl: ev.target.result as string }; onDataChange({ ...data, packaging: updated }); } }; e.target.files?.[0] && reader.readAsDataURL(e.target.files[0]); }} />
                                   {pkg.imageUrl ? <img src={formatImageSrc(pkg.imageUrl)} className="max-w-full max-h-full object-contain"/> : <Package size={20} className="text-gray-300 group-hover:text-gray-400"/>}
                              </div>
                              <div className="flex-1 space-y-2 text-[10px]">
                                  <div className="flex justify-between">
                                      <span className="text-gray-400 uppercase text-[9px] font-bold">Item</span>
                                      <EditableField value={pkg.type} onChange={(v) => updateNestedField('packaging', idx, 'type', v)} className="text-right font-bold w-32" />
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-400 uppercase text-[9px] font-bold">Material</span>
                                      <EditableField value={pkg.material} onChange={(v) => updateNestedField('packaging', idx, 'material', v)} className="text-right w-32" />
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-gray-400 uppercase text-[9px] font-bold">Size</span>
                                      <EditableField value={pkg.dimensions} onChange={(v) => updateNestedField('packaging', idx, 'dimensions', v)} className="text-right w-32" />
                                  </div>
                                  <div className="pt-2 border-t border-gray-50">
                                      <span className="text-gray-400 uppercase text-[9px] font-bold block mb-1">Description</span>
                                      <EditableField value={pkg.description} onChange={(v) => updateNestedField('packaging', idx, 'description', v)} className="w-full text-gray-700" />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </TechPackPage>

      <TechPackPage pageNum="06 OF 07">
        <div className="grid grid-cols-2 gap-8 h-full">
            <div className="col-span-2 h-[500px] flex flex-col">
                <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2 border-b border-gray-100 pb-2 flex justify-between items-center text-gray-400"><span>AI Visualisation</span>{!images.mockup && (<button onClick={onGenerateMockup} disabled={isGeneratingMockup} className="text-[9px] bg-gray-100 text-black px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-gray-200 no-print font-medium transition-colors">{isGeneratingMockup ? <Loader2 size={12} className="animate-spin"/> : <><Wand2 size={12} /> Generate</>}</button>)}</h3>
                <div className="flex-1 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center relative">{images.mockup ? <img src={formatImageSrc(images.mockup)} className="w-full h-full object-cover" /> : <div className="text-center p-4"><Sparkles size={24} strokeWidth={1} className="mx-auto mb-3 text-gray-300"/><p className="text-[10px] text-gray-400 font-medium">Photorealistic Mockup Area</p></div>}</div>
            </div>
            <div className="col-span-2 flex flex-col gap-6">
                {data.marketAnalysis && (<div className="bg-gray-50 rounded-xl p-5 border border-gray-100"><div className="flex items-center gap-2 mb-3 text-black"><TrendingUp size={14} /><h4 className="text-[10px] font-bold uppercase tracking-wide">Market Insights</h4></div><div className="grid grid-cols-2 gap-4 text-[10px]"><div><span className="block text-gray-400 mb-0.5">Category</span><span className="font-semibold text-gray-900">{data.marketAnalysis.category}</span></div><div><span className="block text-gray-400 mb-0.5">Positioning</span><span className="font-semibold text-gray-900">{data.marketAnalysis.pricePoint}</span></div><div className="col-span-2"><span className="block text-gray-400 mb-1">Keywords</span><div className="flex gap-1.5 flex-wrap">{data.marketAnalysis.trendingKeywords.map(k => (<span key={k} className="bg-white border border-gray-200 px-2 py-1 rounded-md text-[9px] font-medium text-gray-600">{k}</span>))}</div></div></div></div>)}
            </div>
        </div>
      </TechPackPage>

      <TechPackPage pageNum="07 OF 07">
          <div className="h-full flex flex-col gap-8">
              {['Inspiration', 'Brand', 'Competitor', 'Sample'].map((category) => {
                  const items = (data.referenceImages || []).filter(img => img.category === category);
                  return (
                      <div key={category} className="flex-1 flex flex-col min-h-[160px]">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                               <h3 className="text-[11px] font-bold uppercase tracking-wider text-black">
                                   {category === 'Inspiration' && 'Inspiration & Mood'}
                                   {category === 'Brand' && 'Brand Design References'}
                                   {category === 'Competitor' && 'Competitor Benchmarks'}
                                   {category === 'Sample' && 'Physical Samples / Fits'}
                               </h3>
                               <div className="relative overflow-hidden group">
                                   <button className="text-[10px] flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-black font-medium transition-colors no-print">
                                       <Plus size={12}/> Add Photo
                                   </button>
                                   <input 
                                       type="file" 
                                       className="absolute inset-0 opacity-0 cursor-pointer" 
                                       accept="image/*" 
                                       onChange={(e) => e.target.files?.[0] && handleAddReferenceImage(e.target.files[0], category as any)} 
                                   />
                               </div>
                          </div>
                          
                          {items.length === 0 ? (
                              <div className="flex-1 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-[10px] flex-col gap-2">
                                  <Camera size={20} className="opacity-20"/>
                                  <span>No images uploaded</span>
                              </div>
                          ) : (
                              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                  {items.map((img) => (
                                      <div key={img.id} className="group relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                          <img src={formatImageSrc(img.url)} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                              <button onClick={() => window.open(formatImageSrc(img.url), '_blank')} className="p-1.5 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40"><Eye size={14}/></button>
                                              <button onClick={() => handleRemoveReferenceImage(img.id)} className="p-1.5 bg-red-500/80 backdrop-blur rounded-full text-white hover:bg-red-600"><Trash2 size={14}/></button>
                                          </div>
                                          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-1.5 border-t border-gray-100 translate-y-full group-hover:translate-y-0 transition-transform">
                                              <input 
                                                  type="text" 
                                                  placeholder="Add note..." 
                                                  className="w-full bg-transparent text-[9px] outline-none"
                                                  value={img.notes || ''}
                                                  onChange={(e) => {
                                                      const updated = (data.referenceImages || []).map(r => r.id === img.id ? {...r, notes: e.target.value} : r);
                                                      onDataChange({...data, referenceImages: updated});
                                                  }}
                                              />
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      </TechPackPage>
    </div>
  );
};

export default TechPackView;
