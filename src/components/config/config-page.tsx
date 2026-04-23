'use client';

import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/store/config-store';
import { ModelConfig } from '@/components/config/model-config';
import { AgentConfig } from '@/components/config/agent-config';
import { TerminalConfig } from '@/components/config/terminal-config';
import { BrowserConfig } from '@/components/config/browser-config';
import { DisplayConfig } from '@/components/config/display-config';
import { CodeExecutionConfig } from '@/components/config/code-execution-config';
import { SecurityConfig } from '@/components/config/security-config';
import { MemoryConfig } from '@/components/config/memory-config';
import { IntegrationConfig } from '@/components/config/integration-config';
import { ConfigPreview } from '@/components/config/config-preview';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RotateCcw, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function ConfigPage() {
  const { t } = useTranslation();
  const {
    activeTab,
    config,
    isDirty,
    showPreview,
    resetConfig,
    setShowPreview,
    markAsSaved,
  } = useConfigStore();

  const handleSave = async () => {
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(t('messages.saveFailed'));
      }

      markAsSaved();
      toast.success(t('messages.saveSuccess'));
    } catch {
      toast.error(t('messages.saveFailed'));
    }
  };

  const handleReset = () => {
    resetConfig();
    toast.info(t('messages.resetSuccess'));
  };

  const renderConfigContent = () => {
    switch (activeTab) {
      case 'model':
        return <ModelConfig />;
      case 'agent':
        return <AgentConfig />;
      case 'terminal':
        return <TerminalConfig />;
      case 'browser':
        return <BrowserConfig />;
      case 'display':
        return <DisplayConfig />;
      case 'code_execution':
        return <CodeExecutionConfig />;
      case 'security':
        return <SecurityConfig />;
      case 'memory':
        return <MemoryConfig />;
      case 'integration':
        return <IntegrationConfig />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{t('app.title')}</h1>
          <Badge variant="outline" className="text-xs">
            {t('app.version')}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                {t('actions.hidePreview')}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                {t('actions.preview')}
              </>
            )}
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!isDirty}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            {t('actions.reset')}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty}
          >
            <Save className="h-4 w-4 mr-1" />
            {t('actions.save')}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full flex flex-col">
          <TabsContent value={activeTab} className="flex-1 overflow-auto p-6 m-0">
            {renderConfigContent()}
          </TabsContent>
        </Tabs>

        {showPreview && (
          <div className="w-[500px] border-l overflow-auto p-6 bg-muted/30">
            <ConfigPreview />
          </div>
        )}
      </div>
    </div>
  );
}
