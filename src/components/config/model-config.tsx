'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PROVIDER_OPTIONS = [
  { value: 'minimax-cn', label: 'MiniMax CN' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'nous', label: 'Nous' },
  { value: 'anthropic', label: 'Anthropic' },
];

const MODEL_OPTIONS = [
  { value: 'minimax-cn', label: 'MiniMax Chat' },
  { value: 'openai-gpt-4', label: 'GPT-4' },
  { value: 'openai-gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'openai-gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'nous-hermes-2', label: 'Nous Hermes 2' },
];

export function ModelConfig() {
  const { config, updateModelConfig } = useConfigStore();
  const model = config.model || { default_model: 'minimax-cn', provider: 'minimax-cn', base_url: '', api_key: '' };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>默认模型</CardTitle>
          <CardDescription>选择默认使用的 AI 模型</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={model.default_model}
            onValueChange={(value) => updateModelConfig({ default_model: value || 'minimax-cn' })}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provider 配置</CardTitle>
          <CardDescription>AI Provider 连接信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider 类型</Label>
              <Select
                value={model.provider}
                onValueChange={(value) => updateModelConfig({ provider: value || 'minimax-cn' })}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-url">Base URL</Label>
              <Input
                id="base-url"
                value={model.base_url || ''}
                onChange={(e) => updateModelConfig({ base_url: e.target.value })}
                placeholder="https://api.example.com"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={model.api_key || ''}
                onChange={(e) => updateModelConfig({ api_key: e.target.value })}
                placeholder="输入 API Key"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
