'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PERSONALITY_OPTIONS = [
  { value: 'default', label: '默认 (Default)' },
  { value: 'concise', label: '简洁 (Concise)' },
  { value: 'verbose', label: '详细 (Verbose)' },
  { value: 'technical', label: '技术 (Technical)' },
];

export function DisplayConfig() {
  const { config, updateDisplayConfig } = useConfigStore();
  const display = config.display || {
    compact_mode: false,
    personality_select: 'default',
    reasoning_display: true,
    streaming_output: true,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>界面显示</CardTitle>
          <CardDescription>控制台界面显示效果配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode">紧凑模式</Label>
              <p className="text-xs text-muted-foreground">
                启用后界面将使用更紧凑的布局，减少间距
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={display.compact_mode}
              onCheckedChange={(checked) => updateDisplayConfig({ compact_mode: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reasoning-display">推理显示</Label>
              <p className="text-xs text-muted-foreground">
                显示 Agent 推理过程和思考链
              </p>
            </div>
            <Switch
              id="reasoning-display"
              checked={display.reasoning_display}
              onCheckedChange={(checked) => updateDisplayConfig({ reasoning_display: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="streaming-output">流式输出</Label>
              <p className="text-xs text-muted-foreground">
                启用后内容将实时流式显示，而非等待完整响应
              </p>
            </div>
            <Switch
              id="streaming-output"
              checked={display.streaming_output}
              onCheckedChange={(checked) => updateDisplayConfig({ streaming_output: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>人格选择</CardTitle>
          <CardDescription>选择 Agent 的响应风格</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={display.personality_select}
            onValueChange={(value) => updateDisplayConfig({ personality_select: value || 'default' })}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERSONALITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            不同人格会影响 Agent 的响应方式和表达风格
          </p>
        </CardContent>
      </Card>
    </div>
  );
}