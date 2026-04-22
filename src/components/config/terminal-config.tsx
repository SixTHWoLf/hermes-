'use client';

import { useState } from 'react';
import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function isValidMemory(value: string): boolean {
  if (!value) return true;
  return /^\d+[MG]$/i.test(value);
}

export function TerminalConfig() {
  const { config, updateTerminalConfig } = useConfigStore();
  const terminal = config.terminal || {
    docker_image: 'hermes-agent:latest',
    cpu: 2,
    memory: '4G',
    disk: '20G',
    timeout: 3600,
    workdir: '/app',
  };

  const [memoryError, setMemoryError] = useState<string | null>(null);

  const handleMemoryBlur = () => {
    if (terminal.memory && !isValidMemory(terminal.memory)) {
      setMemoryError('格式应为数字+单位，如 4G、512M');
    } else {
      setMemoryError(null);
    }
  };

  const handleCpuChange = (value: string) => {
    const cpu = parseInt(value) || 2;
    updateTerminalConfig({ cpu: Math.min(16, Math.max(1, cpu)) });
  };

  const handleTimeoutChange = (value: string) => {
    const timeout = parseInt(value) || 3600;
    updateTerminalConfig({ timeout: Math.min(86400, Math.max(60, timeout)) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Docker 配置</CardTitle>
          <CardDescription>终端容器镜像设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="docker-image">Docker 镜像</Label>
            <Input
              id="docker-image"
              value={terminal.docker_image}
              onChange={(e) => updateTerminalConfig({ docker_image: e.target.value })}
              placeholder="hermes-agent:latest"
            />
            <p className="text-xs text-muted-foreground">
              用于运行终端的 Docker 镜像
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>容器资源</CardTitle>
          <CardDescription>分配给容器的计算资源</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cpu">CPU 核心数</Label>
              <div className="relative">
                <Input
                  id="cpu"
                  type="number"
                  min={1}
                  max={16}
                  value={terminal.cpu}
                  onChange={(e) => handleCpuChange(e.target.value)}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  核
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                范围: 1-16
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memory">内存</Label>
              <div className="relative">
                <Input
                  id="memory"
                  value={terminal.memory}
                  onChange={(e) => updateTerminalConfig({ memory: e.target.value })}
                  onBlur={handleMemoryBlur}
                  placeholder="4G"
                  className={memoryError ? 'border-destructive pr-10' : 'pr-10'}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {memoryError ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : terminal.memory && isValidMemory(terminal.memory) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : null}
                </div>
              </div>
              {memoryError ? (
                <p className="text-xs text-destructive">{memoryError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  格式: 4G, 512M
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="disk">磁盘空间</Label>
              <Input
                id="disk"
                value={terminal.disk}
                onChange={(e) => updateTerminalConfig({ disk: e.target.value })}
                placeholder="20G"
              />
              <p className="text-xs text-muted-foreground">
                格式: 20G, 100G
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>运行时配置</CardTitle>
          <CardDescription>终端运行时的其他参数</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timeout">超时时间（秒）</Label>
              <div className="relative">
                <Input
                  id="timeout"
                  type="number"
                  min={60}
                  max={86400}
                  value={terminal.timeout}
                  onChange={(e) => handleTimeoutChange(e.target.value)}
                  className="pr-12"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  秒
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                范围: 60-86400（1分钟-24小时）
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workdir">工作目录</Label>
              <Input
                id="workdir"
                value={terminal.workdir}
                onChange={(e) => updateTerminalConfig({ workdir: e.target.value })}
                placeholder="/app"
              />
              <p className="text-xs text-muted-foreground">
                容器内默认工作目录
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
