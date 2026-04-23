'use client';

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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { RotateCcw, Save, Eye, EyeOff, Activity } from 'lucide-react';
import { toast } from 'sonner';

export function ConfigPage() {
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
        throw new Error('保存失败');
      }

      markAsSaved();
      toast.success('配置已保存');
    } catch {
      toast.error('保存失败，请重试');
    }
  };

  const handleReset = () => {
    resetConfig();
    toast.info('配置已重置');
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
          <h1 className="text-2xl font-bold">Hermes Console</h1>
          <Badge variant="outline" className="text-xs">
            v0.1.0
          </Badge>
          <Separator orientation="vertical" className="h-6" />
          <Link href="/monitoring">
            <Button variant="ghost" size="sm">
              <Activity className="h-4 w-4 mr-1" />
              监控
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                隐藏预览
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                预览
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
            重置
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty}
          >
            <Save className="h-4 w-4 mr-1" />
            保存
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
