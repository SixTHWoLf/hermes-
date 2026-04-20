import { create } from 'zustand';
import type { HermesConfig, ModelConfig, AgentConfig, TerminalConfig } from '@/types/config';
import { defaultHermesConfig } from '@/types/config';

interface ConfigStore {
  // Current configuration
  config: HermesConfig;
  // Original configuration (for reset)
  originalConfig: HermesConfig;
  // Dirty state (unsaved changes)
  isDirty: boolean;
  // Active tab
  activeTab: 'model' | 'agent' | 'terminal';
  // Preview mode
  showPreview: boolean;

  // Actions
  setConfig: (config: HermesConfig) => void;
  updateModelConfig: (model: Partial<ModelConfig>) => void;
  updateAgentConfig: (agent: Partial<AgentConfig>) => void;
  updateTerminalConfig: (terminal: Partial<TerminalConfig>) => void;
  setActiveTab: (tab: 'model' | 'agent' | 'terminal') => void;
  setShowPreview: (show: boolean) => void;
  resetConfig: () => void;
  markAsSaved: () => void;
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  config: defaultHermesConfig,
  originalConfig: defaultHermesConfig,
  isDirty: false,
  activeTab: 'model',
  showPreview: false,

  setConfig: (config) => set({
    config,
    originalConfig: config,
    isDirty: false,
  }),

  updateModelConfig: (model) => set((state) => ({
    config: {
      ...state.config,
      model: { ...(state.config.model || defaultHermesConfig.model!), ...model },
    },
    isDirty: true,
  })),

  updateAgentConfig: (agent) => set((state) => ({
    config: {
      ...state.config,
      agent: { ...(state.config.agent || defaultHermesConfig.agent!), ...agent },
    },
    isDirty: true,
  })),

  updateTerminalConfig: (terminal) => set((state) => ({
    config: {
      ...state.config,
      terminal: { ...(state.config.terminal || defaultHermesConfig.terminal!), ...terminal },
    },
    isDirty: true,
  })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setShowPreview: (show) => set({ showPreview: show }),

  resetConfig: () => set((state) => ({
    config: state.originalConfig,
    isDirty: false,
  })),

  markAsSaved: () => set({
    originalConfig: get().config,
    isDirty: false,
  }),
}));
