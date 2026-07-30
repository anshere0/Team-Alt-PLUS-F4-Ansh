import { create } from 'zustand';

export type ActiveTab = 'dashboard' | 'gis' | 'topology' | 'inspector';

interface UIState {
  sidebarOpen: boolean;
  activeTab: ActiveTab;
  copilotOpen: boolean;
  selectedNodeId: string | null;
  toggleSidebar: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  toggleCopilot: () => void;
  setSelectedNodeId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeTab: 'dashboard',
  copilotOpen: false,
  selectedNodeId: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveTab: (activeTab: ActiveTab) => set({ activeTab }),
  toggleCopilot: () => set((state) => ({ copilotOpen: !state.copilotOpen })),
  setSelectedNodeId: (selectedNodeId: string | null) => set({ selectedNodeId }),
}));
