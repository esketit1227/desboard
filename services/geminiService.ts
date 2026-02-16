
import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { TechPackData } from "../types";

// Schema for the text analysis
const techPackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    styleName: { type: Type.STRING, description: "A professional fashion industry name for the item" },
    styleNumber: { type: Type.STRING, description: "A generated style code (e.g., FW24-001)" },
    season: { type: Type.STRING, description: "Suggested season (e.g., S/S 2025)" },
    fabrication: { type: Type.STRING, description: "Likely fabric composition and weight" },
    colorWay: { type: Type.STRING, description: "Primary color name" },
    description: { type: Type.STRING, description: "Technical description of the garment" },
    sketchPrompts: {
      type: Type.OBJECT,
      properties: {
        front: { type: Type.STRING, description: "A highly detailed prompt to generate a black and white technical flat sketch line drawing of the FRONT of this garment. MUST BE PLAIN/BLANK. NO LOGOS. NO PRINTS." },
        back: { type: Type.STRING, description: "A highly detailed prompt to generate a black and white technical flat sketch line drawing of the BACK of this garment. MUST BE PLAIN/BLANK. NO LOGOS. NO PRINTS." },
        side: { type: Type.STRING, description: "A highly detailed prompt to generate a black and white technical flat sketch line drawing of the SIDE PROFILE view of this garment (left side). MUST BE PLAIN/BLANK." },
      },
      required: ["front", "back", "side"]
    },
    palette: {
      type: Type.ARRAY,
      description: "Extract the 3-5 dominant colors used in the garment design.",
      items: {
          type: Type.OBJECT,
          properties: {
              name: { type: Type.STRING, description: "Color Name (e.g. Midnight Blue)" },
              hex: { type: Type.STRING, description: "Hex Code (e.g. #000080)" },
              pantone: { type: Type.STRING, description: "Closest Pantone TCX Code (e.g. 19-3923 TCX)" }
          },
          required: ["name", "hex", "pantone"]
      }
    },
    measurements: {
      type: Type.ARRAY,
      description: "List of 8-12 key points of measure. ESTIMATE REALISTIC VALUES for a Standard US Size Medium based on the image proportions.",
      items: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING, description: "POM Code (e.g., HPS, C01)" },
          description: { type: Type.STRING, description: "Measurement location description" },
          tolerance: { type: Type.STRING, description: "Industry standard tolerance (+/-)" },
          target: { type: Type.STRING, description: "Target measurement in cm (REALISTIC ESTIMATE for Size M)" }
        },
        required: ["code", "description", "tolerance", "target"]
      }
    },
    bom: {
      type: Type.ARRAY,
      description: "Bill of Materials (Hardware, Trims, Labels, Thread)",
      items: {
        type: Type.OBJECT,
        properties: {
          placement: { type: Type.STRING },
          item: { type: Type.STRING },
          description: { type: Type.STRING },
          supplier: { type: Type.STRING, description: "Generic supplier type or 'Local'" },
          quantity: { type: Type.STRING }
        },
        required: ["placement", "item", "description", "quantity"]
      }
    },
    construction: {
      type: Type.ARRAY,
      description: "List of technical construction notes (seams, hems, stitching)",
      items: {
        type: Type.OBJECT,
        properties: {
          feature: { type: Type.STRING },
          instruction: { type: Type.STRING }
        },
        required: ["feature", "instruction"]
      }
    },
    graphics: {
      type: Type.ARRAY,
      description: "List of visual graphics, prints, embroideries, or logos found on the garment.",
      items: {
        type: Type.OBJECT,
        properties: {
            placement: { type: Type.STRING },
            description: { type: Type.STRING },
            dimensions: { type: Type.STRING },
            technique: { type: Type.STRING },
            colors: { type: Type.STRING }
        },
        required: ["placement", "description", "dimensions", "technique", "colors"]
      }
    },
    labels: {
      type: Type.ARRAY,
      description: "List of garment labels (Main, Care, Size). Infer standard placements if not visible.",
      items: {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, description: "e.g. Main Label, Care Label" },
            material: { type: Type.STRING, description: "e.g. Woven Satin, Printed" },
            dimensions: { type: Type.STRING },
            placement: { type: Type.STRING, description: "Specific placement instructions" }
        },
        required: ["type", "material", "dimensions", "placement"]
      }
    },
    packaging: {
      type: Type.ARRAY,
      description: "Standard packaging requirements (Hangtags, Polybags).",
      items: {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING },
            description: { type: Type.STRING },
            material: { type: Type.STRING },
            dimensions: { type: Type.STRING }
        },
        required: ["type", "description", "material", "dimensions"]
      }
    },
    marketAnalysis: {
        type: Type.OBJECT,
        description: "Trend and market positioning analysis",
        properties: {
            category: { type: Type.STRING, description: "Style Category (e.g. Y2K, Streetwear)" },
            trendingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            targetAudience: { type: Type.STRING },
            pricePoint: { type: Type.STRING, enum: ['Budget', 'Mid-Range', 'Premium', 'Luxury'] },
            estimatedRetail: { type: Type.STRING, description: "Estimated RRP Range" },
            sustainabilityScore: { type: Type.STRING, description: "High, Medium, or Low based on materials" }
        },
        required: ["category", "trendingKeywords", "pricePoint"]
    }
  },
  required: ["styleName", "styleNumber", "season", "fabrication", "colorWay", "description", "measurements", "bom", "construction", "sketchPrompts", "marketAnalysis", "palette"]
};

const LUCKY_KEYWORDS = [
    // Aesthetics
    "Algorithmic aesthetics", "Sustainability (post-consumer materials)", "Wearable technology integration",
    "Irony as luxury", "Underground influence", "Distressed", "Fabric washes", "Hardware as design elements",
    "Innovative fabrics", "Streetwear luxury", "Vintage inspiration", "Avant-garde", "High fashion",
    "Experimental", "Minimalist", "Architectural", "Subversive", "Futuristic", "Edgy", "Sculptural",
    "Deconstructed", "Techwear elements", "Industrial aesthetic", "Cyberpunk", "Cottagecore", "Gorpcore",
    "Y2K", "Utilitarian", "Maximalist", "Regencycore", "Normcore", "E-girl/E-boy", "Dark Academia",
    "Light Academia", "Grunge", "Preppy", "Bohemian", "Punk", "Goth", "Skater", "Surfer", "Hip Hop",
    "Rave", "Festival", "Resort Wear", "Loungewear", "Athleisure", "Workwear", "Military", "Western",
    "Biker", "Mod", "Retro", "Space Age", "Baroque", "Rococo", "Victorian", "Edwardian",
    "Art Deco", "Pop Art", "Op Art", "Psychedelic", "Surrealist", "Office Core", "Clean Girl", "Old Money",
    "Mob Wife", "Eclectic Grandpa", "Coquette", "Balletcore", "Acubi", "Weird Girl", "Blokecore", "Solarpunk",
    
    // Brands/Influences (Stylistic references only)
    "Balenciaga-esque", "Vetements-inspired", "Rick Owens style", "Margiela deconstruction", 
    "Prada nylon", "Miu Miu raw hem", "Acne Studios minimal", "Off-White industrial",
    "Hellstar aesthetic", "Corteiz vibe", "Yeezy earth tones", "Chrome Hearts hardware",
    "Vivienne Westwood punk", "Jean Paul Gaultier mesh", "Comme des Garcons shape",
    "Instagram Brand", "Archive Fashion", "Japanese Denim", "Belgian Design",
    
    // Techniques & Items
    "Inflatable", "Patchwork", "Quilted", "Cutouts", "Asymmetrical", "Sheer layering",
    "Oversized silhouette", "Cropped boxy fit", "Raw hems", "Exposed seams", "Safety pins",
    "Heavy metal hardware", "Corsetry", "Bondage straps", "Liquid latex", "Chainmail"
];

// Helper to remove heavy base64 strings from data before sending to LLM context
const stripImagesFromData = (data: TechPackData): any => {
    const clone = JSON.parse(JSON.stringify(data));
    
    if (clone.graphics) {
        clone.graphics.forEach((g: any) => delete g.imageUrl);
    }
    if (clone.labels) {
        clone.labels.forEach((l: any) => delete l.imageUrl);
    }
    if (clone.packaging) {
        clone.packaging.forEach((p: any) => delete p.imageUrl);
    }
    if (clone.colorways) {
        clone.colorways.forEach((c: any) => delete c.images);
    }
    if (clone.frontPlacedGraphics) {
        clone.frontPlacedGraphics.forEach((g: any) => delete g.imageUrl);
    }
    if (clone.backPlacedGraphics) {
        clone.backPlacedGraphics.forEach((g: any) => delete g.imageUrl);
    }
    if (clone.sidePlacedGraphics) {
        clone.sidePlacedGraphics.forEach((g: any) => delete g.imageUrl);
    }
    if (clone.referenceImages) {
        clone.referenceImages.forEach((r: any) => delete r.url);
    }
    
    return clone;
};

// Helper delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate image with model fallback and exponential backoff
const generateImageWithFallback = async (ai: GoogleGenAI, prompt: string, extraParts: any[] = [], width: '1K' | '2K' = '1K', aspectRatio: '1:1' | '3:4' = '1:1', preferPro: boolean = false, retryCount = 2) => {
    
    const tryGenerate = async (model: string, config: any) => {
        return await ai.models.generateContent({
            model: model,
            contents: { parts: [...extraParts, { text: prompt }] },
            config: config
        });
    };

    const attemptGeneration = async (usePro: boolean, attemptsLeft: number): Promise<any> => {
        const model = usePro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
        // Only Pro supports imageSize
        const config = {
             imageConfig: usePro ? { aspectRatio: aspectRatio, imageSize: width } : { aspectRatio: aspectRatio }
        };

        try {
            const res = await tryGenerate(model, config);
            return res;
        } catch (e: any) {
             console.warn(`Attempt failed for ${model}:`, e.message);
             // Handle 429 Rate Limits or 503 Service Unavailable with exponential backoff
             if (e.message?.includes('429') || e.status === 429 || e.status === 503 || e.status === 500) {
                 if (attemptsLeft > 0) {
                     const waitTime = 2000 * Math.pow(2, (2 - attemptsLeft)); 
                     await delay(waitTime);
                     return attemptGeneration(usePro, attemptsLeft - 1);
                 }
             }
             throw e; // Rethrow to trigger fallback to other model
        }
    };

    // 1. Primary Attempt
    try {
        return await attemptGeneration(preferPro, retryCount);
    } catch (e: any) {
        // 2. Fallback Attempt
        try {
            console.log(`Fallback to ${!preferPro ? 'Pro' : 'Flash'}...`);
            return await attemptGeneration(!preferPro, retryCount); 
        } catch (fallbackError) {
             console.error("All image generation attempts failed", fallbackError);
             throw fallbackError;
        }
    }
};

export const analyzeGarmentImage = async (base64Images: string[], type: 'clothing' | 'footwear' = 'clothing'): Promise<TechPackData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing. Please select an API Key.");
  if (base64Images.length === 0) throw new Error("No images provided");

  const ai = new GoogleGenAI({ apiKey });

  const imageParts = base64Images.map(img => ({
    inlineData: { mimeType: "image/jpeg", data: img }
  }));

  const systemInstruction = type === 'footwear' 
    ? "You are a senior FOOTWEAR technical designer. Analyze the shoe. The 'Front' view corresponds to the Lateral View. The 'Back' view corresponds to the Top/Sole View. The 'Side' view corresponds to the Medial/Inner View. Extract Outsole, Upper, Insole details."
    : "You are a senior fashion technical designer. Analyze the image and provide a professional Tech Pack. IMPORTANT: For 'measurements', you must ESTIMATE the REALISTIC values (in cm) for a Standard US Size Medium based on the visual proportions of the garment. Do not return 0 or 'TBD'. Use industry standard grading rules (e.g. a standard Men's Tee chest is ~52cm).";

  const prompt = type === 'footwear'
    ? "Analyze these shoe images and generate a professional Footwear Tech Pack. Identify construction, materials (sole, upper), branding, and packaging."
    : "Analyze these garment images. Generate a professional Tech Pack. Extract 3-5 key colors with Pantone codes. Extract labels/packaging. Estimate precise measurements for a Size M. Include prompts for Front, Back, and Side sketches. CRITICAL: You must generate a full Bill of Materials (BOM) and step-by-step Construction details.";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        ...imageParts,
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: techPackSchema,
      systemInstruction: systemInstruction
    }
  });

  const text = response.text;
  if (!text) throw new Error("No analysis returned");
  
  const data = JSON.parse(text) as TechPackData;

  if (!data.colorways) {
    data.colorways = [
      { name: data.colorWay || 'Standard', code: '#1D1D1F' }
    ];
  }

  if (!data.palette) {
      data.palette = [
          { name: data.colorWay || 'Base', hex: '#1D1D1F', pantone: '19-0000 TCX' }
      ];
  }

  if (data.graphics) {
      data.graphics = data.graphics.map((g, i) => ({ ...g, id: `g-${i}` }));
  }

  if (data.labels) {
      data.labels = data.labels.map((l, i) => ({ ...l, id: `lbl-${i}` }));
  } else {
      data.labels = [
          { id: 'lbl-1', type: 'Main Label', material: 'Woven Satin', dimensions: '40x60mm', placement: 'Center Back Neck' },
          { id: 'lbl-2', type: 'Care Label', material: 'Printed Satin', dimensions: '30x80mm', placement: 'Inner Left Side Seam, 10cm from hem' },
          { id: 'lbl-3', type: 'Size Pip', material: 'Woven', dimensions: '10x10mm', placement: 'Center Back Neck, under main label' }
      ];
  }

  if (data.packaging) {
      data.packaging = data.packaging.map((p, i) => ({ ...p, id: `pkg-${i}` }));
  } else {
      data.packaging = [
          { id: 'pkg-1', type: 'Hangtag', description: 'Brand standard heavyweight card', material: 'Recycled Paper 400gsm', dimensions: '50x100mm' },
          { id: 'pkg-2', type: 'Polybag', description: 'Self-adhesive with size sticker', material: 'Recycled LDPE', dimensions: 'Standard' }
      ];
  }

  data.referenceImages = [];

  return data;
};

export const generateTechnicalSketch = async (prompt: string, referenceImage?: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  const getParts = (includeImage: boolean) => {
      const parts: any[] = [];
      if (includeImage && referenceImage) {
          const cleanBase64 = referenceImage.includes('base64,') ? referenceImage.split('base64,')[1] : referenceImage;
          parts.push({ inlineData: { mimeType: "image/jpeg", data: cleanBase64 } });
          parts.push({ text: "Reference Image: Adhere to the silhouette and proportions of this image." });
      }
      return parts;
  };

  const enhancedPrompt = `
  Create a Technical Fashion Flat Sketch (Vector Line Art).
  - Subject: ${prompt}
  - Style: Technical black and white line drawing. No shading, no fill, pure white background.
  - View: Flat, symmetrical, professional CAD style.
  `;

  // Attempt 1: With Reference Image
  try {
      // Default to Flash model for sketches as it's faster and less strict on person-safety triggers
      const response = await generateImageWithFallback(ai, enhancedPrompt, getParts(true), '2K', '1:1', false);
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
      }
  } catch (e) {
      console.warn("Sketch generation with reference failed, retrying text only...", e);
      await delay(1000);
  }

  // Attempt 2: Text Only (Fallback)
  try {
      const response = await generateImageWithFallback(ai, enhancedPrompt, [], '2K', '1:1', false);
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
      }
  } catch (e) {
      console.error("Sketch generation failed completely", e);
      throw e;
  }
  
  throw new Error("No image generated");
};

