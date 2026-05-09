import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Project = {
  id: string;
  name: string;
  type?: string;
  location?: string;
  scope?: string;
  crewAssigned?: string;
  createdAt: number;
};

export type SavedCalculation = {
  id: string;
  projectId: string | null;
  calculatorKey: string;
  title: string;
  date: number;
  result: any;
};

export type KnowledgeItem = {
  id: string;
  projectId: string | null;
  title: string;
  content: string;
  mimeType: string;
  createdAt: number;
};

type AppState = {
  activeProjectId: string | null;
  favoriteCalculators: string[];
  recentCalculators: string[];
  projects: Project[];
  savedCalculations: SavedCalculation[];
  knowledgeBase: KnowledgeItem[];
  preferences: {
    units: 'imperial' | 'metric';
    fractionDenominator: number;
    defaultStudSpacingIn: number;
    defaultWastePercent: number;
    stairMaxRiser: number;
    stairMinTread: number;
    stairTargetRiser: number;
    stairTargetTread: number;
    defaultProjectType?: string;
    defaultCrewAssigned?: string;
    aiVoice?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
    jobsiteBackground?: string | null;
  };
  setActiveProject: (id: string | null) => void;
  addProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  addKnowledgeItem: (item: KnowledgeItem) => void;
  deleteKnowledgeItem: (id: string) => void;
  saveCalculation: (calc: SavedCalculation) => void;
  removeCalculation: (id: string) => void;
  addFavoriteCalculator: (key: string) => void;
  removeFavoriteCalculator: (key: string) => void;
  addRecentCalculator: (key: string) => void;
  updatePreferences: (prefs: Partial<AppState['preferences']>) => void;
};

const defaultFiles = import.meta.glob('../data/knowledge/*.(md|txt|json)', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

let initialKnowledge: KnowledgeItem[] = [];
Object.entries(defaultFiles).forEach(([path, content]) => {
  const fileName = path.split('/').pop() || 'Untitled';
  initialKnowledge.push({
    id: `default-${fileName}`,
    projectId: null,
    title: fileName,
    mimeType: fileName.endsWith('.json') ? 'application/json' : 'text/markdown',
    content: content,
    createdAt: Date.now()
  });
});

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeProjectId: null,
      favoriteCalculators: [],
      recentCalculators: [],
      projects: [],
      savedCalculations: [],
      knowledgeBase: initialKnowledge,
      preferences: {
        units: 'imperial',
        fractionDenominator: 16,
        defaultStudSpacingIn: 16,
        defaultWastePercent: 10,
        stairMaxRiser: 7.75,
        stairMinTread: 10,
        stairTargetRiser: 7.5,
        stairTargetTread: 10.5,
        defaultProjectType: 'Residential',
        defaultCrewAssigned: '',
        aiVoice: 'Zephyr',
        jobsiteBackground: null,
      },
      setActiveProject: (id) => set({ activeProjectId: id }),
      addProject: (p) => set((state) => ({ projects: [p, ...state.projects] })),
      deleteProject: (id) => set((state) => ({ 
        projects: state.projects.filter(p => p.id !== id),
        activeProjectId: state.activeProjectId === id ? null : state.activeProjectId
      })),
      addKnowledgeItem: (item) => set((state) => ({ knowledgeBase: [item, ...state.knowledgeBase] })),
      deleteKnowledgeItem: (id) => set((state) => ({ knowledgeBase: state.knowledgeBase.filter(i => i.id !== id) })),
      saveCalculation: (calc) => set((state) => ({ savedCalculations: [calc, ...state.savedCalculations] })),
      removeCalculation: (id) => set((state) => ({ savedCalculations: state.savedCalculations.filter(c => c.id !== id) })),
      addFavoriteCalculator: (key) => set((state) => ({
        favoriteCalculators: state.favoriteCalculators.includes(key)
          ? state.favoriteCalculators
          : [...state.favoriteCalculators, key]
      })),
      removeFavoriteCalculator: (key) => set((state) => ({
        favoriteCalculators: state.favoriteCalculators.filter(k => k !== key)
      })),
      addRecentCalculator: (key) => set((state) => {
        const recent = [key, ...state.recentCalculators.filter(k => k !== key)].slice(0, 5);
        return { recentCalculators: recent };
      }),
      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
    }),
    {
      name: 'construction-companion-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        const state = persistedState as AppState;
        if (version === 0) {
          const existingTitles = new Set(state.knowledgeBase?.map(k => k.title) || []);
          const mergedKnowledge = [...(state.knowledgeBase || [])];
          
          Object.entries(defaultFiles).forEach(([path, content]) => {
            const fileName = path.split('/').pop() || 'Untitled';
            if (!existingTitles.has(fileName)) {
              mergedKnowledge.push({
                id: `default-${fileName}`,
                projectId: null,
                title: fileName,
                mimeType: fileName.endsWith('.json') ? 'application/json' : 'text/markdown',
                content: content,
                createdAt: Date.now()
              });
            }
          });
          
          state.knowledgeBase = mergedKnowledge;
        }
        return state;
      }
    }
  )
);

