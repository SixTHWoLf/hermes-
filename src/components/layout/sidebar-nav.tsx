'use client';

import { useConfigStore } from '@/store/config-store';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  { id: 'model', label: '模型配置', description: 'Model Configuration' },
  { id: 'agent', label: 'Agent 配置', description: 'Agent Configuration' },
  { id: 'terminal', label: '终端配置', description: 'Terminal Configuration' },
  { id: 'integration', label: '平台集成', description: 'Platform Integration' },
] as const;

export function SidebarNav() {
  const { activeTab, setActiveTab, isDirty } = useConfigStore();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`
            w-full text-left px-4 py-3 rounded-lg transition-colors
            ${activeTab === item.id
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{item.label}</span>
            {isDirty && activeTab === item.id && (
              <Badge variant="secondary" className="text-xs">
                未保存
              </Badge>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${activeTab === item.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {item.description}
          </p>
        </button>
      ))}
    </nav>
  );
}
