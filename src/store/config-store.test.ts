import { describe, it, expect } from 'vitest';
import { useConfigStore } from '@/store/config-store';
import { defaultHermesConfig } from '@/types/config';

describe('config store', () => {
  it('should have initial state', () => {
    const store = useConfigStore.getState();
    expect(store.config).toEqual(defaultHermesConfig);
    expect(store.isDirty).toBe(false);
    expect(store.activeTab).toBe('model');
    expect(store.showPreview).toBe(false);
  });

  it('should update model config and mark as dirty', () => {
    const { updateModelConfig } = useConfigStore.getState();
    updateModelConfig({ default_model: 'openai' });

    const store = useConfigStore.getState();
    expect(store.config.model?.default_model).toBe('openai');
    expect(store.isDirty).toBe(true);
  });

  it('should update agent config and mark as dirty', () => {
    const { updateAgentConfig } = useConfigStore.getState();
    updateAgentConfig({ max_turns: 20 });

    const store = useConfigStore.getState();
    expect(store.config.agent?.max_turns).toBe(20);
    expect(store.isDirty).toBe(true);
  });

  it('should update terminal config and mark as dirty', () => {
    const { updateTerminalConfig } = useConfigStore.getState();
    updateTerminalConfig({ docker_image: 'custom-image:latest' });

    const store = useConfigStore.getState();
    expect(store.config.terminal?.docker_image).toBe('custom-image:latest');
    expect(store.isDirty).toBe(true);
  });

  it('should set active tab', () => {
    const { setActiveTab } = useConfigStore.getState();
    setActiveTab('agent');

    const store = useConfigStore.getState();
    expect(store.activeTab).toBe('agent');
  });

  it('should toggle preview', () => {
    const { setShowPreview } = useConfigStore.getState();
    setShowPreview(true);

    let store = useConfigStore.getState();
    expect(store.showPreview).toBe(true);

    setShowPreview(false);
    store = useConfigStore.getState();
    expect(store.showPreview).toBe(false);
  });

  it('should reset config and clear dirty flag', () => {
    const store = useConfigStore.getState();

    // Make some changes
    store.updateModelConfig({ default_model: 'openai' });
    expect(useConfigStore.getState().isDirty).toBe(true);

    // Reset
    store.resetConfig();
    expect(useConfigStore.getState().isDirty).toBe(false);
    expect(useConfigStore.getState().config.model?.default_model).toBe('minimax-cn');
  });

  it('should mark as saved and update original config', () => {
    const store = useConfigStore.getState();

    // Make some changes
    store.updateModelConfig({ default_model: 'openai' });
    expect(useConfigStore.getState().isDirty).toBe(true);

    // Mark as saved
    store.markAsSaved();
    expect(useConfigStore.getState().isDirty).toBe(false);
    expect(useConfigStore.getState().originalConfig.model?.default_model).toBe('openai');
  });

  it('should set full config', () => {
    const { setConfig } = useConfigStore.getState();
    const newConfig = {
      ...defaultHermesConfig,
      model: {
        default_model: 'custom-model',
        provider: 'openai',
        base_url: 'https://custom.api.com',
        api_key: 'test-key',
      },
    };

    setConfig(newConfig);

    const store = useConfigStore.getState();
    expect(store.config.model?.default_model).toBe('custom-model');
    expect(store.config.model?.provider).toBe('openai');
    expect(store.isDirty).toBe(false);
  });
});
