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
  isDarkMode?: boolean;
}

const formatImageSrc = (src: string | undefined | null) => {
    if (!src) return '';
    if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) {
        return src;
    }
    // Check for PNG signature
    if (src.startsWith('iVBOR')) {
        return `data:image/png;base64,${src}`;
    }
    // Default to JPEG
    return `data:image/jpeg;base64,${src}`;
};

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
    <div className="border-b border-black dark:border-white/20 pb-4 mb-4 flex justify-between items-end h-[100px]">
        <div className="flex items-center gap-6 h-full">
             <div className="relative group h-full flex items-center">
                 {brandLogo ? (
                    <div onClick={onOpenLogoPicker} className="cursor-pointer h-full">
                        <img src={brandLogo} alt="Brand" className="h-full w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                    </div>
                 ) : (
                    <div onClick={onOpenLogoPicker} className="h-16 w-16 bg-gray-50 dark:bg-white/5 flex items-center justify-center rounded-lg cursor-pointer no-print group-hover:bg-gray-100 dark:group-hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/10">
                        <ImageIcon size={24} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                    </div>
                 )}
                 <button 
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="absolute -bottom-2 -right-2 bg-black dark:bg-white text-white dark:text-black rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity no-print hover:scale-110"
                    title="Upload Logo"
                 >
                    <Plus size={10} strokeWidth={2} />
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onUploadLogo?.(e.target.files[0])} />
             </div>
             <div>
                <h1 className="text-[20px] font-bold uppercase tracking-tight leading-none mb-2 text-black dark:text-white">
                    <EditableField value={data.styleName} onChange={(v) => onUpdateField('styleName', v)} className="font-bold"/>
                </h1>
                <div className="flex gap-6 text-[11px] uppercase font-medium text-gray-500 dark:text-gray-400 tracking-wider">
                    <span className="flex gap-1">Style #: <EditableField value={data.styleNumber} onChange={(v) => onUpdateField('styleNumber', v)} className="w-24 text-black dark:text-white font-semibold" /></span>
                    <span className="flex gap-1">Season: <EditableField value={data.season} onChange={(v) => onUpdateField('season', v)} className="w-24 text-black dark:text-white font-semibold" /></span>
                    <span className="flex gap-1">Date: <span className="text-black dark:text-white font-semibold">{new Date().toLocaleDateString()}</span></span>
                </div>
             </div>
        </div>
        <div className="text-right">
             <div className="text-[14px] font-bold uppercase tracking-widest text-black dark:text-white mb-1">{title}</div>
             <div className="text-[10px] font-medium text-gray-400">Page {pageNumber}</div>
        </div>
    </div>
    );
};

const PageFooter: React.FC = () => (
    <div className="absolute bottom-8 left-8 right-8 pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between text-[9px] uppercase text-gray-400 font-medium tracking-widest">
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
            className={`bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-white dark:focus:bg-white/10 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 rounded-sm transition-all outline-none border-b border-transparent hover:border-gray-200 dark:hover:border-white/20 focus:border-black dark:focus:border-white px-0.5 ${className}`}
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
    
    // Flood Fill Logic (Keep existing logic...)
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
                        pCanvas.width = pImg.width || 100;
                        pCanvas.height = pImg.height || 100;
                        const pCtx = pCanvas.getContext('2d');
                        if (pCtx) {
                            pCtx.drawImage(pImg, 0, 0);
                            patternImages[url] = pCtx.getImageData(0, 0, pCanvas.width, pCanvas.height);
                        }
                        resolve();
                    };
                    pImg.onerror = () => resolve();
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
                            fillData[pos + 3] = pData.data[pPos + 3];
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
                        {/* Fill Layer */}
                        {fillCanvasUrl && (
                            <img 
                                src={fillCanvasUrl}
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
                            />
                        )}

                        {/* Image */}
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

                    {/* SVG Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {drawings.map(path => (
                            <path key={path.id} d={pointsToPath(path.points)} stroke={path.color} strokeWidth={path.width} fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
                        ))}
                        {currentDrawingPath.length > 1 && (
                            <path d={pointsToPath(currentDrawingPath)} stroke={drawingColor} strokeWidth={drawingColor === '#FFFFFF' ? 8 : 2} fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity="0.8" />
                        )}
                    </svg>

                    {/* Measurement SVG Layer */}
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
                                <line x1={`${line.start.x}%`} y1={`${line.start.y}%`} x2={`${line.end.x}%`} y2={`${line.end.y}%`} stroke="transparent" strokeWidth="8" />
                                <line x1={`${line.start.x}%`} y1={`${line.start.y}%`} x2={`${line.end.x}%`} y2={`${line.end.y}%`} stroke="red" strokeWidth="2" markerEnd={`url(#${arrowHeadId})`} markerStart={`url(#${arrowStartId})`} />
                            </g>
                        ))}
                    </svg>
                    
                    {/* Measurement Labels */}
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
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><Upload size={24} className="mb-2" /><span className="text-xs font-medium">Upload Sketch</span><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onReplaceImage(e.target.files[0])} /></div>
            )}
        </div>
    );
};

