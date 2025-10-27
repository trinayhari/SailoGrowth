'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, Minimize2, Maximize2, X } from 'lucide-react'
import { WorkflowNode } from '../lib/workflow-builder-types'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
}

interface ChatSidebarProps {
  selectedNode?: WorkflowNode | null
  onNodeUpdate?: (nodeId: string, updates: any) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export default function ChatSidebar({ 
  selectedNode, 
  onNodeUpdate, 
  isCollapsed = false,
  onToggleCollapse 
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (selectedNode) {
      const nodeMessage: Message = {
        id: Date.now().toString(),
        role: 'agent',
        content: `Selected **${selectedNode.data.title}** node. This component ${selectedNode.data.description.toLowerCase()}. Current status: ${selectedNode.data.status}. How can I help you configure this node?`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, nodeMessage])
    }
  }, [selectedNode])

  const handleSend = (question?: string) => {
    const queryText = question || input.trim()
    if (!queryText || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    if (!question) setInput('')
    setIsProcessing(true)

    // Simulate AI response
    setTimeout(() => {
      let response = ''
      
      if (selectedNode) {
        response = `I understand you want to work with the ${selectedNode.data.title} node. `
        
        if (queryText.toLowerCase().includes('configure') || queryText.toLowerCase().includes('setup')) {
          response += `To configure this node, you'll need to set up the following parameters: ${selectedNode.inputs.join(', ')}. This will enable it to produce: ${selectedNode.outputs.join(', ')}.`
        } else if (queryText.toLowerCase().includes('connect')) {
          response += `This node can connect to other nodes that provide: ${selectedNode.inputs.join(', ')}. It will output: ${selectedNode.outputs.join(', ')} for downstream nodes.`
        } else {
          response += `This node handles: ${selectedNode.data.description}. The expected outcome is: ${selectedNode.data.outcome}. What specific aspect would you like to configure?`
        }
      } else {
        response = `I can help you build your growth engineering workflow. Try selecting a node on the canvas to configure it, or ask me about connecting different components together.`
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, agentMessage])
      setIsProcessing(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isCollapsed) {
    return (
      <div className="w-12 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          title="Expand chat"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Workflow Assistant
            </h2>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Collapse chat"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {selectedNode && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">{selectedNode.data.icon}</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {selectedNode.data.title}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Workflow Assistant
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select a node or ask me about building your workflow
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'user' ? (
              <div className="bg-blue-500 text-white rounded-lg px-3 py-2 max-w-[80%] text-sm">
                {message.content}
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 max-w-[90%] text-sm">
                {message.content}
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about workflow configuration..."
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none text-sm"
              rows={2}
              disabled={isProcessing}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isProcessing}
            className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          ⌘+Enter to send
        </div>
      </div>
    </div>
  )
}
