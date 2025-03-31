import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { initGoogleCloudConfig } from '../../../../service-account-config';

// Define types for our data structures
interface Material {
  type: string;
  totalLength: string;
  withWaste: string;
}

interface Piece {
  type: string;
  length: string;
  quantity: number;
  pattern: string;
}

interface RequestBody {
  mouldingType: string;
  dimensions: {
    width: number;
    height: number;
  };
  patternRepeats: {
    horizontal: number;
    vertical: number;
  };
  materials?: Material[];
  pieces?: Piece[];
}

// Initialize Google Cloud configuration before making any API calls
initGoogleCloudConfig();

// This function securely processes the request to generate instructions
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json() as RequestBody;
    const { mouldingType, dimensions, patternRepeats, materials, pieces } = body;

    // Validate the input
    if (!mouldingType || !dimensions || !patternRepeats) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Set up Vertex AI with credentials from environment variables
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    // Initialize Vertex with credentials from env vars
    const vertexAI = new VertexAI({
      project: projectId,
      location: location,
    });

    // Select the model
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite-001',
    });

    // Format materials list for the prompt
    let materialsList = '';
    if (materials && materials.length > 0) {
      materialsList = materials.map((m: Material) => 
        `${(parseFloat(m.withWaste) / 12).toFixed(1)} feet of ${m.type} moulding`
      ).join(', ');
    }

    // Format pieces list for detailed cutting instructions
    let piecesList = '';
    if (pieces && pieces.length > 0) {
      piecesList = pieces.map((p: Piece) => 
        `${p.quantity} × ${p.type} pieces at ${p.length}" each for ${p.pattern}`
      ).join('\n');
    }

    // Craft the prompt based on the provided wall configuration
    const prompt = `
    You are a professional interior designer specializing in accent walls and decorative moulding. 
    
    Generate detailed step-by-step installation instructions for an accent wall with the following specifications:
    
    ## WALL SPECIFICATIONS
    - Wall dimensions: ${dimensions.width}ft × ${dimensions.height}ft
    - Moulding type: ${mouldingType}
    - Pattern: ${patternRepeats.horizontal} × ${patternRepeats.vertical} repeats
    ${materialsList ? `- Materials needed: ${materialsList}` : ''}
    
    ## CUTTING LIST
    ${piecesList}
    
    ## INSTRUCTIONS REQUIREMENTS
    Generate comprehensive instructions covering:
    1. Required tools list
    2. Preparation steps (measuring, marking the wall)
    3. Precise measurement and cutting instructions
    4. Step-by-step installation process specific to this ${mouldingType} pattern type
    5. Tips for achieving professional results
    6. Finishing instructions (filling nail holes, painting)
    
    Format the response with clear section headings, numbered steps, and be specific to this exact wall configuration.
    Keep the tone helpful and explain WHY certain techniques work better than others.
    `;

    // Generate the completion
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    
    // Access the text content properly with optional chaining
    const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No instructions generated.';
    
    // Return the generated instructions
    return NextResponse.json({ instructions: responseText });
  } catch (error) {
    console.error('Error generating instructions:', error);
    return NextResponse.json(
      { error: 'Failed to generate instructions' },
      { status: 500 }
    );
  }
} 