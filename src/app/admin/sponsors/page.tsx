'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '../../components/BrandingHeader'

interface Sponsor {
  id: string
  name: string
  logo: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  description: string
  website: string
  boothNumber?: string
}

export default function SponsorsManagementPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([
    {
      id: '1',
      name: 'TechCorp Solutions',
      logo: '🏢',
      tier: 'platinum',
      description: 'Leading provider of enterprise software solutions and digital transformation services.',
      website: 'https://techcorp.example.com',
      boothNumber: 'A1'
    }
  ])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSponsors()
  }, [])

  const loadSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors')
      if (response.ok) {
        const data = await response.json()
        setSponsors(data)
      }
    } catch (error) {
      console.error('Failed to load sponsors:', error)
    }
  }

  const saveSponsors = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sponsors)
      })

      if (response.ok) {
        setMessage('Sponsors saved successfully!')
      } else {
        setMessage('Failed to save sponsors')
      }
    } catch (error) {
      setMessage('Error saving sponsors')
      console.error('Error saving sponsors:', error)
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const updateSponsor = (id: string, field: keyof Sponsor, value: any) => {
    setSponsors(sponsors => 
      sponsors.map(sponsor => 
        sponsor.id === id ? { ...sponsor, [field]: value } : sponsor
      )
    )
  }

  const addSponsor = () => {
    const newSponsor: Sponsor = {
      id: Date.now().toString(),
      name: '',
      logo: '',
      tier: 'bronze',
      description: '',
      website: '',
      boothNumber: ''
    }
    setSponsors([...sponsors, newSponsor])
  }

  const removeSponsor = (id: string) => {
    setSponsors(sponsors.filter(sponsor => sponsor.id !== id))
  }

  const moveSponsor = (id: string, direction: 'up' | 'down') => {
    const currentIndex = sponsors.findIndex(sponsor => sponsor.id === id)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sponsors.length - 1)
    ) {
      return
    }

    const newSponsors = [...sponsors]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    // Swap sponsors
    const temp = newSponsors[currentIndex]
    newSponsors[currentIndex] = newSponsors[targetIndex]
    newSponsors[targetIndex] = temp
    
    setSponsors(newSponsors)
  }

  const handleLogoUpload = async (sponsorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'sponsor')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const { url } = await response.json()
        updateSponsor(sponsorId, 'logo', url)
      } else {
        alert('Failed to upload logo')
      }
    } catch (error) {
      console.error('Logo upload failed:', error)
      alert('Failed to upload logo')
    }
  }

  const getTierInfo = (tier: Sponsor['tier']) => {
    const tierInfo = {
      platinum: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'Platinum',
        order: 1
      },
      gold: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Gold',
        order: 2
      },
      silver: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        label: 'Silver',
        order: 3
      },
      bronze: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        label: 'Bronze',
        order: 4
      }
    }
    return tierInfo[tier]
  }

  const groupedSponsors = sponsors.reduce((acc, sponsor) => {
    if (!acc[sponsor.tier]) {
      acc[sponsor.tier] = []
    }
    acc[sponsor.tier].push(sponsor)
    return acc
  }, {} as Record<string, Sponsor[]>)

  const sortedTiers = ['platinum', 'gold', 'silver', 'bronze'] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandingHeader activeTab="admin" />
      
      {/* Sticky Save Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={saveSponsors}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Sponsor Management</h1>
          
              <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={addSponsor}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add Sponsor
              </button>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {sortedTiers.map((tier) => {
            const tierSponsors = groupedSponsors[tier] || []
            const tierInfo = getTierInfo(tier)

            return (
              <div key={tier} className="mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-4 ${tierInfo.color}`}>
                  <span className="font-semibold">{tierInfo.label} Sponsors</span>
                </div>
                
                <div className="space-y-4">
                  {tierSponsors.map((sponsor, index) => (
                    <div key={sponsor.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveSponsor(sponsor.id, 'up')}
                            disabled={index === 0}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveSponsor(sponsor.id, 'down')}
                            disabled={index === tierSponsors.length - 1}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeSponsor(sponsor.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sponsor Name</label>
                          <input
                            type="text"
                            value={sponsor.name}
                            onChange={(e) => updateSponsor(sponsor.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                          <input
                            type="url"
                            value={sponsor.website}
                            onChange={(e) => updateSponsor(sponsor.id, 'website', e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Booth Number</label>
                          <input
                            type="text"
                            value={sponsor.boothNumber || ''}
                            onChange={(e) => updateSponsor(sponsor.id, 'boothNumber', e.target.value)}
                            placeholder="e.g., A1, B2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
                          <select
                            value={sponsor.tier}
                            onChange={(e) => updateSponsor(sponsor.id, 'tier', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tierInfo.color}`}
                          >
                            <option value="platinum">Platinum</option>
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                            <option value="bronze">Bronze</option>
                          </select>
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
                                  const textarea = document.getElementById(`sponsor-desc-${sponsor.id}`) as HTMLTextAreaElement
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
                                  const textarea = document.getElementById(`sponsor-desc-${sponsor.id}`) as HTMLTextAreaElement
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
                                  const textarea = document.getElementById(`sponsor-desc-${sponsor.id}`) as HTMLTextAreaElement
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
                            id={`sponsor-desc-${sponsor.id}`}
                            value={sponsor.description}
                            onChange={(e) => updateSponsor(sponsor.id, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sponsor Logo</label>
                        <div className="flex items-center gap-4">
                          {sponsor.logo && (
                            <div className="flex items-center gap-2">
                              {sponsor.logo.startsWith('http') || sponsor.logo.startsWith('/') ? (
                                <img
                                  src={sponsor.logo}
                                  alt={`${sponsor.name} logo`}
                                  className="w-16 h-16 object-contain border rounded"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-2xl">
                                  {sponsor.logo}
                                </div>
                              )}
                              <button
                                onClick={() => updateSponsor(sponsor.id, 'logo', '')}
                                className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                Clear
                              </button>
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload(sponsor.id, e)}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:rounded-full file:border-0 file:text-sm file:font-semibold hover:file:bg-blue-50"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Upload logo (PNG, JPG, GIF - Max 2MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
