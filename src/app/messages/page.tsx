'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '../components/BrandingHeader'

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  type: 'announcement' | 'question' | 'discussion'
  status: 'active' | 'archived'
  replies?: Message[]
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'announcement' | 'question' | 'discussion'>('all')
  const [newMessage, setNewMessage] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderId, setSenderId] = useState('')
  const [messageType, setMessageType] = useState<'announcement' | 'question' | 'discussion'>('discussion')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadMessages()
    
    // Set up real-time updates (every 5 seconds)
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const postMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !senderName.trim()) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: senderId || `user_${Date.now()}`,
          senderName,
          content: newMessage.trim(),
          type: messageType
        })
      })
      
      if (response.ok) {
        setNewMessage('')
        loadMessages() // Reload messages
      }
    } catch (error) {
      console.error('Failed to post message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredMessages = messages.filter(message => 
    filter === 'all' || message.type === filter
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-red-100 text-red-800 border-red-200'
      case 'question': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'discussion': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return '📢'
      case 'question': return '❓'
      case 'discussion': return '💬'
      default: return '📝'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandingHeader
        activeTab="messages"
        onTabChange={(tab) => {
          if (tab === 'overview') window.location.href = '/'
          if (tab === 'venue') window.location.href = '/venue'
          if (tab === 'sponsors') window.location.href = '/sponsors'
          if (tab === 'agenda') window.location.href = '/agenda'
          if (tab === 'voting') window.location.href = '/voting'
          if (tab === 'register') window.location.href = '/register'
          if (tab === 'delegate') window.location.href = '/delegate'
          if (tab === 'admin') window.location.href = '/admin'
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Conference Messages</h1>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setFilter('announcement')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'announcement' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📢 Announcements ({messages.filter(m => m.type === 'announcement').length})
            </button>
            <button
              onClick={() => setFilter('question')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'question' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ❓ Questions ({messages.filter(m => m.type === 'question').length})
            </button>
            <button
              onClick={() => setFilter('discussion')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'discussion' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              💬 Discussion ({messages.filter(m => m.type === 'discussion').length})
            </button>
          </div>
        </div>

        {/* New Message Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Post New Message</h2>
          <form onSubmit={postMessage} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="discussion">💬 General Discussion</option>
                  <option value="question">❓ Question</option>
                  <option value="announcement">📢 Announcement</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newMessage.trim() || !senderName.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Post Message'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </form>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No messages found. Be the first to post!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <div key={message.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(message.type)}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(message.type)}`}>
                        {message.type}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-900">{message.senderName}</span>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {message.content}
                  </div>
                  {message.replies && message.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">
                        {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
                      </p>
                      {message.replies.map((reply) => (
                        <div key={reply.id} className="mb-2 text-sm">
                          <span className="font-medium">{reply.senderName}:</span> {reply.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
