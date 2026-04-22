'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function BrowserConfig() {
  const { config, updateBrowserConfig } = useConfigStore();
  const browser = config.browser || {
    inactivity_timeout: 300,
    cdp_url: 'ws://localhost:9222',
    session_recording: false,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>会话设置</CardTitle>
          <CardDescription>浏览器会话相关配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="inactivity-timeout">会话超时时间（秒）</Label>
            <Input
              id="inactivity-timeout"
              type="number"
              min={60}
              max={3600}
              value={browser.inactivity_timeout}
              onChange={(e) => updateBrowserConfig({ inactivity_timeout: parseInt(e.target.value) || 300 })}
            />
            <p className="text-xs text-muted-foreground">
              超过此时间无活动将自动关闭会话
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="session-recording">会话录制</Label>
              <p className="text-sm text-muted-foreground">
                启用后会自动录制浏览器会话
              </p>
            </div>
            <Switch
              id="session-recording"
              checked={browser.session_recording}
              onCheckedChange={(checked) => updateBrowserConfig({ session_recording: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CDP 配置</CardTitle>
          <CardDescription>Chrome DevTools Protocol 连接设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cdp-url">CDP URL</Label>
            <Input
              id="cdp-url"
              value={browser.cdp_url}
              onChange={(e) => updateBrowserConfig({ cdp_url: e.target.value })}
              placeholder="ws://localhost:9222"
            />
            <p className="text-xs text-muted-foreground">
              Chrome 浏览器的 WebSocket 调试地址
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
