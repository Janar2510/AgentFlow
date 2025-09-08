import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Zap, Users, BarChart3, Settings } from 'lucide-react'

const Dashboard = () => {
  const [stats] = useState({
    workflows: 12,
    activeAgents: 8,
    executionsToday: 156,
    successRate: 94.2,
  })

  const recentWorkflows = [
    { id: '1', name: 'Customer Onboarding', status: 'active', lastRun: '2 hours ago' },
    { id: '2', name: 'Data Processing Pipeline', status: 'idle', lastRun: '1 day ago' },
    { id: '3', name: 'Marketing Automation', status: 'running', lastRun: 'Running now' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gradient">AgentFlow</h1>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-sm font-medium text-foreground">
                  Dashboard
                </Link>
                <Link to="/workflows" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Workflows
                </Link>
                <Link to="/agents" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Agents
                </Link>
                <Link to="/analytics" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Analytics
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/workflows/new"
                className="btn-primary px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Workflow
              </Link>
              <Link to="/settings" className="p-2 hover:bg-muted rounded-md">
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">
            Manage your AI workflows and monitor agent performance from your dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.workflows}</p>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeAgents}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.executionsToday}</p>
                <p className="text-sm text-muted-foreground">Executions Today</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Workflows */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Workflows</h3>
              <Link
                to="/workflows"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        workflow.status === 'active'
                          ? 'bg-green-500'
                          : workflow.status === 'running'
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-gray-400'
                      }`}
                    />
                    <div>
                      <p className="font-medium">{workflow.name}</p>
                      <p className="text-sm text-muted-foreground">{workflow.lastRun}</p>
                    </div>
                  </div>
                  <Link
                    to={`/workflows/${workflow.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <Link
                to="/workflows/new"
                className="flex items-center gap-4 p-4 border-2 border-dashed border-muted hover:border-primary rounded-lg transition-colors group"
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                  <Plus className="h-5 w-5 text-primary group-hover:text-white" />
                </div>
                <div>
                  <p className="font-medium">Create New Workflow</p>
                  <p className="text-sm text-muted-foreground">
                    Start building with our visual designer
                  </p>
                </div>
              </Link>

              <Link
                to="/agents"
                className="flex items-center gap-4 p-4 border-2 border-dashed border-muted hover:border-secondary rounded-lg transition-colors group"
              >
                <div className="p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary group-hover:text-white transition-colors">
                  <Users className="h-5 w-5 text-secondary group-hover:text-white" />
                </div>
                <div>
                  <p className="font-medium">Browse Agent Marketplace</p>
                  <p className="text-sm text-muted-foreground">
                    Discover and install new agents
                  </p>
                </div>
              </Link>

              <Link
                to="/analytics"
                className="flex items-center gap-4 p-4 border-2 border-dashed border-muted hover:border-accent rounded-lg transition-colors group"
              >
                <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent group-hover:text-white transition-colors">
                  <BarChart3 className="h-5 w-5 text-accent group-hover:text-white" />
                </div>
                <div>
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Monitor performance and insights
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard