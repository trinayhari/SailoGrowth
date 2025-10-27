'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Database, TrendingUp, AlertCircle } from 'lucide-react'
import QueryResult from './QueryResult'
import ChatHeader from './ChatHeader'
import WorkflowPanel from './WorkflowPanel'
import { QueryResult as QueryResultType } from '../lib/sql-agent'
import { mockQueryResults, mockFollowUps } from '../lib/mock-data'
import { WorkflowCapability, WorkflowState } from '../lib/workflow-types'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  queryResult?: QueryResultType
  timestamp: Date
}

export default function DemoChatView() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([])
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getMockResult = (question: string): QueryResultType | null => {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('daily active users') || lowerQuestion.includes('dau')) {
      return mockQueryResults['daily active users']
    } else if (lowerQuestion.includes('activation rate') || lowerQuestion.includes('activation')) {
      return mockQueryResults['activation rate']
    } else if (lowerQuestion.includes('top features') || lowerQuestion.includes('features')) {
      return mockQueryResults['top features']
    }
    
    return null
  }

  const handleSend = async (question?: string) => {
    const queryText = question || input.trim()
    if (!queryText || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!question) setInput('')
    setIsProcessing(true)

    // Simulate processing delay
    setTimeout(() => {
      const mockResult = getMockResult(queryText)
      
      if (mockResult) {
        setFollowUpSuggestions(mockFollowUps)
        
        const connectionNote = selectedConnectionId 
          ? ` (Using connection: ${selectedConnectionId})`
          : ' (No connection selected - using demo data)'
        
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content: mockResult.explanation + connectionNote,
          queryResult: mockResult,
          timestamp: new Date(),
        }
        
        setMessages((prev) => [...prev, agentMessage])
      } else {
        const connectionStatus = selectedConnectionId 
          ? `If you had a real connection selected (${selectedConnectionId}), I would query that database. `
          : 'Please select a connection from the dropdown above to query real data. '
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content: `I understand you're asking about "${queryText}". ${connectionStatus}For now, try asking about "daily active users", "activation rate", or "top features" to see the demo in action!`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
      
      setIsProcessing(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFollowUp = (question: string) => {
    handleSend(question)
  }

  const handlePin = (result: QueryResultType) => {
    console.log('Pinning result:', result)
    // In a real app, this would save to dashboard
  }

  const handleCapabilityClick = (capability: WorkflowCapability) => {
    // Add a message about the clicked capability
    const capabilityMessage: Message = {
      id: Date.now().toString(),
      role: 'agent',
      content: `You clicked on **${capability.title}** (${capability.icon}). This capability handles: ${capability.description}. Current status: ${capability.status}. ${capability.isActive ? 'This is currently the active capability in your workflow.' : ''}`,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, capabilityMessage])
  }

  const handleWorkflowUpdate = (state: WorkflowState) => {
    setWorkflowState(state)
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      <ChatHeader
        selectedConnectionId={selectedConnectionId}
        onConnectionChange={setSelectedConnectionId}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto pb-32">
            <div className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Database className="h-12 w-12 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Analytics Agent Demo
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  Ask questions about your data in natural language
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/30 rounded-lg p-4 mb-8 max-w-md mx-auto">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Demo Mode:</strong> This is using mock data. In production, it would connect to your actual database.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  <button
                    onClick={() => setInput('Show me daily active users for the last 30 days')}
                    className="flex items-center space-x-3 text-left px-4 py-4 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span>Show me daily active users for the last 30 days</span>
                  </button>
                  <button
                    onClick={() => setInput('What is our activation rate by region?')}
                    className="flex items-center space-x-3 text-left px-4 py-4 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <Database className="h-5 w-5 text-green-500" />
                    <span>What is our activation rate by region?</span>
                  </button>
                  <button
                    onClick={() => setInput('Show me the top 10 features by usage')}
                    className="flex items-center space-x-3 text-left px-4 py-4 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <span>Show me the top 10 features by usage</span>
                  </button>
                  <button
                    onClick={() => setInput('Alert me if conversion rate drops below 5%')}
                    className="flex items-center space-x-3 text-left px-4 py-4 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span>Try a custom query (demo response)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-8 flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'user' ? (
                <div className="bg-blue-100 dark:bg-blue-600/20 text-gray-900 dark:text-gray-100 rounded-2xl px-4 py-3 max-w-[70%] border border-blue-200 dark:border-blue-500/30">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              ) : (
                <div className="w-full max-w-[90%]">
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-800 mb-4">
                    <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                      {message.content}
                    </p>
                  </div>
                  
                  {message.queryResult && (
                    <QueryResult
                      result={message.queryResult}
                      onFollowUp={handleFollowUp}
                      onPin={handlePin}
                      followUpSuggestions={followUpSuggestions}
                    />
                  )}
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start mb-6">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing your query and generating SQL...</span>
                </div>
              </div>
            </div>
          )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="fixed bottom-0 left-0 right-80 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about your data... (⌘+Enter to send)"
                    className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl px-4 py-3 pr-12 border border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none min-h-[52px] max-h-32 text-sm"
                    rows={1}
                    disabled={isProcessing}
                  />
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isProcessing}
                  className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600 text-white rounded-2xl transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Panel */}
        <WorkflowPanel
          onCapabilityClick={handleCapabilityClick}
          onWorkflowUpdate={handleWorkflowUpdate}
        />
      </div>
    </div>
  )
}
