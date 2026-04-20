'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

const TOOL_USE_OPTIONS = [
  { value: 'required', label: 'Required' },
  { value: 'optional', label: 'Optional' },
  { value: 'disabled', label: 'Disabled' },
];

const REASONING_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function AgentConfig() {
  const { config, updateAgentConfig } = useConfigStore();
  const agent = config.agent || {
    max_turns: 10,
    gateway_timeout: 120,
    tool_use_enforcement: 'optional',
    reasoning_effort: 'medium',
    personalities: ['default'],
  };

  const addPersonality = () => {
    updateAgentConfig({
      personalities: [...(agent.personalities || []), `personality_${Date.now()}`],
    });
  };

  const removePersonality = (index: number) => {
    updateAgentConfig({
      personalities: (agent.personalities || []).filter((_, i) => i !== index),
    });
  };

  const updatePersonality = (index: number, value: string) => {
    const newPersonalities = [...(agent.personalities || [])];
    newPersonalities[index] = value;
    updateAgentConfig({ personalities: newPersonalities });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基础配置</CardTitle>
          <CardDescription>Agent 核心参数设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="max-turns">最大对话轮数 (max_turns)</Label>
              <Input
                id="max-turns"
                type="number"
                min={1}
                max={100}
                value={agent.max_turns}
                onChange={(e) => updateAgentConfig({ max_turns: parseInt(e.target.value) || 10 })}
              />
              <p className="text-xs text-muted-foreground">
                Agent 与用户对话的最大轮数限制
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gateway-timeout">网关超时 (gateway_timeout)</Label>
              <Input
                id="gateway-timeout"
                type="number"
                min={10}
                max={600}
                value={agent.gateway_timeout}
                onChange={(e) => updateAgentConfig({ gateway_timeout: parseInt(e.target.value) || 120 })}
              />
              <p className="text-xs text-muted-foreground">
                网关请求超时时间（秒）
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tool-enforcement">工具使用策略 (tool_use_enforcement)</Label>
              <Select
                value={agent.tool_use_enforcement}
                onValueChange={(value) => updateAgentConfig({ tool_use_enforcement: value || 'optional' })}
              >
                <SelectTrigger id="tool-enforcement">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOOL_USE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                控制 Agent 使用工具的策略
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasoning-effort">推理强度 (reasoning_effort)</Label>
              <Select
                value={agent.reasoning_effort}
                onValueChange={(value) => updateAgentConfig({ reasoning_effort: value || 'medium' })}
              >
                <SelectTrigger id="reasoning-effort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                控制 Agent 推理过程中投入的计算资源
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>预设人格管理</CardTitle>
              <CardDescription>管理 Agent 预设人格</CardDescription>
            </div>
            <Button onClick={addPersonality} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              添加人格
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(agent.personalities || []).map((personality, index) => (
              <div key={index} className="flex items-center gap-1">
                <Badge variant="secondary" className="pr-1">
                  {personality}
                </Badge>
                {(agent.personalities || []).length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => removePersonality(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            点击人格名称进行编辑
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
