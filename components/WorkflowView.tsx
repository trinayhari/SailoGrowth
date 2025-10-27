'use client'

import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import FlowCanvas from './FlowCanvas'
import NodeDetailsPanel from './NodeDetailsPanel'
import { Node } from '@xyflow/react'

export default function WorkflowView() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const handleNodeSelect = (node: Node | null) => {
    setSelectedNode(node)
  }

  const handleCloseDetails = () => {
    setSelectedNode(null)
  }

  return (
    <ReactFlowProvider>
      <div className="relative h-screen bg-gray-50">
        {/* Main Workflow Canvas */}
        <FlowCanvas onNodeSelect={handleNodeSelect} />

        {/* Node Details Panel */}
        {selectedNode && (
          <NodeDetailsPanel 
            node={selectedNode} 
            onClose={handleCloseDetails}
          />
        )}
      </div>
    </ReactFlowProvider>
  )
}
