import { useState, useRef, useEffect, useCallback } from 'react';
import { getAi } from '../lib/geminiAgent';
import { LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { float32To16BitPCM, base64EncodeAudio, AudioStreamStreamer } from '../lib/audioUtils';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { CALCULATORS_REGISTRY } from '../lib/calculators/registry';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Define the voice name to use
type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export function useLiveAgent() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [userTranscript, setUserTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<any>(null);
  const audioStreamerRef = useRef<AudioStreamStreamer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const { preferences, addProject, updatePreferences, activeProjectId, knowledgeBase, savedCalculations, user, projects } = useAppStore();
  const navigate = useNavigate();

  const selectedVoice = preferences.aiVoice || 'Zephyr';

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    setError(null);
    try {
      const ai = getAi();
      
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.message?.includes('not allowed by the user agent')) {
          throw new Error("Microphone access is blocked. Please open the app in a new tab (click the ↗️ icon) to use Voice Assistant.");
        }
        if (err.name === 'NotFoundError' || err.message?.includes('The object can not be found')) {
          throw new Error("No microphone found. Please connect a microphone to use Voice Assistant.");
        }
        throw err;
      }
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      
      audioStreamerRef.current = new AudioStreamStreamer(24000);

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

      // Build function declarations
      const openCalculatorDecl: FunctionDeclaration = {
        name: "openCalculator",
        description: "Open a specific calculator mode",
        parameters: {
          type: Type.OBJECT,
          properties: {
            calculatorKey: { type: Type.STRING, description: "The key of the calculator, e.g. stairRiseRun" }
          },
          required: ["calculatorKey"]
        }
      };

      const createProjectDecl: FunctionDeclaration = {
        name: "createProject",
        description: "Create a new construction project",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the project" },
            location: { type: Type.STRING },
            scope: { type: Type.STRING },
            crewAssigned: { type: Type.STRING },
            type: { type: Type.STRING }
          },
          required: ["name"]
        }
      };
      
      const changeSettingsDecl: FunctionDeclaration = {
        name: "changeSettings",
        description: "Change application preferences",
        parameters: {
          type: Type.OBJECT,
          properties: {
            units: { type: Type.STRING, description: "imperial or metric" },
            defaultWastePercent: { type: Type.NUMBER }
          }
        }
      };
      
      const executeActionDecl: FunctionDeclaration = {
        name: "executeAction",
        description: "Execute a generic action in the UI, like saving, computing, generating PDF, or navigating.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: "One of: calculate, save, export_pdf, navigate_projects, navigate_settings, navigate_home" }
          },
          required: ["action"]
        }
      };

      const searchKnowledgeBankDecl: FunctionDeclaration = {
        name: "searchKnowledgeBank",
        description: "Search the local knowledge bank (documents, plans, references)",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "The search query" }
          },
          required: ["query"]
        }
      };

      const postMessageDecl: FunctionDeclaration = {
        name: "postMessage",
        description: "Post a message to the company-wide chat or message board",
        parameters: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The content of the message" }
          },
          required: ["text"]
        }
      };

      const systemInstruction = `You are 'TradeBrain Intelligence', a highly sophisticated and responsive AI Construction Foreman.
Your primary directive is to provide mission-critical construction support and field intelligence.
Identity: You are the digital backbone of the jobsite. Your tone is professional, technical, authoritative, and efficient.
Operational Context:
- Active Project: ${activeProject?.name || 'Global Ops'}
- Current Foreman: ${user?.displayName} (Role: ${user?.role})
- Safety Protocol: Always prioritize structural integrity and local code compliance.

Capabilities:
1. Mathematical Execution: You can trigger specialized calculators for stairs, rafters, joists, etc.
2. Knowledge Retrieval: You have access to ${knowledgeBase.length} site-specific blueprints and documents.
3. Site Coordination: You can post messages to the company board to alert crew members.
4. Logistics: You can create projects and update system baselines.

Guidelines:
- Be concise. Site workers need answers fast.
- If a calculation is requested, confirm the inputs and trigger the 'executeAction' tool with 'calculate'.
- Always check the knowledge base if a user asks about site-specific plans.
- If the user asks for a 'share link' or 'public access', inform them that the application is a secure enterprise portal available at its current URL.
- Maintain a 'Real-World First' mindset. Your advice should be practical for a physical construction environment.
`;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview", // Required model for Live API
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
          },
          systemInstruction,
          tools: [
            { googleSearch: {} },
            { functionDeclarations: [
              openCalculatorDecl, 
              createProjectDecl, 
              changeSettingsDecl, 
              executeActionDecl, 
              searchKnowledgeBankDecl,
              postMessageDecl
            ] }
          ],
          inputAudioTranscription: {  },
          outputAudioTranscription: {  }
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = float32To16BitPCM(inputData);
              const base64Data = base64EncodeAudio(pcm16);
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            disconnect();
          },
          onclose: () => {
            disconnect();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) {
              audioStreamerRef.current?.stop();
            }

            const modelTurn = message.serverContent?.modelTurn;
            if (modelTurn) {
              for (const part of modelTurn.parts) {
                if (part.inlineData && part.inlineData.data) {
                  audioStreamerRef.current?.playBase64(part.inlineData.data);
                }
                if (part.text) {
                   setAgentResponse(prev => (prev ? prev + " " + part.text : part.text));
                }
              }
            }

            // Handle tool calls
            const toolCalls = message.toolCall?.functionCalls;
            if (toolCalls && toolCalls.length > 0) {
              const functionResponses = [];
              for (const call of toolCalls) {
                let responseData = {};
                try {
                  const args = call.args as any;
                  if (call.name === 'openCalculator') {
                    navigate(`/calculators/${args.calculatorKey}`);
                    responseData = { success: true };
                  } else if (call.name === 'createProject') {
                    const newId = crypto.randomUUID();
                    addProject({
                      id: newId,
                      name: args.name,
                      location: args.location || '',
                      scope: args.scope || '',
                      crewAssigned: args.crewAssigned || preferences.defaultCrewAssigned || '',
                      type: args.type || preferences.defaultProjectType || 'Residential',
                      createdAt: Date.now()
                    });
                    useAppStore.getState().setActiveProject(newId);
                    navigate('/projects');
                    responseData = { success: true, projectId: newId };
                  } else if (call.name === 'changeSettings') {
                    updatePreferences(args);
                    navigate('/settings');
                    responseData = { success: true };
                  } else if (call.name === 'executeAction') {
                    if (args.action === 'calculate') window.dispatchEvent(new Event('voice-calculate'));
                    else if (args.action === 'save') window.dispatchEvent(new Event('voice-save'));
                    else if (args.action === 'export_pdf') window.dispatchEvent(new Event('voice-export-pdf'));
                    else if (args.action === 'navigate_projects') navigate('/projects');
                    else if (args.action === 'navigate_settings') navigate('/settings');
                    else if (args.action === 'navigate_home') navigate('/');
                    else if (args.action === 'navigate_inventory') navigate('/inventory');
                    else if (args.action === 'navigate_punch_lists') navigate('/punch-lists');
                    else if (args.action === 'navigate_reports') navigate('/reports');
                    responseData = { success: true };
                  } else if (call.name === 'searchKnowledgeBank') {
                    const query = args.query.toLowerCase();
                    const kBase = useAppStore.getState().knowledgeBase;
                    const results = kBase.filter(k => k.title.toLowerCase().includes(query) || k.content.toLowerCase().includes(query))
                                        .map(k => ({ title: k.title, content: k.content.substring(0, 500) })); // Return chunk
                    responseData = { results: results.length > 0 ? results : "No documents found matching the query." };
                  } else if (call.name === 'postMessage') {
                    if (user) {
                      await addDoc(collection(db, 'messages'), {
                        text: args.text,
                        senderId: user.uid,
                        senderName: user.displayName,
                        senderRole: user.role,
                        createdAt: serverTimestamp()
                      });
                      responseData = { success: true };
                    } else {
                      responseData = { error: "User not authenticated" };
                    }
                  }
                } catch (err: any) {
                  responseData = { error: err?.message || err || "Unknown error" };
                }
                functionResponses.push({
                   id: call.id,
                   name: call.name,
                   response: responseData
                });
              }
              
              if (functionResponses.length > 0) {
                 sessionPromise.then(session => {
                    session.sendToolResponse({ functionResponses });
                 });
              }
            }

            // Handle Transcriptions
            // TODO handle transcriptions for UI display
            // Let's clear the prompt text after some time or accumulate it?
          }
        }
      });
      sessionRef.current = await sessionPromise;
      
    } catch (err: any) {
      console.error("Failed to start live session:", err);
      setError(err?.message || "Failed to start live session. Please check microphone permissions.");
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [isConnected, isConnecting, activeProjectId, preferences, knowledgeBase, selectedVoice, navigate, addProject, updatePreferences, user, projects]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setIsConnecting(false);
    if (sessionRef.current) {
      // LiveConnectSession usually has close? Or maybe just let it be GC'd?
      // According to sdk, no strict close is mentioned, just ignore. Actually, the documentation says `session.close()`!
      (sessionRef.current as any).close?.();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioStreamerRef.current) {
      audioStreamerRef.current.close();
      audioStreamerRef.current = null;
    }
    setAgentResponse(null);
  }, []);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    agentResponse,
    clearAgentResponse: () => setAgentResponse(null),
    userTranscript,
    error,
    clearError: () => setError(null)
  };
}
