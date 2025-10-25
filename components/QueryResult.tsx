'use client'

import { useState } from 'react'
import { Code, Copy, Pin, ChevronDown, ChevronUp } from 'lucide-react'
import ChartRenderer from './ChartRenderer'
import { QueryResult as QueryResultType } from '../lib/sql-agent'

interface QueryResultProps {
  result: QueryResultType
  onFollowUp?: (question: string) => void
  onPin?: (result: QueryResultType) => void
  followUpSuggestions?: string[]
}

export default function QueryResult({ 
  result, 
  onFollowUp, 
  onPin, 
  followUpSuggestions = [] 
}: QueryResultProps) {
  const [showSQL, setShowSQL] = useState(false)
  const [copied, setCopied] = useState(false)

  const copySQL = async () => {
    await navigator.clipboard.writeText(result.sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Explanation */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <p className="text-blue-100">{result.explanation}</p>
      </div>

      {/* Chart/Data Visualization */}
      <ChartRenderer
        data={result.data}
        chartType={result.chartType || 'table'}
        config={result.chartConfig}
      />

      {/* SQL Query Toggle */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <button
          onClick={() => setShowSQL(!showSQL)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Code className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300">SQL Query</span>
          </div>
          {showSQL ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>
        
        {showSQL && (
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Generated SQL</span>
              <div className="flex space-x-2">
                <button
                  onClick={copySQL}
                  className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-300"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                {onPin && (
                  <button
                    onClick={() => onPin(result)}
                    className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-300"
                  >
                    <Pin className="h-3 w-3" />
                    <span>Pin</span>
                  </button>
                )}
              </div>
            </div>
            <pre className="bg-gray-900 p-3 rounded text-sm text-gray-300 overflow-x-auto">
              <code>{result.sql}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Follow-up Suggestions */}
      {followUpSuggestions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Follow-up questions:</h4>
          <div className="space-y-2">
            {followUpSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onFollowUp?.(suggestion)}
                className="block w-full text-left p-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Data Summary */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {result.data.length} row{result.data.length !== 1 ? 's' : ''} returned
        </span>
        <span>
          Chart type: {result.chartType || 'table'}
        </span>
      </div>
    </div>
  )
}
