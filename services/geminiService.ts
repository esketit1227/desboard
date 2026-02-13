
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

// Helper to generate image with model fallback
const generateImageWithFallback = async (ai: GoogleGenAI, prompt: string, extraParts: any[] = [], width: '1K' | '2K' = '1K', aspectRatio: '1:1' | '3:4' = '1:1') => {
    try {
        // Try the Pro model first
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [...extraParts, { text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: width
                }
            }
        });
        return response;
    } catch (e: any) {
        // Check for permission denied or 403 errors
        if (e.message?.includes('403') || e.message?.includes('PERMISSION_DENIED') || e.toString().includes('permission')) {
            console.warn("Falling back to gemini-2.5-flash-image due to permission error");
            // Fallback to Flash Image model
            // Note: Flash image does not support imageSize config, only aspectRatio
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [...extraParts, { text: prompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio
                    }
                }
            });
            return response;
        }
        throw e;
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
    : "Analyze these garment images. Generate a professional Tech Pack. Extract 3-5 key colors with Pantone codes. Extract labels/packaging. Estimate precise measurements for a Size M. Include prompts for Front, Back, and Side sketches.";

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

  // Ensure palette exists
  if (!data.palette) {
      data.palette = [
          { name: data.colorWay || 'Base', hex: '#1D1D1F', pantone: '19-0000 TCX' }
      ];
  }

  if (data.graphics) {
      data.graphics = data.graphics.map((g, i) => ({ ...g, id: `g-${i}` }));
  }

  // Ensure labels and packaging arrays exist with ids
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

  // Initialize reference images
  data.referenceImages = [];

  return data;
};

export const generateRandomTechPack = async (): Promise<TechPackData> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });

    // Pick 6 random keywords for greater variety and complexity
    const shuffled = LUCKY_KEYWORDS.sort(() => 0.5 - Math.random());
    const selectedKeywords = shuffled.slice(0, 6).join(", ");

    const prompt = `
    Act as a high-fashion Creative Director.
    Invent a unique, cutting-edge garment design based on these themes: ${selectedKeywords}.
    
    The design should be stylish, street-wear / high fashion appropriate.
    Think: Avant-garde, deconstructed, luxury, bold silhouettes.
    
    Generate a full Tech Pack JSON for this invented garment.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: techPackSchema,
            systemInstruction: "You are a visionary fashion designer. Create complete, detailed manufacturing specifications for a new garment design."
        }
    });

    const data = JSON.parse(response.text!) as TechPackData;
    
    // Ensure arrays are initialized
    if (!data.colorways) data.colorways = [{ name: data.colorWay || 'Base', code: '#000000' }];
    if (!data.palette) data.palette = [{ name: 'Base', hex: '#000000', pantone: '19-0000 TCX' }];
    if (!data.labels) data.labels = [];
    if (!data.packaging) data.packaging = [];
    if (!data.graphics) data.graphics = [];
    data.referenceImages = [];

    // Add IDs
    if (data.graphics) data.graphics = data.graphics.map((g, i) => ({ ...g, id: `g-${i}` }));
    if (data.labels) data.labels = data.labels.map((l, i) => ({ ...l, id: `lbl-${i}` }));
    if (data.packaging) data.packaging = data.packaging.map((p, i) => ({ ...p, id: `pkg-${i}` }));

    return data;
};

export const modifyTechPack = async (currentData: TechPackData, userInstruction: string): Promise<TechPackData> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });

    // Use stripped data to save tokens
    const cleanData = stripImagesFromData(currentData);

    const prompt = `
    Current Tech Pack Data: ${JSON.stringify(cleanData)}
    
    User Instruction for Modification: "${userInstruction}"
    
    Task: Update the Tech Pack data to reflect this modification. 
    1. Adjust measurements if the silhouette changes (e.g. 'crop it' -> shorter body length).
    2. Update BOM if materials change (e.g. 'add zipper').
    3. Update Construction details.
    4. CRITICAL: Update the 'sketchPrompts.front', 'sketchPrompts.back', and 'sketchPrompts.side' to describe the NEW look visually so we can regenerate sketches. KEEP THEM BLANK/PLAIN.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: techPackSchema,
            systemInstruction: "You are an intelligent design assistant. Modify the tech pack JSON structure to perfectly match the user's design change request."
        }
    });

    return JSON.parse(response.text!) as TechPackData;
};

