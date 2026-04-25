'use client';

import { useState } from 'react';
import { useMonitoringStore } from '@/store/monitoring-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Bell } from 'lucide-react';
import type { AlertRule } from '@/types/monitoring';

const metricOptions = [
  { value: 'cpu', label: 'CPU' },
  { value: 'memory', label: '内存' },
  { value: 'disk', label: '磁盘' },
];

export function AlertRulesConfig() {
  const { alertRules, addAlertRule, updateAlertRule, deleteAlertRule } = useMonitoringStore();
  const [newRule, setNewRule] = useState<{ name: string; metric: 'cpu' | 'memory' | 'disk'; threshold: number }>({
    name: '',
    metric: 'cpu',
    threshold: 80,
  });

  const handleAddRule = () => {
    if (!newRule.name.trim()) return;

    const rule: AlertRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      metric: newRule.metric,
      threshold: newRule.threshold,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    addAlertRule(rule);
    setNewRule({ name: '', metric: 'cpu', threshold: 80 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          告警规则配置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="rule-name">规则名称</Label>
            <Input
              id="rule-name"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              placeholder="例如: CPU 过高告警"
            />
          </div>

          <div>
            <Label htmlFor="rule-metric">监控指标</Label>
            <Select
              value={newRule.metric}
              onValueChange={(value) => setNewRule({ ...newRule, metric: value as 'cpu' | 'memory' | 'disk' })}
            >
              <SelectTrigger id="rule-metric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="rule-threshold">阈值 (%)</Label>
            <Input
              id="rule-threshold"
              type="number"
              min={0}
              max={100}
              value={newRule.threshold}
              onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
            />
          </div>
        </div>

        <Button onClick={handleAddRule} disabled={!newRule.name.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          添加规则
        </Button>

        <div className="space-y-3">
          {alertRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(checked) =>
                    updateAlertRule({ ...rule, enabled: checked })
                  }
                />
                <div>
                  <div className="font-medium">{rule.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {metricOptions.find((m) => m.value === rule.metric)?.label} &gt; {rule.threshold}%
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteAlertRule(rule.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          {alertRules.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              暂无告警规则，点击上方添加
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
