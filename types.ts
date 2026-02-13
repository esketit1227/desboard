
export interface MeasurementPoint {
  code: string;
  description: string;
  tolerance: string;
  target: string;
  actual?: string; // QC Field
  variance?: string; // QC Field
  status?: 'pass' | 'fail' | 'pending'; // QC Field
}

export interface MaterialItem {
  placement: string;
  item: string;
  description: string;
  supplier: string;
  quantity: string;
  unitPrice?: string;
  totalPrice?: string;
}

export interface ConstructionDetail {
  feature: string;
  instruction: string;
}

export interface ColorwayImages {
  front?: string;
  back?: string;
  side?: string;
  mockup?: string;
}

export interface Colorway {
  name: string;
  code: string;
  images?: ColorwayImages;
}

export interface Annotation {
  id: string;
  x: number;
  y: number;
  number: number;
  text: string;
}

export interface MeasurementLine {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  label: string; // e.g., "A", "1/2 Chest"
  value?: string; // e.g., "52cm"
}

export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface FloodFill {
  id: string;
  x: number; // Seed X coordinate
  y: number; // Seed Y coordinate
  color: string; // Hex color
  patternUrl?: string; // URL of the pattern image
  tolerance: number;
}

export interface PlacedGraphic {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100 relative to container width
  imageUrl: string;
}

export interface GraphicItem {
  id: string;
  placement: string;
  description: string;
  dimensions: string;
  technique: string;
  colors: string;
  imageUrl?: string;
}

export interface LabelDetail {
  id: string;
  type: string; // Main, Care, Size, etc.
  material: string;
  dimensions: string;
  placement: string;
  imageUrl?: string;
}

export interface PackagingDetail {
  id: string;
  type: string; // Hangtag, Polybag, etc.
  description: string;
  material: string;
  dimensions: string;
  imageUrl?: string;
}

export interface ReferenceImage {
  id: string;
  url: string;
  category: 'Inspiration' | 'Brand' | 'Competitor' | 'Sample';
  notes?: string;
}

export interface PaletteColor {
  name: string;
  hex: string;
  pantone: string;
}

export interface CostingSummary {
  laborCost: string;
  overheadPercent: string;
  targetMargin: string;
  totalFOB?: string;
  suggestedRRP?: string;
}

export interface MarketAnalysis {
  category: string; // e.g. "Streetwear", "Athleisure"
  trendingKeywords: string[];
  targetAudience: string;
  pricePoint: 'Budget' | 'Mid-Range' | 'Premium' | 'Luxury';
  estimatedRetail: string;
  sustainabilityScore: string; // "High", "Medium", "Low"
}

export interface TechPackData {
  styleNumber: string;
  styleName: string;
  season: string;
  fabrication: string;
  colorWay: string;
  description: string;
  measurements: MeasurementPoint[];
  bom: MaterialItem[];
  construction: ConstructionDetail[];
  graphics?: GraphicItem[];
  labels?: LabelDetail[];
  packaging?: PackagingDetail[];
  referenceImages?: ReferenceImage[]; 
  colorways: Colorway[];
  palette?: PaletteColor[];
  sketchPrompts: {
    front: string;
    back: string;
    side: string;
  };
  frontAnnotations?: Annotation[];
  backAnnotations?: Annotation[];
  sideAnnotations?: Annotation[];
  frontDrawings?: DrawingPath[];
  backDrawings?: DrawingPath[];
  sideDrawings?: DrawingPath[];
  frontFills?: FloodFill[];
  backFills?: FloodFill[];
  sideFills?: FloodFill[];
  frontMeasurementLines?: MeasurementLine[];
  backMeasurementLines?: MeasurementLine[];
  sideMeasurementLines?: MeasurementLine[];
  frontPlacedGraphics?: PlacedGraphic[];
  backPlacedGraphics?: PlacedGraphic[];
  sidePlacedGraphics?: PlacedGraphic[];
  costing?: CostingSummary;
  marketAnalysis?: MarketAnalysis;
  fitComments?: string; 
}

export interface GeneratedImages {
  frontSketch: string | null;
  backSketch: string | null;
  sideSketch: string | null;
  frontVector?: string | null;
  backVector?: string | null;
  sideVector?: string | null;
  mockup?: string | null;
}

export type AssetType = 'logo' | 'techpack';

export interface DesignAsset {
  id: string;
  type: AssetType;
  name: string;
  url?: string;
  data?: {
    techData: TechPackData;
    images: GeneratedImages;
    originalImages: string[];
  };
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export enum AppState {
  IDLE,
  ANALYZING,
  GENERATING_SKETCHES,
  COMPLETE,
  ERROR
}

export interface PrintSettings {
  format: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
}

export interface Factory {
  id: string;
  name: string;
  region: string;
  specialties: string[];
  moq: string;
  priceTier: 'Budget' | 'Mid' | 'High';
  rating: number;
  sustainability: boolean;
  source?: 'internal' | 'alibaba';
  badges?: string[]; // e.g. 'Gold Supplier', 'Verified'
  responseRate?: string;
  yearsActive?: number;
}

export interface Fabric {
  id: string;
  name: string;
  composition: string;
  weight: string; // e.g., "300 GSM"
  width: string; // e.g., "150cm"
  price: string;
  image: string;
  category: string;
  tags: string[];
}