export const translateTechPack = async (data: TechPackData, targetLanguage: string): Promise<TechPackData> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });

    const cleanData = stripImagesFromData(data);

    const prompt = `Translate the descriptive fields of this Tech Pack into ${targetLanguage}. 
    Keep technical codes (like 'HPS', 'GSM') in English if that is the industry standard for that region, otherwise translate.
    Translate: Style Name, Description, Fabrication, Colorway, Measurement Descriptions, BOM Item/Descriptions, Construction Instructions, Palette Names, Label/Packaging descriptions.
    
    Data: ${JSON.stringify(cleanData)}`;

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
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });

    const cleanData = stripImagesFromData(data);

    const prompt = `
    Analyze the measurements of this garment sample compared to the spec.
    Measurements Data: ${JSON.stringify(data.measurements)}
    
    Task: Write professional technical fit comments to the factory.
    1. Identify points of measure that failed (Variance > Tolerance).
    2. Suggest specific pattern corrections (e.g., "Relax tension at armhole", "Increase grading at hip").
    3. Tone should be professional, direct, and constructive.
    4. Return ONLY the comments as a structured string.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] }
    });

    return response.text || "No comments generated.";
};

export const generateTechnicalSketch = async (prompt: string, referenceImage?: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];
  if (referenceImage) {
      const cleanBase64 = referenceImage.includes('base64,') ? referenceImage.split('base64,')[1] : referenceImage;
      parts.push({ inlineData: { mimeType: "image/jpeg", data: cleanBase64 } });
      parts.push({ text: "Reference Image: Use the structure, silhouette, and proportions of this image EXACTLY. Do not hallucinate features. Convert this photo into a technical flat sketch." });
  }

  // STRICTLY ENFORCED BLANK TEMPLATE STYLE FOR ACCURATE TRACING
  const enhancedPrompt = `
  Task: Create a Precise Technical Fashion Flat Sketch (CAD) by TRACING the structure of the reference image (if provided) or adhering strictly to the description.
  Style: 2D Vector-style line art. Strict Black and White. Uniform line weight (1.5px).
  
  CRITICAL RULES:
  1. ACCURACY: Trace the silhouette, cut lines, pockets, and seams EXACTLY as they appear in the reference image/description. Do not distort proportions.
  2. NO FILL: The garment body must be SOLID WHITE. No grey fills, no shading, no drop shadows.
  3. CLEAN: No logos, no prints, no graphics, no text annotations. Just the structural lines.
  4. SYMMETRY: Ensure the garment looks symmetrical and laid flat.
  
  Description: ${prompt}
  `;

  // Use helper with fallback
  // We include parts (which might have the image) in the extraParts argument
  const response = await generateImageWithFallback(ai, enhancedPrompt, parts, '1K', '1:1');

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return part.inlineData.data;
  }
  
  // If we are here, maybe check if there is text explaining why
  const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
  if (textPart) {
      console.warn("Model returned text instead of image:", textPart.text);
  }
  
  throw new Error("No image generated");
};

export const recreateGraphic = async (description: string, technique: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Graphic Design Asset: ${description}. Style: Professional vector graphic for clothing (${technique}). White background. High contrast.`;
    
    // Use helper with fallback
    const response = await generateImageWithFallback(ai, prompt, [], '1K', '1:1');
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }
    return '';
};

export const generateRealisticMockup = async (data: TechPackData, sketchBase64?: string | null): Promise<string> => {
    // Instantiate new client to capture fresh API Key if set via dialog
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    
    const parts: any[] = [];
    
    if (sketchBase64) {
        // Ensure clean base64 string
        const cleanBase64 = sketchBase64.includes('base64,') ? sketchBase64.split('base64,')[1] : sketchBase64;
        parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64 } });
        parts.push({ text: "Use this technical sketch as the precise structural reference for the garment silhouette." });
    }

    const prompt = `
    Transform the input (if provided) or description into a professional, hyper-realistic flat lay product photograph.
    
    Product Details:
    - Item: ${data.styleName}
    - Color: ${data.colorWay}
    - Material/Texture: ${data.fabrication}
    - Description: ${data.description}
    
    Requirements:
    - High-end fashion e-commerce photography style.
    - Flat lay on a clean neutral white or concrete background.
    - Photorealistic fabric textures, folds, shadows, and studio lighting.
    - 4K Resolution.
    - NO text, NO watermarks, NO arrows/annotations from the sketch. Pure product image.
    `;
    
    // Use helper with fallback
    const response = await generateImageWithFallback(ai, prompt, parts, '2K', '1:1');
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }
    throw new Error("No mockup generated");
};

export const generateVirtualTryOn = async (modelImage: string, garmentDescription: string, garmentImage?: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [{ inlineData: { mimeType: "image/jpeg", data: modelImage } }];
    if (garmentImage) {
        const cleanGarment = garmentImage.includes('base64,') ? garmentImage.split('base64,')[1] : garmentImage;
        parts.push({ inlineData: { mimeType: "image/png", data: cleanGarment } });
    }
    
    const prompt = `Virtual Try-On. Model wearing described garment: ${garmentDescription}. Photorealistic, high fashion.`;

    // Use helper with fallback - Try-on benefits from 3:4 usually, but we fallback to what's available
    const response = await generateImageWithFallback(ai, prompt, parts, '2K', '3:4');

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }
    throw new Error("No try-on generated");
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

export const createTechPackChat = (techData?: TechPackData | null): Chat => {
    const apiKey = process.env.API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey || '' });
    let systemPrompt = "You are an expert Technical Fashion Designer.";
    if (techData) systemPrompt += ` Context: Style ${techData.styleName}, ${techData.description}`;
    return ai.chats.create({
        // Use flash for chat as it is more robust for general Q&A permissions
        model: 'gemini-2.5-flash',
        config: { systemInstruction: systemPrompt }
    });
};
