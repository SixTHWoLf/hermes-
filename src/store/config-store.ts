import { create } from 'zustand';
import type { HermesConfig, ModelConfig, AgentConfig, TerminalConfig, BrowserConfig, DisplayConfig, CodeExecutionConfig, SecurityConfig, MemoryConfig } from '@/types/config';
import { defaultHermesConfig } from '@/types/config';

type TabType = 'model' | 'agent' | 'terminal' | 'browser' | 'display' | 'code_execution' | 'security' | 'memory';

interface ConfigStore {
  // Current configuration
  config: HermesConfig;
  // Original configuration (for reset)
  originalConfig: HermesConfig;
  // Dirty state (unsaved changes)
  isDirty: boolean;
  // Active tab
  activeTab: TabType;
  // Preview mode
  showPreview: boolean;

  // Actions
  setConfig: (config: HermesConfig) => void;
  updateModelConfig: (model: Partial<ModelConfig>) => void;
  updateAgentConfig: (agent: Partial<AgentConfig>) => void;
  updateTerminalConfig: (terminal: Partial<TerminalConfig>) => void;
  updateBrowserConfig: (browser: Partial<BrowserConfig>) => void;
  updateDisplayConfig: (display: Partial<DisplayConfig>) => void;
  updateCodeExecutionConfig: (codeExecution: Partial<CodeExecutionConfig>) => void;
  updateSecurityConfig: (security: Partial<SecurityConfig>) => void;
  updateMemoryConfig: (memory: Partial<MemoryConfig>) => void;
  setActiveTab: (tab: TabType) => void;
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

  updateBrowserConfig: (browser) => set((state) => ({
    config: {
      ...state.config,
      browser: { ...(state.config.browser || defaultHermesConfig.browser!), ...browser },
    },
    isDirty: true,
  })),

  updateDisplayConfig: (display) => set((state) => ({
    config: {
      ...state.config,
      display: { ...(state.config.display || defaultHermesConfig.display!), ...display },
    },
    isDirty: true,
  })),

  updateCodeExecutionConfig: (codeExecution) => set((state) => ({
    config: {
      ...state.config,
      code_execution: { ...(state.config.code_execution || defaultHermesConfig.code_execution!), ...codeExecution },
    },
    isDirty: true,
  })),

  updateSecurityConfig: (security) => set((state) => ({
    config: {
      ...state.config,
      security: { ...(state.config.security || defaultHermesConfig.security!), ...security },
    },
    isDirty: true,
  })),

  updateMemoryConfig: (memory) => set((state) => ({
    config: {
      ...state.config,
      memory: { ...(state.config.memory || defaultHermesConfig.memory!), ...memory },
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
