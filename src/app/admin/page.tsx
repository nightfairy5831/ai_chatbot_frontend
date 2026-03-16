import DashboardTab from './DashboardTab'
import UsersTab from './UsersTab'
import AgentsTab from './AgentsTab'
import LogsTab from './LogsTab'

function Admin({ onLogout, activeTab = 'dashboard', testAgentId, onTestAgent }: {
  onLogout: () => void
  activeTab?: 'dashboard' | 'users' | 'agents' | 'logs'
  testAgentId?: number | null
  onTestAgent?: (agentId: number) => void
}) {
  const tab = activeTab === 'dashboard' ? 'overview' : activeTab

  const title = tab === 'overview' ? 'Admin Dashboard' : tab === 'users' ? 'Users' : tab === 'agents' ? 'Agents' : 'Activity Logs'

  return (
    <div>
      <div className="dashboard-header">
        <h2>{title}</h2>
      </div>

      {tab === 'overview' && <DashboardTab onLogout={onLogout} testAgentId={testAgentId} />}
      {tab === 'users' && <UsersTab onLogout={onLogout} />}
      {tab === 'agents' && <AgentsTab onLogout={onLogout} onTestAgent={onTestAgent} />}
      {tab === 'logs' && <LogsTab onLogout={onLogout} />}
    </div>
  )
}

export default Admin
