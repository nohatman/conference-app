'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '@/app/components/BrandingHeader'

interface VoteOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  title: string
  description: string
  options: VoteOption[]
  isActive: boolean
  createdAt: string
  endsAt?: string
  allowMultiple: boolean
}

export default function VotingPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [voterId, setVoterId] = useState('')
  const [voterName, setVoterName] = useState('')
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['', ''],
    allowMultiple: false,
    endsAt: ''
  })

  useEffect(() => {
    loadPolls()
    // Generate or load voter ID
    const storedVoterId = localStorage.getItem('voterId')
    const storedVoterName = localStorage.getItem('voterName')
    
    if (storedVoterId) {
      setVoterId(storedVoterId)
      setVoterName(storedVoterName || '')
    }
  }, [])

  const loadPolls = async () => {
    try {
      const response = await fetch('/api/voting')
      const data = await response.json()
      setPolls(data)
    } catch (error) {
      console.error('Failed to load polls:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveVoterInfo = () => {
    if (voterName.trim()) {
      const newVoterId = voterId || `voter_${Date.now()}`
      localStorage.setItem('voterId', newVoterId)
      localStorage.setItem('voterName', voterName.trim())
      setVoterId(newVoterId)
    }
  }

  const submitVote = async (pollId: string) => {
    if (!voterId || !voterName.trim()) {
      alert('Please enter your name before voting')
      return
    }

    if (selectedOptions.length === 0) {
      alert('Please select at least one option')
      return
    }

    setIsSubmitting(true)
    
    try {
      for (const optionId of selectedOptions) {
        const response = await fetch('/api/voting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'vote',
            pollId,
            optionId,
            voterId
          })
        })

        if (!response.ok) {
          const error = await response.json()
          alert(error.error || 'Failed to submit vote')
          return
        }
      }

      setHasVoted(prev => ({ ...prev, [pollId]: true }))
      setSelectedOptions([])
      loadPolls() // Reload polls to update vote counts
    } catch (error) {
      console.error('Failed to submit vote:', error)
      alert('Failed to submit vote')
    } finally {
      setIsSubmitting(false)
    }
  }

  const createPoll = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPoll.title.trim() || !newPoll.description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const validOptions = newPoll.options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/voting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_poll',
          title: newPoll.title.trim(),
          description: newPoll.description.trim(),
          options: validOptions,
          allowMultiple: newPoll.allowMultiple,
          endsAt: newPoll.endsAt || null
        })
      })

      if (response.ok) {
        setNewPoll({
          title: '',
          description: '',
          options: ['', ''],
          allowMultiple: false,
          endsAt: ''
        })
        setShowCreateForm(false)
        loadPolls()
      } else {
        alert('Failed to create poll')
      }
    } catch (error) {
      console.error('Failed to create poll:', error)
      alert('Failed to create poll')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePoll = async (pollId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/voting', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pollId,
          isActive
        })
      })

      if (response.ok) {
        loadPolls()
      }
    } catch (error) {
      console.error('Failed to toggle poll:', error)
    }
  }

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const removeOption = (index: number) => {
    if (newPoll.options.length <= 2) return
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const getTotalVotes = (poll: Poll) => {
    return poll.options.reduce((total, option) => total + option.votes, 0)
  }

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0
  }

  const isPollExpired = (poll: Poll) => {
    return poll.endsAt && new Date(poll.endsAt) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading polls...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandingHeader
        activeTab="voting"
        onTabChange={(tab) => {
          if (tab === 'overview') window.location.href = '/'
          if (tab === 'venue') window.location.href = '/venue'
          if (tab === 'sponsors') window.location.href = '/sponsors'
          if (tab === 'agenda') window.location.href = '/agenda'
          if (tab === 'messages') window.location.href = '/messages'
          if (tab === 'register') window.location.href = '/register'
          if (tab === 'delegate') window.location.href = '/delegate'
          if (tab === 'admin') window.location.href = '/admin'
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Voter Info */}
        {!voterId && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Voter Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={saveVoterInfo}
                  disabled={!voterName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Voter Info
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Conference Voting</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'Create New Poll'}
            </button>
          </div>

          {/* Create Poll Form */}
          {showCreateForm && (
            <form onSubmit={createPoll} className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Create New Poll</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poll Title</label>
                  <input
                    type="text"
                    value={newPoll.title}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter poll title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newPoll.description}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the poll"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Option
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newPoll.allowMultiple}
                        onChange={(e) => setNewPoll(prev => ({ ...prev, allowMultiple: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Allow multiple selections</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={newPoll.endsAt}
                      onChange={(e) => setNewPoll(prev => ({ ...prev, endsAt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Poll'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Polls List */}
        <div className="space-y-6">
          {polls.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <p>No polls available. Create the first poll!</p>
            </div>
          ) : (
            polls.map((poll) => (
              <div key={poll.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{poll.title}</h3>
                    <p className="text-gray-600 mb-2">{poll.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📊 {getTotalVotes(poll)} votes</span>
                      {poll.endsAt && (
                        <span>⏰ Ends: {new Date(poll.endsAt).toLocaleString()}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        poll.isActive && !isPollExpired(poll)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {poll.isActive && !isPollExpired(poll) ? 'Active' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => togglePoll(poll.id, !poll.isActive)}
                      className={`px-3 py-1 text-sm rounded ${
                        poll.isActive
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {poll.isActive ? 'Close' : 'Open'}
                    </button>
                  </div>
                </div>

                {/* Voting Options */}
                {poll.isActive && !isPollExpired(poll) && !hasVoted[poll.id] && voterId && (
                  <div className="border-t pt-4 mb-4">
                    <h4 className="font-medium mb-3">Cast Your Vote</h4>
                    <div className="space-y-2">
                      {poll.options.map((option) => (
                        <label key={option.id} className="flex items-center">
                          <input
                            type={poll.allowMultiple ? 'checkbox' : 'radio'}
                            name={`poll_${poll.id}`}
                            value={option.id}
                            checked={selectedOptions.includes(option.id)}
                            onChange={(e) => {
                              if (poll.allowMultiple) {
                                if (e.target.checked) {
                                  setSelectedOptions(prev => [...prev, option.id])
                                } else {
                                  setSelectedOptions(prev => prev.filter(id => id !== option.id))
                                }
                              } else {
                                setSelectedOptions([option.id])
                              }
                            }}
                            className="mr-3"
                          />
                          <span>{option.text}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => submitVote(poll.id)}
                      disabled={isSubmitting || selectedOptions.length === 0}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                    </button>
                  </div>
                )}

                {/* Results */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Results</h4>
                  <div className="space-y-3">
                    {poll.options.map((option) => {
                      const totalVotes = getTotalVotes(poll)
                      const percentage = getVotePercentage(option.votes, totalVotes)
                      
                      return (
                        <div key={option.id}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{option.text}</span>
                            <span className="text-sm text-gray-600">
                              {option.votes} votes ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-6">
                            <div
                              className="bg-blue-600 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 10 && `${percentage}%`}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}



