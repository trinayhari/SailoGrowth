'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Database, TrendingUp, AlertCircle } from 'lucide-react'
import QueryResult from './QueryResult'
import { SQLAgent, QueryResult as QueryResultType } from '../lib/sql-agent'
import { SchemaService } from '../lib/schema-service'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  queryResult?: QueryResultType
  timestamp: Date
}

function ChatView() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([])
  const [conversationContext, setConversationContext] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize services (in a real app, these would come from context/props)
  const schemaService = new SchemaService(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  const sqlAgent = new SQLAgent(
    process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    schemaService
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    try {
      // Generate SQL and execute query
      const result = await sqlAgent.generateQuery(queryText, conversationContext)
      
      // Get follow-up suggestions
      const suggestions = await sqlAgent.suggestFollowUp(queryText, result)
      setFollowUpSuggestions(suggestions)
      
      // Update conversation context
      setConversationContext(prev => `${prev}\nUser asked: ${queryText}\nResult: ${result.explanation}`)

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: result.explanation,
        queryResult: result,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, agentMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try rephrasing your question or check your database connection.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
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
    // TODO: Implement pinning functionality
    console.log('Pinning result:', result)
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Database className="h-12 w-12 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-100 mb-2">
                  Analytics Agent
                </h1>
                <p className="text-gray-400 text-lg mb-8">
                  Ask questions about your data in natural language
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  <button
                    onClick={() => setInput('Show me daily active users for the last 30 days')}
                    className="flex items-center space-x-3 text-left px-4 py-4 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 text-sm text-gray-300 transition-colors"
                  >
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    <span>Show me daily active users for the last 30 days</span>
                  </button>
                  <button
                    onClick={() => setInput('What is our activation rate by region?')}
                    className="flex items-center space-x-3 text-left px-4 py-4 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 text-sm text-gray-300 transition-colors"
                  >
                    <Database className="h-5 w-5 text-green-400" />
                    <span>What is our activation rate by region?</span>
                  </button>
                  <button
                    onClick={() => setInput('Show me the top 10 features by usage')}
                    className="flex items-center space-x-3 text-left px-4 py-4 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 text-sm text-gray-300 transition-colors"
                  >
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    <span>Show me the top 10 features by usage</span>
                  </button>
                  <button
                    onClick={() => setInput('Alert me if conversion rate drops below 5%')}
                    className="flex items-center space-x-3 text-left px-4 py-4 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 text-sm text-gray-300 transition-colors"
                  >
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span>Alert me if conversion rate drops below 5%</span>
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
                <div className="bg-blue-600/20 text-gray-100 rounded-2xl px-4 py-3 max-w-[70%] border border-blue-500/30">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              ) : (
                <div className="w-full max-w-[90%]">
                  <div className="bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-800 mb-4">
                    <p className="text-sm leading-relaxed text-gray-200">
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
              <div className="bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-800">
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
                  <span className="text-sm text-gray-400">Analyzing your query and generating SQL...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-sm border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your data... (⌘+Enter to send)"
                className="w-full bg-gray-900 text-gray-100 rounded-2xl px-4 py-3 pr-12 border border-gray-800 focus:border-blue-500 focus:outline-none resize-none min-h-[52px] max-h-32 text-sm"
                rows={1}
                disabled={isProcessing}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isProcessing}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-2xl transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatView
