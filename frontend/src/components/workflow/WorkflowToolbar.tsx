import { Save, Play, Stop, Settings, Layers, Eye, Code2 } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'

interface WorkflowToolbarProps {
  onTogglePalette: () => void
  onToggleProperties: () => void
  onToggleExecution: () => void
}

const WorkflowToolbar = ({
  onTogglePalette,
  onToggleProperties,
  onToggleExecution,
}: WorkflowToolbarProps) => {
  const {
    name,
    isModified,
    isExecuting,
    saveWorkflow,
    executeWorkflow,
    stopExecution,
  } = useWorkflowStore()

  const handleSave = async () => {
    try {
      await saveWorkflow()
      // TODO: Show success toast
    } catch (error) {
      // TODO: Show error toast
      console.error('Failed to save workflow:', error)
    }
  }

  const handleExecute = async () => {
    try {
      await executeWorkflow()
      onToggleExecution()
    } catch (error) {
      console.error('Failed to execute workflow:', error)
    }
  }

  return (
    <div className="toolbar border-b px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">
            {name}
            {isModified && <span className="text-yellow-500 ml-1">*</span>}
          </h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!isModified}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50 hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
              Save
            </button>

            {isExecuting ? (
              <button
                onClick={stopExecution}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                <Stop className="h-4 w-4" />
                Stop
              </button>
            ) : (
              <button
                onClick={handleExecute}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <Play className="h-4 w-4" />
                Execute
              </button>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePalette}
            className="p-2 hover:bg-muted rounded-md"
            title="Toggle Node Palette"
          >
            <Layers className="h-4 w-4" />
          </button>

          <button
            onClick={onToggleProperties}
            className="p-2 hover:bg-muted rounded-md"
            title="Toggle Properties Panel"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            onClick={onToggleExecution}
            className="p-2 hover:bg-muted rounded-md"
            title="Toggle Execution Panel"
          >
            <Eye className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-border mx-2" />

          <button className="p-2 hover:bg-muted rounded-md" title="View Code">
            <Code2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default WorkflowToolbar