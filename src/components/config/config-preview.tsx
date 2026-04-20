'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import yaml from 'js-yaml';

export function ConfigPreview() {
  const { config } = useConfigStore();

  const yamlContent = yaml.dump(config, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>配置预览</CardTitle>
          <Badge variant="outline">YAML</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-sm font-mono bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
          <code>{yamlContent}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
