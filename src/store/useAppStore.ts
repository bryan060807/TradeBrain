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
  preferences?: {
    defaultStudSpacingIn?: number;
    defaultWastePercent?: number;
    stairMaxRiser?: number;
    stairMinTread?: number;
    stairTargetRiser?: number;
    stairTargetTread?: number;
  };
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

export type InventoryItem = {
  id: string;
  name: string;
  qrCode: string;
  location: string;
  assignedTo: string;
  status: 'In Stock' | 'In Use' | 'Maintenance' | 'Lost';
  createdAt: number;
};

export type PunchListItem = {
  id: string;
  projectId: string | null;
  title: string;
  description: string;
  photoUrl: string | null;
  markupData?: string; // Serialized drawing data
  status: 'Open' | 'In Progress' | 'Completed';
  assignedTo: string;
  deadline: number;
  createdAt: number;
};

export type DailyReport = {
  id: string;
  projectId: string | null;
  date: number;
  workCompleted: string;
  workerHours: number;
  materialsUsed: string;
  photoUrls: string[];
  ownerId: string;
  createdAt: number;
};

export type AuditItem = {
  item: string;
  pass: boolean | null;
  notes?: string;
};

export type Audit = {
  id: string;
  projectId: string;
  type: string;
  date: number;
  inspector: string;
  status: 'Draft' | 'Completed';
  checklist: AuditItem[];
  createdAt: number;
};

export type SafetyBriefing = {
  id: string;
  projectId: string | null;
  title: string;
  date: number;
  content: string;
  signatures: { name: string; signedAt: number }[];
  createdAt: number;
};

export type RFI = {
  id: string;
  projectId: string;
  number: string;
  title: string;
  question: string;
  proposedSolution?: string;
  status: 'Open' | 'In Review' | 'Answered' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  answer?: string;
  assignedTo?: string;
  createdAt: number;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  role: 'owner' | 'foreman' | 'laborer';
};

type AppState = {
  user: UserProfile | null;
  authLoading: boolean;
  activeProjectId: string | null;
  favoriteCalculators: string[];
  recentCalculators: string[];
  projects: Project[];
  savedCalculations: SavedCalculation[];
  knowledgeBase: KnowledgeItem[];
  inventory: InventoryItem[];
  punchLists: PunchListItem[];
  dailyReports: DailyReport[];
  audits: Audit[];
  safetyBriefings: SafetyBriefing[];
  rfis: RFI[];
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
    pinnedModules: string[];
  };
  setUser: (user: UserProfile | null) => void;
  updateUserRole: (role: UserProfile['role']) => void;
  setAuthLoading: (loading: boolean) => void;
  setProjects: (projects: Project[]) => void;
  setCalculations: (calcs: SavedCalculation[]) => void;
  setKnowledge: (items: KnowledgeItem[]) => void;
  setInventory: (items: InventoryItem[]) => void;
  setPunchLists: (items: PunchListItem[]) => void;
  setDailyReports: (items: DailyReport[]) => void;
  setAudits: (items: Audit[]) => void;
  setSafetyBriefings: (items: SafetyBriefing[]) => void;
  setRfis: (items: RFI[]) => void;
  setActiveProject: (id: string | null) => void;
  addProject: (p: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
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
      user: null,
      authLoading: true,
      activeProjectId: null,
      favoriteCalculators: [],
      recentCalculators: [],
      projects: [],
      savedCalculations: [],
      knowledgeBase: initialKnowledge,
      inventory: [],
      punchLists: [],
      dailyReports: [],
      audits: [],
      safetyBriefings: [],
      rfis: [],
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
        pinnedModules: ['tracker', 'punch-lists', 'reports', 'audits'],
      },
      setUser: (user) => set({ user }),
      updateUserRole: (role) => set((state) => ({ 
        user: state.user ? { ...state.user, role } : null 
      })),
      setAuthLoading: (loading) => set({ authLoading: loading }),
      setProjects: (projects) => set({ projects }),
      setCalculations: (savedCalculations) => set({ savedCalculations }),
      setKnowledge: (knowledgeBase) => set({ knowledgeBase }),
      setInventory: (inventory) => set({ inventory }),
      setPunchLists: (punchLists) => set({ punchLists }),
      setDailyReports: (dailyReports) => set({ dailyReports }),
      setAudits: (audits) => set({ audits }),
      setSafetyBriefings: (safetyBriefings) => set({ safetyBriefings }),
      setRfis: (rfis) => set({ rfis }),
      setActiveProject: (id) => set({ activeProjectId: id }),
      addProject: (p) => set((state) => ({ projects: [p, ...state.projects] })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
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

