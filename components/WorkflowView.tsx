'use client'

import { useState } from 'react'
import WorkflowBuilder from './WorkflowBuilder'
import ChatSidebar from './ChatSidebar'
import { WorkflowNode, WorkflowBuilderState } from '../lib/workflow-builder-types'

export default function WorkflowView() {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [workflowState, setWorkflowState] = useState<WorkflowBuilderState | null>(null)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)

  const handleNodeSelect = (node: WorkflowNode | null) => {
    setSelectedNode(node)
  }

  const handleWorkflowChange = (state: WorkflowBuilderState) => {
    setWorkflowState(state)
  }

  const handleNodeUpdate = (nodeId: string, updates: any) => {
    // TODO: Implement node updates through the workflow manager
    console.log('Update node:', nodeId, updates)
  }

  const toggleChatCollapse = () => {
    setIsChatCollapsed(!isChatCollapsed)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Workflow Builder */}
      <WorkflowBuilder
        onNodeSelect={handleNodeSelect}
        onWorkflowChange={handleWorkflowChange}
      />

      {/* Chat Sidebar */}
      <ChatSidebar
        selectedNode={selectedNode}
        onNodeUpdate={handleNodeUpdate}
        isCollapsed={isChatCollapsed}
        onToggleCollapse={toggleChatCollapse}
      />
    </div>
  )
}
