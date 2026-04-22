'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MODE_OPTIONS = [
  { value: 'sandbox', label: '沙箱模式' },
  { value: 'project', label: '项目模式' },
];

export function CodeExecutionConfig() {
  const { config, updateCodeExecutionConfig } = useConfigStore();
  const codeExecution = config.code_execution || {
    mode: 'sandbox',
    timeout: 300,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>执行模式</CardTitle>
          <CardDescription>代码执行环境配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="execution-mode">执行模式</Label>
            <Select
              value={codeExecution.mode}
              onValueChange={(value) => updateCodeExecutionConfig({ mode: value as 'project' | 'sandbox' })}
            >
              <SelectTrigger id="execution-mode" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              沙箱模式：隔离环境，限制资源；项目模式：完整访问
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>超时设置</CardTitle>
          <CardDescription>代码执行超时配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="execution-timeout">超时时间（秒）</Label>
            <Input
              id="execution-timeout"
              type="number"
              min={30}
              max={3600}
              value={codeExecution.timeout}
              onChange={(e) => updateCodeExecutionConfig({ timeout: parseInt(e.target.value) || 300 })}
            />
            <p className="text-xs text-muted-foreground">
              单次代码执行的最大时长
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
