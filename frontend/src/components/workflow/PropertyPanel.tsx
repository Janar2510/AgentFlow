interface PropertyPanelProps {
  selectedNodes: string[]
  selectedEdges: string[]
}

const PropertyPanel = ({ selectedNodes, selectedEdges }: PropertyPanelProps) => {
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0

  if (!hasSelection) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm">Select a node or edge to view properties</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Properties</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {selectedNodes.length > 0 
            ? `${selectedNodes.length} node(s) selected`
            : `${selectedEdges.length} edge(s) selected`
          }
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Node Properties */}
        {selectedNodes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Node Configuration</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  defaultValue="Untitled Node"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                  placeholder="Describe what this node does..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full px-3 py-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="input">Input</option>
                  <option value="output">Output</option>
                  <option value="process">Process</option>
                  <option value="condition">Condition</option>
                  <option value="ai">AI Agent</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Agent-specific Properties */}
        {selectedNodes.length === 1 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Agent Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <select className="w-full px-3 py-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                  <option value="llama-2">Llama 2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Temperature</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.0</span>
                  <span>1.0</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Tokens</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  defaultValue="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">System Prompt</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={4}
                  placeholder="You are a helpful AI assistant..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Edge Properties */}
        {selectedEdges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Connection Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Optional label"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Condition</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                  placeholder="Optional condition for this connection..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="animated" className="rounded" />
                <label htmlFor="animated" className="text-sm">Animated</label>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t space-y-2">
          <button className="w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
            Apply Changes
          </button>
          <button className="w-full px-3 py-2 text-sm border border-input rounded hover:bg-muted">
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  )
}

export default PropertyPanel