'use client';

import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/store/config-store';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  { id: 'model' },
  { id: 'agent' },
  { id: 'terminal' },
  { id: 'browser' },
  { id: 'display' },
  { id: 'code_execution' },
  { id: 'security' },
  { id: 'memory' },
  { id: 'integration' },
] as const;

export function SidebarNav() {
  const { t } = useTranslation();
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
            <span className="font-medium">{t(`nav.${item.id}`)}</span>
            {isDirty && activeTab === item.id && (
              <Badge variant="secondary" className="text-xs">
                {t('actions.unsaved')}
              </Badge>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${activeTab === item.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {t(`nav.${item.id}`)}
          </p>
        </button>
      ))}
    </nav>
  );
}