export const recreateGraphic = async (description: string, technique: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Graphic Design Asset: ${description}. Style: Professional vector graphic for clothing (${technique}). White background. High contrast.`;
    
    const response = await generateImageWithFallback(ai, prompt, [], '1K', '1:1', false);
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }
    return '';
};

export const generateRealisticMockup = async (data: TechPackData, sketchBase64?: string | null): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    
    const parts: any[] = [];
    
    if (sketchBase64) {
        const cleanBase64 = sketchBase64.includes('base64,') ? sketchBase64.split('base64,')[1] : sketchBase64;
        parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64 } });
        parts.push({ text: "Use this sketch as structural reference." });
    }

    const prompt = `
    Fashion Product Photography.
    Item: ${data.styleName} - ${data.description}.
    Color: ${data.colorWay}. Material: ${data.fabrication}.
    Style: High-end e-commerce flat lay, white background, soft lighting, 4k.
    `;
    
    // Prefer Pro for high quality mockups
    const response = await generateImageWithFallback(ai, prompt, parts, '2K', '1:1', true);
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }
    throw new Error("No mockup generated");
};

export const vectorizeImage = async (base64Image: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: "image/png", data: base64Image } },
        { text: "Convert to SVG code. Black strokes, transparent background. Return only SVG string." }
      ]
    }
  });
  let svgCode = response.text || '';
  if (svgCode.includes('```')) svgCode = svgCode.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '');
  return svgCode.trim();
};

export const generateVirtualTryOn = async (modelImageBase64: string, garmentDescription: string, garmentImageBase64?: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });

    const parts: any[] = [];
    
    const cleanModel = modelImageBase64.includes('base64,') ? modelImageBase64.split('base64,')[1] : modelImageBase64;
    parts.push({ inlineData: { mimeType: "image/jpeg", data: cleanModel } });

    if (garmentImageBase64) {
        const cleanGarment = garmentImageBase64.includes('base64,') ? garmentImageBase64.split('base64,')[1] : garmentImageBase64;
        parts.push({ inlineData: { mimeType: "image/png", data: cleanGarment } });
    }

    const prompt = `
    Virtual Try-On Task: Model + Garment.
    Garment Description: ${garmentDescription}
    Generate a photo of the model wearing the garment. Keep identity and pose.
    `;

    const response = await generateImageWithFallback(ai, prompt, parts, '2K', '3:4', true);
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }
    throw new Error("No try-on image generated");
};

export const createTechPackChat = (techData?: TechPackData | null): Chat => {
    const apiKey = process.env.API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey || '' });
    let systemPrompt = "You are an expert Technical Fashion Designer.";
    if (techData) systemPrompt += ` Context: Style ${techData.styleName}, ${techData.description}`;
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: systemPrompt }
    });
};

export const modifyTechPack = async (currentData: TechPackData, userInstruction: string): Promise<TechPackData> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });

    const cleanData = stripImagesFromData(currentData);

    const prompt = `
    Current Tech Pack Data: ${JSON.stringify(cleanData)}
    User Instruction: "${userInstruction}"
    Task: Update measurements, BOM, construction, and sketch prompts to reflect the changes.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: techPackSchema
        }
    });

    return JSON.parse(response.text!) as TechPackData;
};

export const translateTechPack = async (data: TechPackData, targetLanguage: string): Promise<TechPackData> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });

    const cleanData = stripImagesFromData(data);

    const prompt = `Translate descriptive fields to ${targetLanguage}. Data: ${JSON.stringify(cleanData)}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: techPackSchema
        }
    });

    return JSON.parse(response.text!) as TechPackData;
};

export const generateFitComments = async (data: TechPackData): Promise<string> => {
    return "Feature pending implementation.";
};
