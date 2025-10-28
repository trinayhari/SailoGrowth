'use client'

import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import FlowCanvas from './FlowCanvas'
import NodeDetailsPanel from './NodeDetailsPanel'
import { Node } from '@xyflow/react'
import { MessageSquare, ChevronRight, ChevronLeft, Send, X } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function WorkflowView() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to your Workflow Builder! I can help you configure nodes, create workflows, and answer questions about your data pipeline.',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')

  const handleNodeSelect = (node: Node | null) => {
    setSelectedNode(node)
    if (node && !isChatOpen) {
      setIsChatOpen(true)
    }
    if (node) {
      const nodeData = node.data as any
      const nodeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `You selected **${nodeData.label}**\n\n${nodeData.description}\n\nCurrent state: ${nodeData.state}\n\nYou can now configure this module's settings in the panel above.`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, nodeMessage])
    }
  }

  const handleNodeUpdate = (nodeId: string, updates: any) => {
    // Log the update (in a real app, this would update the node in the workflow state)
    console.log('Updating node:', nodeId, updates)
    const updateMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ Configuration saved for **${(selectedNode?.data as any)?.label}**!\n\nYour settings have been updated successfully.`,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, updateMessage])
  }

  const handleSendMessage = () => {
    if (!input.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    // Simulate response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand you want to work on your workflow. How can I help you configure this pipeline?',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSendMessage()
    }
  }

  return (
    <ReactFlowProvider>
      <div className="relative h-screen bg-gray-50 flex">
        {/* Main Workflow Canvas */}
        <div 
          className="flex-1 transition-all duration-300"
          style={{ 
            marginRight: isChatOpen ? '400px' : '0px'
          }}
        >
          <FlowCanvas onNodeSelect={handleNodeSelect} />
        </div>

        {/* Collapsible Chat Sidebar */}
        <div 
          className={`fixed right-0 top-0 bottom-0 bg-white border-l border-gray-200 shadow-xl transition-all duration-300 flex flex-col z-50 ${
            isChatOpen ? 'w-96' : 'w-12'
          }`}
        >
          {/* Collapse Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="absolute -left-10 top-4 w-10 h-10 bg-white border border-gray-200 rounded-l-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            title={isChatOpen ? 'Collapse chat' : 'Expand chat'}
          >
            {isChatOpen ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {isChatOpen ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Workflow Assistant</h2>
                </div>
                {selectedNode && (
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Close node details"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Node Configuration Panel (if node selected) */}
              {selectedNode && (
                <div className="border-b border-gray-200 max-h-[60vh] overflow-y-auto">
                  <NodeDetailsPanel 
                    node={selectedNode} 
                    onClose={() => setSelectedNode(null)}
                    onUpdate={handleNodeUpdate}
                  />
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your workflow... (⌘+Enter to send)"
                    className="flex-1 resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                    title="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageSquare className="h-6 w-6 text-gray-400 rotate-90" />
            </div>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  )
}
