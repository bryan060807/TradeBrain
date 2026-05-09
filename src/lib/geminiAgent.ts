import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentParameters } from '@google/genai';

let ai: GoogleGenAI | null = null;

export function getAi() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

const openCalculatorDecl: FunctionDeclaration = {
  name: "openCalculator",
  description: "Navigate to a specific calculator. Available keys: 'stairRiseRun' (for stairs/steps).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      calculatorKey: { type: Type.STRING, description: "The calculator ID, e.g., 'stairRiseRun'" }
    },
    required: ["calculatorKey"]
  }
};

const createProjectDecl: FunctionDeclaration = {
  name: "createProject",
  description: "Start a new project. Can inject address/location and scope if provided.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Name of the project" },
      location: { type: Type.STRING, description: "Physical address of the project if provided" },
      scope: { type: Type.STRING, description: "Broad operational scope" },
      crewAssigned: { type: Type.STRING, description: "Assigned crew if mentioned" },
      type: { type: Type.STRING, description: "Category/type of project if mentioned (Residential, Commercial, etc)" },
    },
    required: ["name"]
  }
};

const changeSettingsDecl: FunctionDeclaration = {
  name: "changeSettings",
  description: "Change default calculation parameters globally.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      defaultStudSpacingIn: { type: Type.NUMBER },
      defaultWastePercent: { type: Type.NUMBER },
      stairTargetRiser: { type: Type.NUMBER },
      stairTargetTread: { type: Type.NUMBER }
    }
  }
};

const executeActionDecl: FunctionDeclaration = {
  name: "executeAction",
  description: "Execute a generic action on the current page, like 'calculate', 'save', 'export_pdf'",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, enum: ["calculate", "save", "export_pdf", "navigate_projects", "navigate_settings", "navigate_home"] }
    },
    required: ["action"]
  }
};

const replyToUserDecl: FunctionDeclaration = {
  name: "replyToUser",
  description: "Respond to the user to clarify intent, confirm an action, or list available commands if requested. The message will be spoken aloud to the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      message: { type: Type.STRING, description: "The text to speak back to the user." }
    },
    required: ["message"]
  }
};

const tools = [{
  functionDeclarations: [
    openCalculatorDecl,
    createProjectDecl,
    changeSettingsDecl,
    executeActionDecl,
    replyToUserDecl
  ]
}];

export async function handleVoiceCommandWithGemini(
  transcript: string, 
  context: any
): Promise<any[]> {
  try {
    const prompt = `You are a voice assistant in a construction/calculation application.
Current User Context:
${JSON.stringify(context, null, 2)}

User uttered: "${transcript}"

Determine the user's intent. You can execute multiple functions if needed.
If the command is clear, execute the corresponding function(s) and then use replyToUser to confirm (keep text under 100 chars).
If the command is ambiguous or the user asks for help, use replyToUser to ask a clarifying question or list available commands in a brief conversational way.
Keep all spoken responses concise and natural.
Available commands generally include: opening calculators (like stair calculator), starting projects with addresses, changing calculation defaults, running calculations, saving data, and exporting PDFs.
`;

    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools,
      }
    });

    const calls = response.functionCalls || [];
    
    // Also parse normal text response as a reply if they don't explicitly use replyToUser
    const textResp = response.text;
    
    return calls.map(c => ({
      name: c.name,
      args: c.args
    })).concat(textResp && textResp.trim() && !calls.find(c => c.name === 'replyToUser') ? [
      { name: 'replyToUser', args: { message: textResp.trim() } }
    ] : []);
  } catch (error: any) {
    console.error("Gemini Error: ", error);
    if (error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("API key not valid")) {
      return [{ name: "replyToUser", args: { message: "Your Gemini API key is invalid or expired. Please configure a valid API key in the AI Studio Secrets panel." } }];
    } else if (error?.status === 403 || error?.message?.includes("insufficient authentication scopes")) {
      return [{ name: "replyToUser", args: { message: "Your Gemini API key is missing. Please configure your API key in the AI Studio Secrets panel." } }];
    }
    return [{ name: "replyToUser", args: { message: `I encountered an error: ${error.message || String(error)}` } }];
  }
}
