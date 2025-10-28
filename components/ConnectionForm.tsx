// @ts-nocheck
'use client'

import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Connection, ConnectionType, CONNECTION_TYPES } from '../lib/connections'

interface ConnectionFormProps {
  connection?: Connection | null
  onSave: (connectionData: any) => void
  onCancel: () => void
}

export default function ConnectionForm({ connection, onSave, onCancel }: ConnectionFormProps) {
  const [selectedType, setSelectedType] = useState<ConnectionType>(connection?.type || 'supabase')
  const [formData, setFormData] = useState({
    name: connection?.name || '',
    description: connection?.description || '',
    isActive: connection?.isActive ?? true,
    config: connection?.config || {}
  })
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const config = formData.config as any

    if (!formData.name.trim()) {
      newErrors.name = 'Connection name is required'
    }

    // Type-specific validation
    switch (selectedType) {
      case 'supabase':
        if (!config.url) newErrors.url = 'Supabase URL is required'
        if (!config.anonKey) newErrors.anonKey = 'Anonymous key is required'
        break
      case 'postgresql':
      case 'mysql':
        if (!config.host) newErrors.host = 'Host is required'
        if (!config.database) newErrors.database = 'Database name is required'
        if (!config.username) newErrors.username = 'Username is required'
        if (!config.password) newErrors.password = 'Password is required'
        break
      case 'bigquery':
        if (!formData.config.projectId) newErrors.projectId = 'Project ID is required'
        if (!formData.config.datasetId) newErrors.datasetId = 'Dataset ID is required'
        if (!formData.config.keyFile) newErrors.keyFile = 'Service account key is required'
        break
      case 'posthog':
        if (!formData.config.apiKey) newErrors.apiKey = 'API key is required'
        if (!formData.config.host) newErrors.host = 'Host is required'
        if (!formData.config.projectId) newErrors.projectId = 'Project ID is required'
        break
      case 'snowflake':
        if (!formData.config.account) newErrors.account = 'Account is required'
        if (!formData.config.username) newErrors.username = 'Username is required'
        if (!formData.config.password) newErrors.password = 'Password is required'
        if (!formData.config.database) newErrors.database = 'Database is required'
        if (!formData.config.warehouse) newErrors.warehouse = 'Warehouse is required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSave({
      ...formData,
      type: selectedType
    })
  }

  const renderConfigFields = () => {
    switch (selectedType) {
      case 'supabase':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Supabase URL *
              </label>
              <input
                type="url"
                value={formData.config.url || ''}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
              />
              {errors.url && <p className="text-red-400 text-sm mt-1">{errors.url}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Anonymous Key *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.anonKey ? 'text' : 'password'}
                  value={formData.config.anonKey || ''}
                  onChange={(e) => handleConfigChange('anonKey', e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('anonKey')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                >
                  {showPasswords.anonKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.anonKey && <p className="text-red-400 text-sm mt-1">{errors.anonKey}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Role Key (Optional)
              </label>
              <div className="relative">
                <input
                  type={showPasswords.serviceKey ? 'text' : 'password'}
                  value={formData.config.serviceKey || ''}
                  onChange={(e) => handleConfigChange('serviceKey', e.target.value)}
                  placeholder="For admin operations (optional)"
                  className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('serviceKey')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                >
                  {showPasswords.serviceKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        )

      case 'postgresql':
      case 'mysql':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Host *
                </label>
                <input
                  type="text"
                  value={formData.config.host || ''}
                  onChange={(e) => handleConfigChange('host', e.target.value)}
                  placeholder="localhost"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                {errors.host && <p className="text-red-400 text-sm mt-1">{errors.host}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  value={formData.config.port || (selectedType === 'postgresql' ? 5432 : 3306)}
                  onChange={(e) => handleConfigChange('port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Database *
              </label>
              <input
                type="text"
                value={(formData.config as any).database || ''}
                onChange={(e) => handleConfigChange('database', e.target.value)}
                placeholder="my_database"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
              />
              {errors.database && <p className="text-red-400 text-sm mt-1">{errors.database}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.config.username || ''}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                  placeholder="username"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.password ? 'text' : 'password'}
                    value={formData.config.password || ''}
                    onChange={(e) => handleConfigChange('password', e.target.value)}
                    placeholder="password"
                    className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                  >
                    {showPasswords.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ssl"
                checked={formData.config.ssl || false}
                onChange={(e) => handleConfigChange('ssl', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="ssl" className="text-sm text-gray-300">
                Use SSL connection
              </label>
            </div>
          </>
        )

      case 'bigquery':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project ID *
                </label>
                <input
                  type="text"
                  value={formData.config.projectId || ''}
                  onChange={(e) => handleConfigChange('projectId', e.target.value)}
                  placeholder="my-project-id"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                {errors.projectId && <p className="text-red-400 text-sm mt-1">{errors.projectId}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dataset ID *
                </label>
                <input
                  type="text"
                  value={formData.config.datasetId || ''}
                  onChange={(e) => handleConfigChange('datasetId', e.target.value)}
                  placeholder="my_dataset"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                {errors.datasetId && <p className="text-red-400 text-sm mt-1">{errors.datasetId}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Account Key (JSON) *
              </label>
              <textarea
                value={formData.config.keyFile || ''}
                onChange={(e) => handleConfigChange('keyFile', e.target.value)}
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                rows={6}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
              {errors.keyFile && <p className="text-red-400 text-sm mt-1">{errors.keyFile}</p>}
            </div>
          </>
        )

      case 'posthog':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.apiKey ? 'text' : 'password'}
                  value={formData.config.apiKey || ''}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  placeholder="phc_..."
                  className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('apiKey')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                >
                  {showPasswords.apiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.apiKey && <p className="text-red-400 text-sm mt-1">{errors.apiKey}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Host *
                </label>
                <input
                  type="url"
                  value={formData.config.host || 'https://app.posthog.com'}
                  onChange={(e) => handleConfigChange('host', e.target.value)}
                  placeholder="https://app.posthog.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                {errors.host && <p className="text-red-400 text-sm mt-1">{errors.host}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project ID *
                </label>
                <input
                  type="text"
                  value={formData.config.projectId || ''}
                  onChange={(e) => handleConfigChange('projectId', e.target.value)}
                  placeholder="12345"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                {errors.projectId && <p className="text-red-400 text-sm mt-1">{errors.projectId}</p>}
              </div>
            </div>
          </>
        )

      case 'snowflake':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account *
                </label>
                <input
                  type="text"
                  value={formData.config.account || ''}
                  onChange={(e) => handleConfigChange('account', e.target.value)}
                  placeholder="xy12345.us-east-1"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                {errors.account && <p className="text-red-400 text-sm mt-1">{errors.account}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Warehouse *
                </label>
                <input
                  type="text"
                  value={(formData.config as any).warehouse || ''}
                  onChange={(e) => handleConfigChange('warehouse', e.target.value)}
                  placeholder="COMPUTE_WH"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                {errors.warehouse && <p className="text-red-400 text-sm mt-1">{errors.warehouse}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Database *
                </label>
                <input
                  type="text"
                  value={formData.config.database || ''}
                  onChange={(e) => handleConfigChange('database', e.target.value)}
                  placeholder="MY_DATABASE"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                {errors.database && <p className="text-red-400 text-sm mt-1">{errors.database}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Schema
                </label>
                <input
                  type="text"
                  value={formData.config.schema || 'PUBLIC'}
                  onChange={(e) => handleConfigChange('schema', e.target.value)}
                  placeholder="PUBLIC"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.config.username || ''}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                  placeholder="username"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.password ? 'text' : 'password'}
                    value={formData.config.password || ''}
                    onChange={(e) => handleConfigChange('password', e.target.value)}
                    placeholder="password"
                    className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                  >
                    {showPasswords.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role (Optional)
              </label>
              <input
                type="text"
                value={formData.config.role || ''}
                onChange={(e) => handleConfigChange('role', e.target.value)}
                placeholder="ACCOUNTADMIN"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              {connection ? 'Edit Connection' : 'Add Connection'}
            </h1>
            <p className="text-gray-400 mt-1">
              Configure your data source connection
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Connection Type Selection */}
            {!connection && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Connection Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(CONNECTION_TYPES).map(([type, info]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type as ConnectionType)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selectedType === type
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">{info.icon}</div>
                      <div className="font-medium text-gray-100">{info.name}</div>
                      <div className="text-sm text-gray-400">{info.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-100">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Connection Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Production Database"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this connection"
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-300">
                  Enable this connection
                </label>
              </div>
            </div>

            {/* Connection Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-100">
                {CONNECTION_TYPES[selectedType]?.name} Configuration
              </h3>
              {renderConfigFields()}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-800">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {connection ? 'Update Connection' : 'Create Connection'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
