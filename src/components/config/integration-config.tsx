'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function IntegrationConfig() {
  const { config, updateIntegrationConfig } = useConfigStore();

  const discord = config.message_platform?.discord || { enabled: false, bot_token: '', guild_id: '', channel_id: '' };
  const telegram = config.message_platform?.telegram || { enabled: false, bot_token: '', chat_id: '', api_id: '', api_hash: '' };
  const slack = config.message_platform?.slack || { enabled: false, bot_token: '', team_id: '', channel_id: '', signing_secret: '' };
  const whatsapp = config.message_platform?.whatsapp || { enabled: false, phone_number: '', auth_token: '', instance_id: '' };
  const qqBot = config.message_platform?.qq_bot || { enabled: false, app_id: '', app_secret: '', access_token: '' };

  return (
    <div className="space-y-6">
      {/* Discord 配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Discord Bot</CardTitle>
              <CardDescription>配置 Discord 机器人集成</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="discord-enabled" className="text-sm">启用</Label>
              <Switch
                id="discord-enabled"
                checked={discord.enabled}
                onCheckedChange={(checked) => updateIntegrationConfig({ discord: { ...discord, enabled: checked }})}
              />
            </div>
          </div>
        </CardHeader>
        {discord.enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discord-bot-token">Bot Token</Label>
              <Input
                id="discord-bot-token"
                type="password"
                value={discord.bot_token || ''}
                onChange={(e) => updateIntegrationConfig({ discord: { ...discord, bot_token: e.target.value } })}
                placeholder="输入 Discord Bot Token"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discord-guild-id">Guild ID</Label>
                <Input
                  id="discord-guild-id"
                  value={discord.guild_id || ''}
                  onChange={(e) => updateIntegrationConfig({ discord: { ...discord, guild_id: e.target.value } })}
                  placeholder="服务器 ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discord-channel-id">Channel ID</Label>
                <Input
                  id="discord-channel-id"
                  value={discord.channel_id || ''}
                  onChange={(e) => updateIntegrationConfig({ discord: { ...discord, channel_id: e.target.value } })}
                  placeholder="频道 ID"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Telegram 配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Telegram Bot</CardTitle>
              <CardDescription>配置 Telegram 机器人集成</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="telegram-enabled" className="text-sm">启用</Label>
              <Switch
                id="telegram-enabled"
                checked={telegram.enabled}
                onCheckedChange={(checked) => updateIntegrationConfig({ telegram: { ...telegram, enabled: checked }})}
              />
            </div>
          </div>
        </CardHeader>
        {telegram.enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegram-bot-token">Bot Token</Label>
              <Input
                id="telegram-bot-token"
                type="password"
                value={telegram.bot_token || ''}
                onChange={(e) => updateIntegrationConfig({ telegram: { ...telegram, bot_token: e.target.value } })}
                placeholder="输入 Telegram Bot Token"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram-chat-id">Chat ID</Label>
              <Input
                id="telegram-chat-id"
                value={telegram.chat_id || ''}
                onChange={(e) => updateIntegrationConfig({ telegram: { ...telegram, chat_id: e.target.value } })}
                placeholder="聊天 ID"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telegram-api-id">API ID</Label>
                <Input
                  id="telegram-api-id"
                  value={telegram.api_id || ''}
                  onChange={(e) => updateIntegrationConfig({ telegram: { ...telegram, api_id: e.target.value } })}
                  placeholder="API ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram-api-hash">API Hash</Label>
                <Input
                  id="telegram-api-hash"
                  type="password"
                  value={telegram.api_hash || ''}
                  onChange={(e) => updateIntegrationConfig({ telegram: { ...telegram, api_hash: e.target.value } })}
                  placeholder="API Hash"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Slack 配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Slack Bot</CardTitle>
              <CardDescription>配置 Slack 机器人集成</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="slack-enabled" className="text-sm">启用</Label>
              <Switch
                id="slack-enabled"
                checked={slack.enabled}
                onCheckedChange={(checked) => updateIntegrationConfig({ slack: { ...slack, enabled: checked }})}
              />
            </div>
          </div>
        </CardHeader>
        {slack.enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slack-bot-token">Bot Token</Label>
              <Input
                id="slack-bot-token"
                type="password"
                value={slack.bot_token || ''}
                onChange={(e) => updateIntegrationConfig({ slack: { ...slack, bot_token: e.target.value } })}
                placeholder="xoxb-..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slack-team-id">Team ID</Label>
                <Input
                  id="slack-team-id"
                  value={slack.team_id || ''}
                  onChange={(e) => updateIntegrationConfig({ slack: { ...slack, team_id: e.target.value } })}
                  placeholder="T00000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slack-channel-id">Channel ID</Label>
                <Input
                  id="slack-channel-id"
                  value={slack.channel_id || ''}
                  onChange={(e) => updateIntegrationConfig({ slack: { ...slack, channel_id: e.target.value } })}
                  placeholder="C00000000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slack-signing-secret">Signing Secret</Label>
              <Input
                id="slack-signing-secret"
                type="password"
                value={slack.signing_secret || ''}
                onChange={(e) => updateIntegrationConfig({ slack: { ...slack, signing_secret: e.target.value } })}
                placeholder="Signing Secret"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* WhatsApp 配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>WhatsApp Bot</CardTitle>
              <CardDescription>配置 WhatsApp 机器人集成</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="whatsapp-enabled" className="text-sm">启用</Label>
              <Switch
                id="whatsapp-enabled"
                checked={whatsapp.enabled}
                onCheckedChange={(checked) => updateIntegrationConfig({ whatsapp: { ...whatsapp, enabled: checked }})}
              />
            </div>
          </div>
        </CardHeader>
        {whatsapp.enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone">Phone Number</Label>
              <Input
                id="whatsapp-phone"
                value={whatsapp.phone_number || ''}
                onChange={(e) => updateIntegrationConfig({ whatsapp: { ...whatsapp, phone_number: e.target.value } })}
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-auth-token">Auth Token</Label>
              <Input
                id="whatsapp-auth-token"
                type="password"
                value={whatsapp.auth_token || ''}
                onChange={(e) => updateIntegrationConfig({ whatsapp: { ...whatsapp, auth_token: e.target.value } })}
                placeholder="Auth Token"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-instance-id">Instance ID</Label>
              <Input
                id="whatsapp-instance-id"
                value={whatsapp.instance_id || ''}
                onChange={(e) => updateIntegrationConfig({ whatsapp: { ...whatsapp, instance_id: e.target.value } })}
                placeholder="Instance ID"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* QQ Bot 配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>QQ Bot</CardTitle>
              <CardDescription>配置 QQ 机器人集成</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="qq-enabled" className="text-sm">启用</Label>
              <Switch
                id="qq-enabled"
                checked={qqBot.enabled}
                onCheckedChange={(checked) => updateIntegrationConfig({ qq_bot: { ...qqBot, enabled: checked }})}
              />
            </div>
          </div>
        </CardHeader>
        {qqBot.enabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qq-app-id">App ID</Label>
                <Input
                  id="qq-app-id"
                  value={qqBot.app_id || ''}
                  onChange={(e) => updateIntegrationConfig({ qq_bot: { ...qqBot, app_id: e.target.value } })}
                  placeholder="App ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qq-app-secret">App Secret</Label>
                <Input
                  id="qq-app-secret"
                  type="password"
                  value={qqBot.app_secret || ''}
                  onChange={(e) => updateIntegrationConfig({ qq_bot: { ...qqBot, app_secret: e.target.value } })}
                  placeholder="App Secret"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qq-access-token">Access Token</Label>
              <Input
                id="qq-access-token"
                type="password"
                value={qqBot.access_token || ''}
                onChange={(e) => updateIntegrationConfig({ qq_bot: { ...qqBot, access_token: e.target.value } })}
                placeholder="Access Token"
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}