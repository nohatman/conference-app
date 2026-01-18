'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '../../components/BrandingHeader'

interface TabConfig {
  id: string
  label: string
  icon: string
  enabled: boolean
  order: number
}

interface TabData {
  tabs: TabConfig[]
}

export default function TabsManagementPage() {
  const [tabs, setTabs] = useState<TabConfig[]>([
    { id: "overview", label: "Overview", icon: "🏠", enabled: true, order: 1 },
    { id: "venue", label: "Venue", icon: "📍", enabled: true, order: 2 },
    { id: "sponsors", label: "Sponsors", icon: "🤝", enabled: true, order: 3 },
    { id: "agenda", label: "Agenda", icon: "📅", enabled: true, order: 4 },
    { id: "messages", label: "Messages", icon: "💬", enabled: true, order: 5 },
    { id: "voting", label: "Voting", icon: "🗳️", enabled: true, order: 6 },
    { id: "register", label: "Book Tickets", icon: "🎫", enabled: true, order: 7 }
  ])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadTabs()
  }, [])

  const loadTabs = async () => {
    try {
      const response = await fetch('/api/tabs')
      if (response.ok) {
        const data = await response.json()
        setTabs(data.tabs || tabs)
      }
    } catch (error) {
      console.error('Failed to load tabs:', error)
    }
  }

  const saveTabs = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tabs })
      })

      if (response.ok) {
        setMessage('Tabs configuration saved successfully!')
        // Force refresh all BrandingHeader instances by clearing their cache
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('tabs-updated'))
        }
      } else {
        setMessage('Failed to save tabs configuration')
      }
    } catch (error) {
      setMessage('Error saving tabs configuration')
      console.error('Error saving tabs:', error)
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const updateTab = (id: string, field: keyof TabConfig, value: any) => {
    setTabs(tabs.map(tab => 
      tab.id === id ? { ...tab, [field]: value } : tab
    ))
  }

  const moveTab = (id: string, direction: 'up' | 'down') => {
    const currentIdx = tabs.findIndex(tab => tab.id === id)
    if (
      (direction === 'up' && currentIdx === 0) ||
      (direction === 'down' && currentIdx === tabs.length - 1)
    ) {
      return
    }

    const updatedTabs = [...tabs]
    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1
    
    // Swap tabs
    const temp = updatedTabs[currentIdx]
    updatedTabs[currentIdx] = updatedTabs[targetIdx]
    updatedTabs[targetIdx] = temp
    
    // Update order numbers
    updatedTabs.forEach((tab, index) => {
      tab.order = index + 1
    })
    
    setTabs(updatedTabs)
  }

  const sortedTabs = [...tabs].sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandingHeader activeTab="admin" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Tab Management</h1>
          
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Configure which tabs appear in the navigation and their order. Changes will be reflected across all pages.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {sortedTabs.map((tab) => (
              <div key={tab.id} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{tab.icon}</span>
                    <input
                      type="text"
                      value={tab.label}
                      onChange={(e) => updateTab(tab.id, 'label', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tab.enabled}
                        onChange={(e) => updateTab(tab.id, 'enabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Enabled
                    </label>
                    <span>ID: {tab.id}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => moveTab(tab.id, 'up')}
                    disabled={tab.order === 1}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveTab(tab.id, 'down')}
                    disabled={tab.order === tabs.length}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={saveTabs}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
            <button
              onClick={loadTabs}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
