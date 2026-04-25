'use client';

import { AgentStatusCard } from './agent-status-card';
import type { Agent } from '@/types/monitoring';

interface AgentStatusListProps {
  agents: Agent[];
  selectedAgentId?: string;
  onSelectAgent?: (agentId: string) => void;
}

export function AgentStatusList({
  agents,
  selectedAgentId,
  onSelectAgent,
}: AgentStatusListProps) {
  const sortedAgents = [...agents].sort((a, b) => {
    const statusOrder = { error: 0, busy: 1, online: 2, offline: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Agent 状态</h3>
        <span className="text-sm text-muted-foreground">
          {agents.length} 个 Agent
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAgents.map((agent) => (
          <AgentStatusCard
            key={agent.id}
            agent={agent}
            onClick={() => onSelectAgent?.(agent.id)}
          />
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          暂无 Agent 数据
        </div>
      )}
    </div>
  );
}
