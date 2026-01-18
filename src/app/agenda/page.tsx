'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '../components/BrandingHeader'

interface AgendaItem {
  id: string
  time: string
  title: string
  speaker: string
  location: string
  description: string
  type: 'keynote' | 'session' | 'break' | 'workshop' | 'networking'
}

interface AgendaData {
  items: AgendaItem[]
}

export default function AgendaPage() {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agenda...</p>
        </div>
      </div>
    )
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

  const getTypeIcon = (type: AgendaItem['type']) => {
    const icons = {
      keynote: '🎤',
      session: '📊',
      workshop: '🛠️',
      break: '☕',
      networking: '🤝'
    }
    return icons[type] || '📅'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandingHeader
        activeTab="agenda"
        onTabChange={(tab) => {
          if (tab === 'overview') window.location.href = '/'
          if (tab === 'venue') window.location.href = '/venue'
          if (tab === 'sponsors') window.location.href = '/sponsors'
          if (tab === 'messages') window.location.href = '/messages'
          if (tab === 'voting') window.location.href = '/voting'
          if (tab === 'register') window.location.href = '/register'
          if (tab === 'delegate') window.location.href = '/delegate'
          if (tab === 'admin') window.location.href = '/admin'
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Conference Agenda</h1>
            {isAdmin && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Agenda
              </button>
            )}
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              Join us for a full day of inspiring talks, workshops, and networking opportunities. 
              All sessions are designed to provide actionable insights for business growth.
            </p>
          </div>

          <div className="space-y-4">
            {agendaItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="md:w-48 flex-shrink-0">
                    <div className="text-lg font-semibold text-gray-900 mb-2">{item.time}</div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getTypeColor(item.type)}`}>
                      <span>{getTypeIcon(item.type)}</span>
                      <span className="capitalize">{item.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    {item.speaker && (
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Speaker:</span> {item.speaker}
                      </p>
                    )}
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Location:</span> {item.location}
                    </p>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• All timings are approximate and may be subject to minor changes</li>
              <li>• Workshop spaces are limited - please register early</li>
              <li>• Lunch and refreshments are included in all ticket types</li>
              <li>• Conference dinner is included for Conference + Dinner and Full Package ticket holders</li>
              <li>• Free Wi-Fi available throughout the venue</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
