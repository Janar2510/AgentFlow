import { useState } from 'react'
import { PlayCircle, StopCircle, RotateCcw, FileText } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'

const ExecutionPanel = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'output' | 'errors'>('logs')
  const { isExecuting, executionStatus } = useWorkflowStore()

  const mockLogs = [
    { id: 1, timestamp: '2024-01-15 10:30:15', level: 'INFO', message: 'Workflow execution started' },
    { id: 2, timestamp: '2024-01-15 10:30:16', level: 'INFO', message: 'Processing input node...' },
    { id: 3, timestamp: '2024-01-15 10:30:17', level: 'INFO', message: 'Calling AI agent with prompt...' },
    { id: 4, timestamp: '2024-01-15 10:30:20', level: 'SUCCESS', message: 'AI agent response received' },
    { id: 5, timestamp: '2024-01-15 10:30:21', level: 'INFO', message: 'Processing output node...' },
    { id: 6, timestamp: '2024-01-15 10:30:22', level: 'SUCCESS', message: 'Workflow execution completed successfully' },
  ]

  const mockOutput = {
    result: "Hello! I'm an AI assistant ready to help you with your tasks.",
    metadata: {
      executionTime: "7.2s",
      tokensUsed: 156,
      cost: "$0.0032"
    }
  }

  const getStatusColor = () => {
    switch (executionStatus) {
      case 'running': return 'text-blue-500'
      case 'success': return 'text-green-500'
      case 'error': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusText = () => {
    switch (executionStatus) {
      case 'running': return 'Running...'
      case 'success': return 'Completed'
      case 'error': return 'Failed'
      default: return 'Ready'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Execution</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isExecuting ? 'bg-blue-500 animate-pulse' : 
              executionStatus === 'success' ? 'bg-green-500' :
              executionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`} />
            <span className={`text-sm ${getStatusColor()}`}>{getStatusText()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExecuting ? (
            <button className="flex items-center gap-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
              <StopCircle className="h-4 w-4" />
              Stop
            </button>
          ) : (
            <button className="flex items-center gap-2 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
              <PlayCircle className="h-4 w-4" />
              Run
            </button>
          )}
          
          <button className="p-1 hover:bg-muted rounded" title="Clear">
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button className="p-1 hover:bg-muted rounded" title="Export Logs">
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {(['logs', 'output', 'errors'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'logs' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="space-y-2 font-mono text-xs">
              {mockLogs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-muted-foreground">{log.timestamp}</span>
                  <span className={`font-medium ${
                    log.level === 'ERROR' ? 'text-red-500' :
                    log.level === 'SUCCESS' ? 'text-green-500' :
                    log.level === 'WARN' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`}>
                    [{log.level}]
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'output' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Result</h4>
                <div className="p-3 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{mockOutput.result}</pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Metadata</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-2 bg-muted rounded">
                    <div className="font-medium">Execution Time</div>
                    <div className="text-muted-foreground">{mockOutput.metadata.executionTime}</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="font-medium">Tokens Used</div>
                    <div className="text-muted-foreground">{mockOutput.metadata.tokensUsed}</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="font-medium">Cost</div>
                    <div className="text-muted-foreground">{mockOutput.metadata.cost}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="text-center text-muted-foreground py-8">
              <div className="text-2xl mb-2">✅</div>
              <p>No errors in the last execution</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExecutionPanel