'use client';

import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { config, updateModelConfig } = useConfigStore();
  const model = config.model || { default_model: 'minimax-cn', provider: 'minimax-cn', base_url: '', api_key: '' };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('model.defaultModel')}</CardTitle>
          <CardDescription>{t('model.defaultModelDesc')}</CardDescription>
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
          <CardTitle>{t('model.providerConfig')}</CardTitle>
          <CardDescription>{t('model.providerConfigDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="provider">{t('model.providerType')}</Label>
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
              <Label htmlFor="base-url">{t('model.baseUrl')}</Label>
              <Input
                id="base-url"
                value={model.base_url || ''}
                onChange={(e) => updateModelConfig({ base_url: e.target.value })}
                placeholder="https://api.example.com"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="api-key">{t('model.apiKey')}</Label>
              <Input
                id="api-key"
                type="password"
                value={model.api_key || ''}
                onChange={(e) => updateModelConfig({ api_key: e.target.value })}
                placeholder={t('model.apiKeyPlaceholder')}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