const TechPackView: React.FC<Props> = (props) => {
  const { data, images, originalImages, isProMode, onDataChange, brandLogo, onOpenLogoPicker, onUploadLogo, onSaveToBank, onVectorize, vectorizingSide, onAnnotationChange, onDrawingChange, onSketchReplace, onGenerateMockup, isGeneratingMockup, printSettings, onPrintSettingsChange, onTriggerPrint, onModifyDesign, isModifying, onOpenFactoryMatching, onTranslate, onMeasurementLineChange, onPlacedGraphicsChange, onRecolorPathsChange, isFootwearMode, onFillsChange, isDarkMode } = props;
  
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
    // ... (Keep existing undo logic)
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
    // ... (Keep existing logic)
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

  // ... (Keep other handler functions: handleAddReferenceImage, handleRemoveReferenceImage, Palette, Colorways, Exports, AutoMeasure)
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
                  setEditMode('bucket'); 
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleExportPDF = () => { setShowExportMenu(false); onTriggerPrint?.(); };
  const handleExportExcel = () => { 
      setShowExportMenu(false); 
      // ... (Keep excel logic)
      try {
          let csvContent = "Style Name,Style Number,Season\n";
          csvContent += `"${(data.styleName || '').replace(/"/g, '""')}","${(data.styleNumber || '').replace(/"/g, '""')}","${(data.season || '').replace(/"/g, '""')}"\n\n`;
          csvContent += "MEASUREMENTS\n";
          csvContent += "Code,Description,Tolerance,Target,Actual,Variance,Status\n";
          (data.measurements || []).forEach(m => {
              const row = [m.code, m.description, m.tolerance, m.target, m.actual || '', m.variance || '', m.status || ''];
              csvContent += row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(",") + "\n";
          });
          csvContent += "\nBILL OF MATERIALS\n";
          csvContent += "Placement,Item,Description,Supplier,Quantity,Unit Price,Total Price\n";
          (data.bom || []).forEach(b => {
              const row = [b.placement, b.item, b.description, b.supplier, b.quantity, b.unitPrice || '', b.totalPrice || ''];
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
      } catch (e) { console.error("Export Excel failed", e); alert("Failed to export Excel file"); }
  };
  const handleExportAI = () => { 
      setShowExportMenu(false); 
      // ... (Keep AI logic)
      alert("SVG Export triggered.");
  };

  const handleAutoMeasure = () => {
    // ... (Keep auto measure logic)
    if (data.measurements && data.measurements.length > 0) {
        const newLines: MeasurementLine[] = data.measurements.slice(0, 5).map((m, i) => {
            const code = m.code.toUpperCase();
            const desc = m.description.toLowerCase();
            let start = { x: 36, y: 50 };
            let end = { x: 64, y: 50 };
            if (desc.includes('shoulder') || code === 'HPS') { start = { x: 36, y: 22 }; end = { x: 64, y: 22 }; } 
            else if (desc.includes('chest') || desc.includes('bust')) { start = { x: 34, y: 38 }; end = { x: 66, y: 38 }; } 
            else if (desc.includes('waist')) { start = { x: 36, y: 55 }; end = { x: 64, y: 55 }; } 
            else if (desc.includes('hem') || desc.includes('bottom')) { start = { x: 34, y: 85 }; end = { x: 66, y: 85 }; } 
            else if (desc.includes('sleeve') || desc.includes('arm')) { start = { x: 66, y: 24 }; end = { x: 88, y: 55 }; } 
            else if (desc.includes('length')) { start = { x: 50, y: 15 }; end = { x: 50, y: 85 }; } 
            else { start = { x: 36, y: 30 + (i * 10) }; end = { x: 64, y: 30 + (i * 10) }; }
            return { id: Date.now().toString() + i, start, end, label: m.code };
        });
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
  
  const updateNestedField = (arrayName: keyof TechPackData, index: number, field: string, value: string) => {
    const arr = data[arrayName];
    if (Array.isArray(arr)) {
        const newArr = [...arr];
        newArr[index] = { ...newArr[index], [field]: value };
        onDataChange({ ...data, [arrayName]: newArr });
    }
  };

  const addItem = (arrayName: keyof TechPackData, item: any) => {
     const arr = data[arrayName];
     if (Array.isArray(arr)) {
         onDataChange({ ...data, [arrayName]: [...arr, item] });
     }
  };

  const removeItem = (arrayName: keyof TechPackData, index: number) => {
      const arr = data[arrayName];
      if (Array.isArray(arr)) {
          const newArr = [...arr];
          newArr.splice(index, 1);
          onDataChange({ ...data, [arrayName]: newArr });
      }
  };
  
  const currentImage = activeSketch === 'front' ? images.frontSketch : (activeSketch === 'back' ? images.backSketch : images.sideSketch);
  const currentDrawings = activeSketch === 'front' ? data.frontDrawings : (activeSketch === 'back' ? data.backDrawings : data.sideDrawings);
  const currentMeasurementLines = activeSketch === 'front' ? data.frontMeasurementLines : (activeSketch === 'back' ? data.backMeasurementLines : data.sideMeasurementLines);
  const currentPlacedGraphics = activeSketch === 'front' ? data.frontPlacedGraphics : (activeSketch === 'back' ? data.backPlacedGraphics : data.sidePlacedGraphics);
  const currentFills = activeSketch === 'front' ? data.frontFills : (activeSketch === 'back' ? data.backFills : data.sideFills);

  // Common Page Styles - IMPROVED FOR PRINT & LAYOUT
  const pageStyle = `w-[794px] min-h-[1123px] bg-white dark:bg-[#1C1C1E] shadow-sm p-8 relative print:w-full print:h-auto print:shadow-none print:m-0 print:break-after-page mb-8 mx-auto transition-colors duration-300`;

  return (
    <div className={`flex flex-col w-full bg-white dark:bg-black text-black dark:text-white print:block min-h-screen`}>
       {/* Toolbar */}
       <div className="sticky top-14 z-40 bg-white dark:bg-[#1C1C1E] border-b border-gray-200 dark:border-white/10 px-4 py-2 flex items-center justify-between no-print transition-colors duration-300">
           <div className="flex items-center gap-2">
               {/* View Toggle */}
               <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-lg">
                   {['front', 'side', 'back'].map((side) => (
                       <button
                           key={side}
                           onClick={() => setActiveSketch(side as any)}
                           className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${activeSketch === side ? 'bg-white dark:bg-white/20 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                       >
                           {side}
                       </button>
                   ))}
               </div>
               <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2"></div>
               {/* Tools */}
               <div className="flex gap-1">
                   <button onClick={() => setEditMode('annotate')} className={`p-2 rounded-md ${editMode === 'annotate' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400'}`} title="Annotation"><Tag size={16}/></button>
                   <button onClick={() => setEditMode('draw')} className={`p-2 rounded-md ${editMode === 'draw' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400'}`} title="Freehand"><PenTool size={16}/></button>
                   <button onClick={() => setEditMode('measure')} className={`p-2 rounded-md ${editMode === 'measure' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400'}`} title="Measure"><Ruler size={16}/></button>
                   <button onClick={() => setEditMode('place_graphic')} className={`p-2 rounded-md ${editMode === 'place_graphic' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400'}`} title="Place Graphic"><ImagePlus size={16}/></button>
                   <button onClick={() => setEditMode('bucket')} className={`p-2 rounded-md ${editMode === 'bucket' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400'}`} title="Flood Fill"><PaintBucket size={16}/></button>
               </div>
               
               {editMode === 'draw' && (
                   <div className="flex items-center gap-2 ml-2">
                       <input type="color" value={drawingColor} onChange={(e) => setDrawingColor(e.target.value)} className="w-6 h-6 rounded border-none cursor-pointer" />
                   </div>
               )}
                {editMode === 'bucket' && (
                   <div className="flex items-center gap-2 ml-2">
                       <input type="color" value={drawingColor} onChange={(e) => { setDrawingColor(e.target.value); setDrawingPattern(null); }} className="w-6 h-6 rounded border-none cursor-pointer" />
                        <button onClick={() => patternInputRef.current?.click()} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded" title="Upload Pattern">
                            <Grid size={16} className="text-gray-500 dark:text-gray-400"/>
                        </button>
                        <input type="file" ref={patternInputRef} className="hidden" accept="image/*" onChange={handlePatternUpload} />
                   </div>
               )}
               
               <button onClick={handleUndo} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-600 dark:text-gray-400 ml-2" title="Undo"><Undo size={16}/></button>
           </div>
           
           <div className="flex items-center gap-2">
               <button onClick={onGenerateMockup} disabled={isGeneratingMockup} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors disabled:opacity-50">
                   {isGeneratingMockup ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                   Generate Mockup
               </button>
               <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-2 px-3 py-1.5 bg-black dark:bg-white dark:text-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                   <Download size={14}/> Export
               </button>
               {showExportMenu && (
                   <div className="absolute top-full right-4 mt-2 bg-white dark:bg-[#1C1C1E] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 p-2 flex flex-col w-40 z-50">
                       <button onClick={handleExportPDF} className="text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-sm font-medium dark:text-white">Download PDF</button>
                       <button onClick={handleExportExcel} className="text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-sm font-medium dark:text-white">Export Excel</button>
                       <button onClick={handleExportAI} className="text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-sm font-medium flex items-center justify-between dark:text-white">Export CAD <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">PRO</span></button>
                   </div>
               )}
           </div>
       </div>

       <div className="flex-1 bg-gray-50 dark:bg-black p-4 md:p-8 print:p-0 print:bg-white overflow-auto print:overflow-visible transition-colors duration-300">
           <div style={{ transform: `scale(${effectiveScale})`, transformOrigin: 'top center' }} className="print:transform-none">
               
               {/* ================= PAGE 1: DESIGN OVERVIEW ================= */}
               <div className={pageStyle}>
                   <PageHeader 
                      data={data} 
                      brandLogo={brandLogo} 
                      onOpenLogoPicker={onOpenLogoPicker} 
                      onUploadLogo={onUploadLogo} 
                      pageNumber="01" 
                      onUpdateField={updateField}
                   />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                       <div className="aspect-[3/4] border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 relative rounded-lg overflow-hidden group">
                           <AnnotationCanvas 
                               imageSrc={currentImage || null}
                               annotations={activeAnnotations}
                               drawings={currentDrawings || []}
                               measurementLines={currentMeasurementLines || []}
                               placedGraphics={currentPlacedGraphics || []}
                               fills={currentFills}
                               onChangeAnnotations={(a) => onAnnotationChange?.(activeSketch, a)}
                               onChangeDrawings={(d) => onDrawingChange?.(activeSketch, d)}
                               onChangeMeasurementLines={(l) => onMeasurementLineChange?.(activeSketch, l)}
                               onChangePlacedGraphics={(g) => onPlacedGraphicsChange?.(activeSketch, g)}
                               onFillsChange={(f) => onFillsChange?.(activeSketch, f)}
                               activeId={activeAnnotationId}
                               onSetActiveId={setActiveAnnotationId}
                               mode={editMode === 'view' ? 'annotate' : editMode} 
                               drawingColor={drawingColor}
                               drawingPattern={drawingPattern}
                               onReplaceImage={(f) => { const r = new FileReader(); r.onload = (e) => onSketchReplace?.(activeSketch, e.target!.result as string); r.readAsDataURL(f); }}
                               onAddGraphic={handleAddPlacedGraphic}
                               measurements={data.measurements}
                           />
                           
                           <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                                <button onClick={() => onVectorize?.(activeSketch)} className="bg-white/90 dark:bg-black/90 p-1.5 rounded-md text-xs font-bold shadow-sm hover:bg-white dark:hover:bg-black flex items-center gap-1 dark:text-white">
                                    {vectorizingSide === activeSketch ? <Loader2 size={12} className="animate-spin"/> : <FileCode size={12}/>} SVG
                                </button>
                                {editMode === 'measure' && <button onClick={handleAutoMeasure} className="bg-white/90 dark:bg-black/90 p-1.5 rounded-md text-xs font-bold shadow-sm hover:bg-white dark:hover:bg-black flex items-center gap-1 dark:text-white"><Zap size={12}/> Auto</button>}
                           </div>
                       </div>

                       <div className="flex flex-col gap-6">
                           <div>
                               <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 border-b dark:border-white/10 pb-1">Design Description</h3>
                               <EditableField as="textarea" value={data.description} onChange={(v) => updateField('description', v)} className="w-full text-sm leading-relaxed min-h-[100px] text-black dark:text-white" />
                           </div>
                           
                           <div>
                               <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 border-b dark:border-white/10 pb-1">Fabrication</h3>
                               <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/10 flex items-start gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" onClick={() => (window as any).setShowFabricLibrary?.(true)}>
                                   <div className="flex-1">
                                       <div className="text-sm font-bold text-black dark:text-white">{data.fabrication}</div>
                                       <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to browse library</div>
                                   </div>
                               </div>
                           </div>

                           <div>
                               <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 border-b dark:border-white/10 pb-1 flex justify-between items-center">
                                   Colorway: {data.colorWay}
                                   <button onClick={handleAddPaletteColor} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 p-1 rounded"><Plus size={12}/></button>
                               </h3>
                               <div className="flex flex-wrap gap-2">
                                   {(data.palette || []).map((color, idx) => (
                                       <div key={idx} className="flex flex-col gap-1 items-center group relative">
                                           <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/20 shadow-sm" style={{ backgroundColor: color.hex }}></div>
                                           <input type="text" value={color.name} onChange={(e) => handleUpdatePaletteColor(idx, 'name', e.target.value)} className="text-[10px] text-center w-16 bg-transparent outline-none font-medium text-black dark:text-white" />
                                           <input type="text" value={color.pantone} onChange={(e) => handleUpdatePaletteColor(idx, 'pantone', e.target.value)} className="text-[9px] text-center w-16 bg-transparent outline-none text-gray-500 dark:text-gray-400" />
                                           <button onClick={() => handleRemovePaletteColor(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={8}/></button>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       </div>
                   </div>
                   <PageFooter />
               </div>

               {/* ================= PAGE 2: TECHNICAL SPECS ================= */}
               <div className={pageStyle}>
                   <PageHeader 
                      data={data} 
                      brandLogo={brandLogo} 
                      pageNumber="02" 
                      title="MEASUREMENTS & CONSTRUCTION"
                      onUpdateField={updateField}
                   />

                   {/* Measurements Table */}
                   <div className="mb-8">
                       <div className="flex justify-between items-end mb-2 border-b border-black dark:border-white/20 pb-1">
                           <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Points of Measure</h3>
                           <div className="flex gap-2">
                               <button onClick={() => setQcMode(!qcMode)} className={`text-[10px] font-bold px-2 py-1 rounded border ${qcMode ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black border-gray-300 dark:bg-transparent dark:text-white dark:border-white/20'} no-print`}>QC Mode</button>
                               <button onClick={() => addItem('measurements', { code: 'NEW', description: '', tolerance: '+/- 1', target: '0' })} className="text-[10px] font-bold flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-white/10 px-2 py-1 rounded no-print text-black dark:text-white"><Plus size={10}/> Add POM</button>
                           </div>
                       </div>
                       <table className="w-full text-xs text-left border-collapse">
                           <thead>
                               <tr className="bg-gray-100 dark:bg-white/5">
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-12 text-black dark:text-white">Code</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 text-black dark:text-white">Description</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-16 text-black dark:text-white">Tol (+/-)</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-16 text-black dark:text-white">Target</th>
                                   {qcMode && (
                                       <>
                                           <th className="p-2 border border-gray-200 dark:border-white/10 w-16 bg-blue-50 dark:bg-blue-900/20 text-black dark:text-white">Actual</th>
                                           <th className="p-2 border border-gray-200 dark:border-white/10 w-16 bg-blue-50 dark:bg-blue-900/20 text-black dark:text-white">Var</th>
                                           <th className="p-2 border border-gray-200 dark:border-white/10 w-16 bg-blue-50 dark:bg-blue-900/20 text-black dark:text-white">Status</th>
                                       </>
                                   )}
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-8 no-print"></th>
                               </tr>
                           </thead>
                           <tbody>
                               {(data.measurements || []).map((m, i) => (
                                   <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5 text-black dark:text-gray-300">
                                       <td className="p-2 border border-gray-200 dark:border-white/10"><EditableField value={m.code} onChange={(v) => updateNestedField('measurements', i, 'code', v)} /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10"><EditableField value={m.description} onChange={(v) => updateNestedField('measurements', i, 'description', v)} /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10"><EditableField value={m.tolerance} onChange={(v) => updateNestedField('measurements', i, 'tolerance', v)} /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10"><EditableField value={m.target} onChange={(v) => updateNestedField('measurements', i, 'target', v)} /></td>
                                       {qcMode && (
                                           <>
                                               <td className="p-2 border border-gray-200 dark:border-white/10 bg-blue-50/30 dark:bg-blue-900/10"><EditableField value={m.actual || ''} onChange={(v) => {
                                                   const actual = parseFloat(v);
                                                   const target = parseFloat(m.target);
                                                   const tol = parseFloat(m.tolerance.replace('+/-','').trim());
                                                   const diff = actual - target;
                                                   const status = Math.abs(diff) <= tol ? 'pass' : 'fail';
                                                   updateNestedField('measurements', i, 'actual', v);
                                                   updateNestedField('measurements', i, 'variance', diff.toFixed(1));
                                                   updateNestedField('measurements', i, 'status', status);
                                               }} /></td>
                                               <td className={`p-2 border border-gray-200 dark:border-white/10 ${parseFloat(m.variance || '0') > parseFloat(m.tolerance.replace('+/-','').trim()) ? 'text-red-500 font-bold' : ''}`}>{m.variance}</td>
                                               <td className="p-2 border border-gray-200 dark:border-white/10">
                                                   {m.status === 'pass' && <span className="text-green-600 dark:text-green-400 font-bold text-[10px] uppercase">Pass</span>}
                                                   {m.status === 'fail' && <span className="text-red-600 dark:text-red-400 font-bold text-[10px] uppercase">Fail</span>}
                                               </td>
                                           </>
                                       )}
                                       <td className="p-2 border border-gray-200 dark:border-white/10 text-center no-print">
                                           <button onClick={() => removeItem('measurements', i)} className="text-gray-300 hover:text-red-500"><Trash2 size={12}/></button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>

                   {/* Construction Details */}
                   <div className="mb-8">
                        <div className="flex justify-between items-end mb-2 border-b border-black dark:border-white/20 pb-1">
                           <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Construction Details</h3>
                           <button onClick={() => addItem('construction', { feature: 'New Feature', instruction: 'Instructions...' })} className="text-[10px] font-bold flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-white/10 px-2 py-1 rounded no-print text-black dark:text-white"><Plus size={10}/> Add Note</button>
                        </div>
                        <table className="w-full text-xs text-left border-collapse">
                           <thead>
                               <tr className="bg-gray-100 dark:bg-white/5">
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-1/4 text-black dark:text-white">Feature / Placement</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 text-black dark:text-white">Instruction</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-8 no-print"></th>
                               </tr>
                           </thead>
                           <tbody>
                               {(data.construction || []).map((c, i) => (
                                   <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5 text-black dark:text-gray-300">
                                       <td className="p-2 border border-gray-200 dark:border-white/10 font-medium"><EditableField value={c.feature} onChange={(v) => updateNestedField('construction', i, 'feature', v)} /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10"><EditableField value={c.instruction} onChange={(v) => updateNestedField('construction', i, 'instruction', v)} /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10 text-center no-print">
                                           <button onClick={() => removeItem('construction', i)} className="text-gray-300 hover:text-red-500"><Trash2 size={12}/></button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                   <PageFooter />
               </div>

               {/* ================= PAGE 3: BOM & PACKAGING ================= */}
               <div className={pageStyle}>
                   <PageHeader 
                      data={data} 
                      brandLogo={brandLogo} 
                      pageNumber="03" 
                      title="BILL OF MATERIALS"
                      onUpdateField={updateField}
                   />

                   {/* Bill of Materials */}
                   <div className="mb-8">
                       <div className="flex justify-between items-end mb-2 border-b border-black dark:border-white/20 pb-1">
                           <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Bill of Materials (BOM)</h3>
                           <button onClick={() => addItem('bom', { placement: 'Self', item: 'Fabric', description: '', supplier: 'TBD', quantity: '1' })} className="text-[10px] font-bold flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-white/10 px-2 py-1 rounded no-print text-black dark:text-white"><Plus size={10}/> Add Item</button>
                       </div>
                       <table className="w-full text-xs text-left border-collapse">
                           <thead>
                               <tr className="bg-gray-100 dark:bg-white/5">
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-24 text-black dark:text-white">Placement</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-32 text-black dark:text-white">Item</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 text-black dark:text-white">Description</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-24 text-black dark:text-white">Supplier</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-16 text-black dark:text-white">Qty</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-16 text-black dark:text-white">Price</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-16 text-black dark:text-white">Total</th>
                                   <th className="p-2 border border-gray-200 dark:border-white/10 w-8 no-print"></th>
                               </tr>
                           </thead>
                           <tbody>
                               {(data.bom || []).map((b, i) => (
                                   <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5 text-black dark:text-gray-300">
                                       <td className="p-2 border border-gray-200 dark:border-white/10"><EditableField value={b.placement} onChange={(v) => updateNestedField('bom', i, 'placement', v)} /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10 font-medium"><EditableField value={b.item} onChange={(v) => updateNestedField('bom', i, 'item', v)} /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10"><EditableField value={b.description} onChange={(v) => updateNestedField('bom', i, 'description', v)} /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10"><EditableField value={b.supplier} onChange={(v) => updateNestedField('bom', i, 'supplier', v)} /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10"><EditableField value={b.quantity} onChange={(v) => updateNestedField('bom', i, 'quantity', v)} /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10"><EditableField value={b.unitPrice || ''} onChange={(v) => updateNestedField('bom', i, 'unitPrice', v)} placeholder="$" /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10"><EditableField value={b.totalPrice || ''} onChange={(v) => updateNestedField('bom', i, 'totalPrice', v)} placeholder="$" /></td>
                                       <td className="p-2 border border-gray-200 dark:border-white/10 text-center no-print">
                                           <button onClick={() => removeItem('bom', i)} className="text-gray-300 hover:text-red-500"><Trash2 size={12}/></button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>

                   {/* Labels & Packaging */}
                   <div className="grid grid-cols-2 gap-8 mb-8">
                       <div>
                           <div className="flex justify-between items-end mb-2 border-b border-black dark:border-white/20 pb-1">
                               <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Labels</h3>
                               <button onClick={() => addItem('labels', { type: 'Main', material: 'Woven', dimensions: 'Standard', placement: 'Neck' })} className="text-[10px] font-bold hover:bg-gray-100 dark:hover:bg-white/10 px-1 rounded no-print text-black dark:text-white"><Plus size={10}/></button>
                           </div>
                           <div className="space-y-2">
                                {(data.labels || []).map((l, i) => (
                                    <div key={i} className="border border-gray-200 dark:border-white/10 p-2 rounded text-xs relative group text-black dark:text-gray-300">
                                        <button onClick={() => removeItem('labels', i)} className="absolute top-1 right-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity no-print"><X size={10}/></button>
                                        <div className="grid grid-cols-2 gap-2 mb-1">
                                            <EditableField value={l.type} onChange={(v) => updateNestedField('labels', i, 'type', v)} className="font-bold text-black dark:text-white" />
                                            <EditableField value={l.dimensions} onChange={(v) => updateNestedField('labels', i, 'dimensions', v)} className="text-right text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400 mb-1"><EditableField value={l.material} onChange={(v) => updateNestedField('labels', i, 'material', v)} /></div>
                                        <div className="text-gray-500 dark:text-gray-500 italic"><EditableField value={l.placement} onChange={(v) => updateNestedField('labels', i, 'placement', v)} /></div>
                                    </div>
                                ))}
                           </div>
                       </div>
                       <div>
                           <div className="flex justify-between items-end mb-2 border-b border-black dark:border-white/20 pb-1">
                               <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Packaging</h3>
                               <button onClick={() => addItem('packaging', { type: 'Polybag', description: 'Clear', material: 'LDPE', dimensions: 'Standard' })} className="text-[10px] font-bold hover:bg-gray-100 dark:hover:bg-white/10 px-1 rounded no-print text-black dark:text-white"><Plus size={10}/></button>
                           </div>
                           <div className="space-y-2">
                                {(data.packaging || []).map((p, i) => (
                                    <div key={i} className="border border-gray-200 dark:border-white/10 p-2 rounded text-xs relative group text-black dark:text-gray-300">
                                        <button onClick={() => removeItem('packaging', i)} className="absolute top-1 right-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity no-print"><X size={10}/></button>
                                        <div className="grid grid-cols-2 gap-2 mb-1">
                                            <EditableField value={p.type} onChange={(v) => updateNestedField('packaging', i, 'type', v)} className="font-bold text-black dark:text-white" />
                                            <EditableField value={p.dimensions} onChange={(v) => updateNestedField('packaging', i, 'dimensions', v)} className="text-right text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400 mb-1"><EditableField value={p.material} onChange={(v) => updateNestedField('packaging', i, 'material', v)} /></div>
                                        <div className="text-gray-500 dark:text-gray-500"><EditableField value={p.description} onChange={(v) => updateNestedField('packaging', i, 'description', v)} /></div>
                                    </div>
                                ))}
                           </div>
                       </div>
                   </div>

                   <PageFooter />
               </div>

           </div>
       </div>
    </div>
  );
};

export default TechPackView;