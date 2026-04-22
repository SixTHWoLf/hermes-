'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, X, Shield, Globe, Eye, EyeOff } from 'lucide-react';

export function SecurityConfig() {
  const { config, updateSecurityConfig } = useConfigStore();
  const security = config.security || {
    redact_secrets: true,
    tirith: {},
    website_blacklist: [],
  };

  const handleRedactSecretsChange = (checked: boolean) => {
    updateSecurityConfig({ redact_secrets: checked });
  };

  const addWebsiteToBlacklist = () => {
    updateSecurityConfig({
      website_blacklist: [...security.website_blacklist, `https://example-${Date.now()}.com`],
    });
  };

  const removeWebsiteFromBlacklist = (index: number) => {
    updateSecurityConfig({
      website_blacklist: security.website_blacklist.filter((_, i) => i !== index),
    });
  };

  const updateWebsiteInBlacklist = (index: number, value: string) => {
    const newBlacklist = [...security.website_blacklist];
    newBlacklist[index] = value;
    updateSecurityConfig({ website_blacklist: newBlacklist });
  };

  const addTirithKey = () => {
    updateSecurityConfig({
      tirith: { ...security.tirith, [`key_${Date.now()}`]: '' },
    });
  };

  const removeTirithKey = (key: string) => {
    const newTirith = { ...security.tirith };
    delete newTirith[key];
    updateSecurityConfig({ tirith: newTirith });
  };

  const updateTirithKey = (oldKey: string, newKey: string, value: string) => {
    const newTirith: Record<string, unknown> = {};
    Object.entries(security.tirith).forEach(([k, v]) => {
      if (k === oldKey) {
        newTirith[newKey] = value;
      } else {
        newTirith[k] = v;
      }
    });
    updateSecurityConfig({ tirith: newTirith });
  };

  const updateTirithValue = (key: string, value: string) => {
    updateSecurityConfig({
      tirith: { ...security.tirith, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            敏感信息保护
          </CardTitle>
          <CardDescription>配置敏感信息处理方式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="redact-secrets">Secret 脱敏</Label>
              <p className="text-xs text-muted-foreground">
                自动屏蔽日志和输出中的敏感信息（如 API Key、密码等）
              </p>
            </div>
            <Switch
              id="redact-secrets"
              checked={security.redact_secrets}
              onCheckedChange={handleRedactSecretsChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            网站黑名单
          </CardTitle>
          <CardDescription>禁止访问的网站列表（基于 TIRTH 模块）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {(security.website_blacklist || []).map((website, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={website}
                  onChange={(e) => updateWebsiteInBlacklist(index, e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeWebsiteFromBlacklist(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addWebsiteToBlacklist}>
            <Plus className="h-4 w-4 mr-1" />
            添加网站
          </Button>
          <p className="text-xs text-muted-foreground">
            添加需要屏蔽的网站域名，Agent 在执行任务时将无法访问这些网站
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            TIRTH 配置
          </CardTitle>
          <CardDescription>TIRTH 安全扫描模块的详细配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground mb-4">
            TIRTH（Threat Intelligence and Response Toolkit for Humans）是一个高级安全模块，用于实时扫描和过滤潜在威胁。
          </p>
          {Object.entries(security.tirith || {}).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <Input
                value={key}
                onChange={(e) => updateTirithKey(key, e.target.value, String(value))}
                placeholder="配置键"
                className="flex-1"
              />
              <Input
                value={String(value)}
                onChange={(e) => updateTirithValue(key, e.target.value)}
                placeholder="配置值"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTirithKey(key)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addTirithKey}>
            <Plus className="h-4 w-4 mr-1" />
            添加配置项
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}