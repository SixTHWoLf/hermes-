'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const STRATEGY_OPTIONS = [
  { value: 'recent', label: '最近优先 (Recent)' },
  { value: 'important', label: '重要优先 (Important)' },
  { value: 'summary', label: '摘要模式 (Summary)' },
];

const MEMORY_LIMIT_OPTIONS = [
  { value: '128M', label: '128 MB' },
  { value: '256M', label: '256 MB' },
  { value: '512M', label: '512 MB' },
  { value: '1G', label: '1 GB' },
  { value: '2G', label: '2 GB' },
  { value: '4G', label: '4 GB' },
];

export function MemoryConfig() {
  const { config, updateMemoryConfig } = useConfigStore();
  const memory = config.memory || {
    enabled: true,
    memory_limit: '512M',
    strategy: 'recent',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>记忆开关</CardTitle>
          <CardDescription>启用或禁用记忆功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="memory-enabled">启用记忆功能</Label>
              <p className="text-xs text-muted-foreground">
                关闭后 Agent 将不会保留对话历史记忆
              </p>
            </div>
            <Switch
              id="memory-enabled"
              checked={memory.enabled}
              onCheckedChange={(checked) => updateMemoryConfig({ enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>内存限制</CardTitle>
          <CardDescription>设置记忆存储的内存上限</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="memory-limit">内存限制</Label>
            <Select
              value={memory.memory_limit}
              onValueChange={(value) => updateMemoryConfig({ memory_limit: value || '512M' })}
            >
              <SelectTrigger id="memory-limit" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMORY_LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              超出限制时将自动清理旧记忆
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>记忆策略</CardTitle>
          <CardDescription>选择记忆的管理和检索策略</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="memory-strategy">策略类型</Label>
            <Select
              value={memory.strategy}
              onValueChange={(value) => updateMemoryConfig({ strategy: (value || 'recent') as 'recent' | 'important' | 'summary' })}
            >
              <SelectTrigger id="memory-strategy" className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STRATEGY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              控制如何选择和保留重要记忆
            </p>
          </div>

          <div className="rounded-lg border p-4 bg-muted/30">
            <h4 className="text-sm font-medium mb-2">策略说明</h4>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li><strong>最近优先 (Recent)</strong>：保留最新的对话记忆，简单但可能丢失重要信息</li>
              <li><strong>重要优先 (Important)</strong>：基于重要性评分保留关键记忆，需要额外的重要性判断</li>
              <li><strong>摘要模式 (Summary)</strong>：自动生成对话摘要，在压缩空间中保留最多信息</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}