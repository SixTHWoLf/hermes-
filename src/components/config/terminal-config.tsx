'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
              <Input
                id="cpu"
                type="number"
                min={1}
                max={16}
                value={terminal.cpu}
                onChange={(e) => updateTerminalConfig({ cpu: parseInt(e.target.value) || 2 })}
              />
              <p className="text-xs text-muted-foreground">
                分配的 CPU 核心数
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memory">内存</Label>
              <Input
                id="memory"
                value={terminal.memory}
                onChange={(e) => updateTerminalConfig({ memory: e.target.value })}
                placeholder="4G"
              />
              <p className="text-xs text-muted-foreground">
                内存大小（如 4G, 8G）
              </p>
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
                持久化存储空间
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
              <Input
                id="timeout"
                type="number"
                min={60}
                max={86400}
                value={terminal.timeout}
                onChange={(e) => updateTerminalConfig({ timeout: parseInt(e.target.value) || 3600 })}
              />
              <p className="text-xs text-muted-foreground">
                终端单次运行最大时长
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
