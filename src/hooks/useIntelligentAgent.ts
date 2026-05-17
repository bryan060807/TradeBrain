import { useState, useCallback } from 'react';
import { handleVoiceCommandWithGemini } from '../lib/geminiAgent';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { CALCULATORS_REGISTRY } from '../lib/calculators/registry';

export function useIntelligentAgent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  
  const { preferences, addProject, updatePreferences, activeProjectId } = useAppStore();
  const navigate = useNavigate();

  const processTranscript = useCallback(async (transcript: string) => {
    setIsProcessing(true);
    setAgentResponse(null);
    
    try {
      const context = {
        preferences,
        activeProjectId,
        projects: useAppStore.getState().projects.map(p => p.name),
        calculatorKeys: ['stairRiseRun', ...Object.keys(CALCULATORS_REGISTRY)],
        currentPath: window.location.pathname
      };
      
      const calls = await handleVoiceCommandWithGemini(transcript, context);
      
      for (const call of calls) {
        if (call.name === 'openCalculator') {
          navigate(`/calculators/${call.args.calculatorKey}`);
        } else if (call.name === 'createProject') {
          const newId = crypto.randomUUID();
          addProject({
            id: newId,
            name: call.args.name,
            location: call.args.location || '',
            scope: call.args.scope || '',
            crewAssigned: call.args.crewAssigned || preferences.defaultCrewAssigned || '',
            type: call.args.type || preferences.defaultProjectType || 'Residential',
            createdAt: Date.now()
          });
          useAppStore.getState().setActiveProject(newId);
          navigate('/projects');
        } else if (call.name === 'changeSettings') {
          updatePreferences(call.args);
          navigate('/settings');
        } else if (call.name === 'executeAction') {
          if (call.args.action === 'calculate') window.dispatchEvent(new Event('voice-calculate'));
          else if (call.args.action === 'save') window.dispatchEvent(new Event('voice-save'));
          else if (call.args.action === 'export_pdf') window.dispatchEvent(new Event('voice-export-pdf'));
          else if (call.args.action === 'navigate_projects') navigate('/projects');
          else if (call.args.action === 'navigate_settings') navigate('/settings');
          else if (call.args.action === 'navigate_home') navigate('/');
          else if (call.args.action === 'navigate_inventory') navigate('/inventory');
          else if (call.args.action === 'navigate_punch_lists') navigate('/punch-lists');
          else if (call.args.action === 'navigate_reports') navigate('/reports');
          else if (call.args.action === 'navigate_tracker') navigate('/tracker');
          else if (call.args.action === 'navigate_audits') navigate('/audits');
          else if (call.args.action === 'navigate_safety') navigate('/safety-briefings');
          else if (call.args.action === 'navigate_rfis') navigate('/rfis');
          else if (call.args.action === 'navigate_menu') navigate('/menu');
        } else if (call.name === 'replyToUser') {
          setAgentResponse(call.args.message);
          
          // use TTS to speak to user
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(call.args.message);
            window.speechSynthesis.speak(utterance);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }, [preferences, addProject, updatePreferences, activeProjectId, navigate]);

  return {
    processTranscript,
    isProcessing,
    agentResponse,
    setAgentResponse
  };
}
