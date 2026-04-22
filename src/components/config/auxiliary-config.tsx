'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const AUXILIARY_SERVICES = [
  { key: 'vision', label: 'Vision', description: '视觉识别服务 - 支持图像分析和理解' },
  { key: 'web_extract', label: 'Web Extract', description: '网页内容提取服务 - 从网页中提取结构化数据' },
  { key: 'compression', label: 'Compression', description: '数据压缩服务 - 文件和数据压缩' },
  { key: 'session_search', label: 'Session Search', description: '会话搜索服务 - 搜索历史会话内容' },
  { key: 'skills_hub', label: 'Skills Hub', description: '技能中心 - 管理 AI 技能和工具' },
];

export function AuxiliaryConfig() {
  const { config, updateAuxiliaryConfig } = useConfigStore();
  const auxiliary = config.auxiliary || {
    vision: true,
    web_extract: true,
    compression: true,
    session_search: true,
    skills_hub: true,
    mcp: {},
    memory: {},
  };

  const handleToggle = (key: string, checked: boolean) => {
    updateAuxiliaryConfig({ [key]: checked });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>辅助服务配置</CardTitle>
          <CardDescription>启用或禁用辅助服务</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            {AUXILIARY_SERVICES.map((service) => (
              <div key={service.key} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor={service.key} className="text-base font-medium">
                    {service.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {service.description}
                  </p>
                </div>
                <Switch
                  id={service.key}
                  checked={auxiliary[service.key as keyof typeof auxiliary] as boolean}
                  onCheckedChange={(checked) => handleToggle(service.key, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MCP 配置</CardTitle>
          <CardDescription>Model Context Protocol 配置</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            MCP 服务配置已启用，详细信息请查看配置文件 ~/.hermes/config.yaml
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Memory 配置</CardTitle>
          <CardDescription>记忆服务配置</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            记忆服务配置已启用，详细信息请查看配置文件 ~/.hermes/config.yaml
          </p>
        </CardContent>
      </Card>
    </div>
  );
}