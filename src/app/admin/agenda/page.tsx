'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '../../components/BrandingHeader'

interface AgendaItem {
  id: string
  time: string
  title: string
  speaker: string
  location: string
  description: string
  type: 'keynote' | 'session' | 'break' | 'workshop' | 'networking'
}

export default function AgendaManagementPage() {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([
    {
      id: '1',
      time: '08:30 - 09:00',
      title: 'Registration & Welcome Coffee',
      speaker: '',
      location: 'Main Lobby',
      description: 'Collect your badge and enjoy refreshments before the main event begins.',
      type: 'networking'
    },
    {
      id: '2',
      time: '09:00 - 09:30',
      title: 'Opening Keynote: The Future of Business Growth',
      speaker: 'Sarah Johnson, CEO',
      location: 'Main Hall',
      description: 'Insights into emerging trends and strategies for sustainable business growth in 2025 and beyond.',
      type: 'keynote'
    }
  ])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadAgenda()
  }, [])

  const loadAgenda = async () => {
    try {
      const response = await fetch('/api/agenda')
      if (response.ok) {
        const data = await response.json()
        setAgendaItems(data)
      }
    } catch (error) {
      console.error('Failed to load agenda:', error)
    }
  }

  const saveAgenda = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/agenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agendaItems)
      })

      if (response.ok) {
        setMessage('Agenda saved successfully!')
      } else {
        setMessage('Failed to save agenda')
      }
    } catch (error) {
      setMessage('Error saving agenda')
      console.error('Error saving agenda:', error)
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const updateAgendaItem = (id: string, field: keyof AgendaItem, value: any) => {
    setAgendaItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const addAgendaItem = () => {
    const newItem: AgendaItem = {
      id: Date.now().toString(),
      time: '',
      title: '',
      speaker: '',
      location: '',
      description: '',
      type: 'session'
    }
    setAgendaItems([...agendaItems, newItem])
  }

  const removeAgendaItem = (id: string) => {
    setAgendaItems(agendaItems.filter(item => item.id !== id))
  }

  const moveAgendaItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = agendaItems.findIndex(item => item.id === id)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === agendaItems.length - 1)
    ) {
      return
    }

    const newItems = [...agendaItems]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    // Swap items
    const temp = newItems[currentIndex]
    newItems[currentIndex] = newItems[targetIndex]
    newItems[targetIndex] = temp
    
    setAgendaItems(newItems)
  }

  const getTypeColor = (type: AgendaItem['type']) => {
    const colors = {
      keynote: 'bg-purple-100 text-purple-800 border-purple-200',
      session: 'bg-blue-100 text-blue-800 border-blue-200',
      workshop: 'bg-green-100 text-green-800 border-green-200',
      break: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      networking: 'bg-pink-100 text-pink-800 border-pink-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandingHeader activeTab="admin" />
      
      {/* Sticky Save Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={saveAgenda}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Agenda Management</h1>
          
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={addAgendaItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add Item
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {agendaItems.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={item.type}
                      onChange={(e) => updateAgendaItem(item.id, 'type', e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm border ${getTypeColor(item.type)}`}
                    >
                      <option value="keynote">Keynote</option>
                      <option value="session">Session</option>
                      <option value="workshop">Workshop</option>
                      <option value="break">Break</option>
                      <option value="networking">Networking</option>
                    </select>
                    <span className="text-sm text-gray-600">Type</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveAgendaItem(item.id, 'up')}
                      disabled={index === 0}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveAgendaItem(item.id, 'down')}
                      disabled={index === agendaItems.length - 1}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeAgendaItem(item.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => updateAgendaItem(item.id, 'time', e.target.value)}
                      placeholder="e.g., 09:00 - 10:00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateAgendaItem(item.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Speaker</label>
                    <input
                      type="text"
                      value={item.speaker}
                      onChange={(e) => updateAgendaItem(item.id, 'speaker', e.target.value)}
                      placeholder="Speaker name (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={item.location}
                      onChange={(e) => updateAgendaItem(item.id, 'location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div className="border border-gray-300 rounded-md">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById(`agenda-desc-${item.id}`) as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const text = textarea.value
                              textarea.value = text.slice(0, start) + '**' + text.slice(start, end) + '**' + text.slice(end)
                              textarea.focus()
                              textarea.setSelectionRange(start + 2, end + 2)
                            }
                          }}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
                        >
                          <strong>B</strong>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById(`agenda-desc-${item.id}`) as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const text = textarea.value
                              textarea.value = text.slice(0, start) + '*' + text.slice(start, end) + '*' + text.slice(end)
                              textarea.focus()
                              textarea.setSelectionRange(start + 1, end + 1)
                            }
                          }}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
                        >
                          <em>I</em>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById(`agenda-desc-${item.id}`) as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const text = textarea.value
                              textarea.value = text.slice(0, start) + '\n• ' + text.slice(start)
                              textarea.focus()
                              textarea.setSelectionRange(start + 3, start + 3)
                            }
                          }}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
                        >
                          • List
                        </button>
                      </div>
                    </div>
                    <textarea
                      id={`agenda-desc-${item.id}`}
                      value={item.description}
                      onChange={(e) => updateAgendaItem(item.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
