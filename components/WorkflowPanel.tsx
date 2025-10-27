'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Play, Pause, RotateCcw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { WorkflowCapability, WorkflowState, WorkflowManager } from '../lib/workflow-types'

interface WorkflowPanelProps {
  onCapabilityClick?: (capability: WorkflowCapability) => void
  onWorkflowUpdate?: (state: WorkflowState) => void
}

export default function WorkflowPanel({ onCapabilityClick, onWorkflowUpdate }: WorkflowPanelProps) {
  const [workflowManager] = useState(() => new WorkflowManager())
  const [workflowState, setWorkflowState] = useState<WorkflowState>(workflowManager.getState())
  const [expandedCapabilities, setExpandedCapabilities] = useState<Set<string>>(new Set())

  useEffect(() => {
    const updateState = () => {
      const newState = workflowManager.getState()
      setWorkflowState(newState)
      onWorkflowUpdate?.(newState)
    }

    updateState()
  }, [workflowManager, onWorkflowUpdate])

  const handleStartWorkflow = () => {
    workflowManager.startWorkflow()
    setWorkflowState(workflowManager.getState())
  }

  const handleStopWorkflow = () => {
    workflowManager.stopWorkflow()
    setWorkflowState(workflowManager.getState())
  }

  const handleResetWorkflow = () => {
    workflowManager.resetWorkflow()
    setWorkflowState(workflowManager.getState())
  }

  const handleCapabilityClick = (capability: WorkflowCapability) => {
    onCapabilityClick?.(capability)
  }

  const toggleCapabilityExpanded = (id: string) => {
    const newExpanded = new Set(expandedCapabilities)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCapabilities(newExpanded)
  }

  const getStatusIcon = (status: WorkflowCapability['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: WorkflowCapability['status'], isActive?: boolean) => {
    if (isActive) return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    
    switch (status) {
      case 'completed':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
      case 'in-progress':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
      case 'error':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
      default:
        return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }
  }

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Growth Workflow
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetWorkflow}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Reset workflow"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            {workflowState.isRunning ? (
              <button
                onClick={handleStopWorkflow}
                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Stop workflow"
              >
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleStartWorkflow}
                className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                title="Start workflow"
              >
                <Play className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Build and manage your analytics pipeline
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {workflowState.capabilities.map((capability, index) => {
            const isExpanded = expandedCapabilities.has(capability.id)
            const isCurrentStep = index === workflowState.currentStep
            const showConnector = index < workflowState.capabilities.length - 1

            return (
              <div key={capability.id} className="relative">
                {/* Capability Card */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getStatusColor(capability.status, capability.isActive)}`}
                  onClick={() => handleCapabilityClick(capability)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{capability.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {capability.title}
                        </h3>
                        {capability.isActive && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Currently Active
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(capability.status)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleCapabilityExpanded(capability.id)
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {capability.description}
                  </p>

                  {/* Outcome */}
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    → {capability.outcome}
                  </div>

                  {/* Progress Bar */}
                  {capability.progress !== undefined && capability.progress > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{capability.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${capability.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && capability.details && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Implementation Steps:
                      </h4>
                      <ul className="space-y-1">
                        {capability.details.map((detail, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Flow Connector */}
                {showConnector && (
                  <div className="flex justify-center my-2">
                    <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Status */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Step {workflowState.currentStep + 1} of {workflowState.capabilities.length}
          </span>
          
          <div className="flex items-center gap-2">
            {workflowState.isRunning && (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs">Running</span>
              </div>
            )}
            
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Updated {workflowState.lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
