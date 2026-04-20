export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Hermes Console</h1>
      <p>中控台后端 API 服务已启动</p>
      <h2>API 端点</h2>
      <ul>
        <li><code>GET /api/config</code> - 获取完整配置</li>
        <li><code>PUT /api/config</code> - 更新配置</li>
        <li><code>POST /api/config/backup</code> - 创建备份</li>
        <li><code>POST /api/config/restore</code> - 恢复备份</li>
        <li><code>GET /api/config/backup/list</code> - 列出备份</li>
      </ul>
    </main>
  );
}
