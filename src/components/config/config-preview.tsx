'use client';

import { useConfigStore } from '@/store/config-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import yaml from 'js-yaml';

export function ConfigPreview() {
  const { config, originalConfig, isDirty } = useConfigStore();

  const currentYaml = yaml.dump(config, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });

  const originalYaml = yaml.dump(originalConfig, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });

  // Simple line-by-line diff
  const currentLines = currentYaml.split('\n');
  const originalLines = originalYaml.split('\n');
  const maxLines = Math.max(currentLines.length, originalLines.length);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>配置预览</CardTitle>
          <div className="flex gap-2">
            {isDirty && (
              <Badge variant="secondary" className="text-xs">
                已修改
              </Badge>
            )}
            <Badge variant="outline">YAML</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-sm font-mono bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
          <code>
            {isDirty ? (
              // Show diff when there are changes
              currentLines.map((line, i) => {
                const isChanged = line !== originalLines[i];
                return (
                  <span
                    key={i}
                    className={isChanged ? 'text-yellow-400 bg-yellow-400/10' : 'text-muted-foreground'}
                  >
                    {line}
                    {'\n'}
                  </span>
                );
              })
            ) : (
              <span className="text-muted-foreground">
                {currentYaml}
              </span>
            )}
          </code>
        </pre>
        {isDirty && (
          <p className="text-xs text-muted-foreground mt-2">
            高亮显示的为已修改的配置项
          </p>
        )}
      </CardContent>
    </Card>
  );
}
