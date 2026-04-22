'use client';

import { useEffect } from 'react';
import { useConfigStore } from '@/store/config-store';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  { id: 'model', label: '模型配置', description: 'Model Configuration' },
  { id: 'agent', label: 'Agent 配置', description: 'Agent Configuration' },
  { id: 'terminal', label: '终端配置', description: 'Terminal Configuration' },
  { id: 'browser', label: '浏览器配置', description: 'Browser Configuration' },
  { id: 'display', label: '显示配置', description: 'Display Configuration' },
  { id: 'code_execution', label: '代码执行', description: 'Code Execution' },
  { id: 'security', label: '安全配置', description: 'Security Configuration' },
  { id: 'memory', label: '记忆配置', description: 'Memory Configuration' },
] as const;

export function SidebarNav() {
  const { activeTab, setActiveTab } = useConfigStore();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = NAV_ITEMS.findIndex(item => item.id === activeTab);

      if (e.key === 'ArrowDown' && currentIndex < NAV_ITEMS.length - 1) {
        e.preventDefault();
        setActiveTab(NAV_ITEMS[currentIndex + 1].id);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        setActiveTab(NAV_ITEMS[currentIndex - 1].id);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveTab(NAV_ITEMS[0].id);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveTab(NAV_ITEMS[NAV_ITEMS.length - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, setActiveTab]);

  return (
    <nav className="space-y-1" role="tablist" aria-label="配置模块导航">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={activeTab === item.id}
          tabIndex={activeTab === item.id ? 0 : -1}
          onClick={() => setActiveTab(item.id)}
          className={`
            w-full text-left px-4 py-3 rounded-lg transition-all duration-200
            ${activeTab === item.id
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'hover:bg-muted'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{item.label}</span>
            {activeTab === item.id && (
              <Badge variant="secondary" className="text-xs animate-pulse">
                当前
              </Badge>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${activeTab === item.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {item.description}
          </p>
        </button>
      ))}
      <p className="text-xs text-muted-foreground mt-4 px-4">
        使用 ↑↓ 键导航
      </p>
    </nav>
  );
}
