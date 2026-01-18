'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '../../components/BrandingHeader'

interface VenueInfo {
  name: string
  address: string
  description: string
  facilities: string[]
  accessibility: string[]
  transport: {
    car: string
    train: string
    plane: string
    bus: string
  }
  parking: {
    onsite: boolean
    cost: string
    alternatives: string[]
  }
  accommodation: {
    onsite: boolean
    nearby: string[]
  }
  images: string[]
}

export default function VenueManagementPage() {
  const [venueInfo, setVenueInfo] = useState<VenueInfo>({
    name: "Crowne Plaza Stratford upon Avon",
    address: "Bridgefoot, Stratford-upon-Avon CV37 6YR, United Kingdom",
    description: "A stunning riverside location in the heart of Shakespeare's country, offering modern conference facilities with historic charm.",
    facilities: [
      "Free high-speed Wi-Fi throughout",
      "State-of-the-art audiovisual equipment",
      "Multiple conference rooms and breakout spaces",
      "On-site restaurant and bar",
      "24-hour front desk",
      "Business center",
      "Fitness center and spa",
      "Indoor swimming pool",
      "Complimentary tea and coffee stations",
      "Climate control in all meeting rooms"
    ],
    accessibility: [
      "Wheelchair accessible throughout",
      "Accessible parking spaces available",
      "Accessible restrooms on all floors",
      "Hearing loop systems in main conference rooms",
      "Elevator access to all floors",
      "Assistance available upon request",
      "Braille signage in key areas",
      "Accessible accommodation rooms available"
    ],
    transport: {
      car: "Located just off the M40 motorway, approximately 2 hours from London and 1 hour from Birmingham. Postcode CV37 6YR for satellite navigation.",
      train: "Stratford-upon-Avon railway station is 0.5 miles away (10-minute walk). Direct services from Birmingham, London Marylebone, and Oxford.",
      plane: "Birmingham Airport (BHX) is 25 miles away (40-minute drive). Heathrow Airport is 90 miles away (2-hour drive).",
      bus: "Regular bus services from Warwick, Leamington Spa, and surrounding areas. Bus stop located 200 yards from the hotel."
    },
    parking: {
      onsite: true,
      cost: "Free for conference delegates",
      alternatives: [
        "Stratford-upon-Avon Park & Ride (0.3 miles)",
        "Bridge Street Car Park (0.2 miles)",
        "Windsor Street Car Park (0.4 miles)"
      ]
    },
    accommodation: {
      onsite: true,
      nearby: [
        "Macdonald Alveston Manor Hotel (2 miles)",
        "The Stratford Hotel (0.3 miles)",
        "The Falcon Hotel (0.5 miles)",
        "Ettington Park Hotel (5 miles)"
      ]
    },
    images: []
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [newFacility, setNewFacility] = useState('')
  const [newAccessibility, setNewAccessibility] = useState('')
  const [newParkingAlt, setNewParkingAlt] = useState('')
  const [newNearbyHotel, setNewNearbyHotel] = useState('')

  useEffect(() => {
    loadVenueInfo()
  }, [])

  const loadVenueInfo = async () => {
    try {
      const response = await fetch('/api/venue')
      if (response.ok) {
        const data = await response.json()
        setVenueInfo(data)
      }
    } catch (error) {
      console.error('Failed to load venue info:', error)
    }
  }

  const saveVenueInfo = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/venue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venueInfo)
      })

      if (response.ok) {
        setMessage('Venue information saved successfully!')
      } else {
        setMessage('Failed to save venue information')
      }
    } catch (error) {
      setMessage('Error saving venue information')
      console.error('Error saving venue info:', error)
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const updateVenueInfo = (field: keyof VenueInfo, value: any) => {
    setVenueInfo(prev => ({ ...prev, [field]: value }))
  }

  const addFacility = () => {
    if (newFacility.trim()) {
      updateVenueInfo('facilities', [...venueInfo.facilities, newFacility.trim()])
      setNewFacility('')
    }
  }

  const removeFacility = (index: number) => {
    updateVenueInfo('facilities', venueInfo.facilities.filter((_, i) => i !== index))
  }

  const addAccessibility = () => {
    if (newAccessibility.trim()) {
      updateVenueInfo('accessibility', [...venueInfo.accessibility, newAccessibility.trim()])
      setNewAccessibility('')
    }
  }

  const removeAccessibility = (index: number) => {
    updateVenueInfo('accessibility', venueInfo.accessibility.filter((_, i) => i !== index))
  }

  const addParkingAlt = () => {
    if (newParkingAlt.trim()) {
      updateVenueInfo('parking', {
        ...venueInfo.parking,
        alternatives: [...venueInfo.parking.alternatives, newParkingAlt.trim()]
      })
      setNewParkingAlt('')
    }
  }

  const removeParkingAlt = (index: number) => {
    updateVenueInfo('parking', {
      ...venueInfo.parking,
      alternatives: venueInfo.parking.alternatives.filter((_, i) => i !== index)
    })
  }

  const addNearbyHotel = () => {
    if (newNearbyHotel.trim()) {
      updateVenueInfo('accommodation', {
        ...venueInfo.accommodation,
        nearby: [...venueInfo.accommodation.nearby, newNearbyHotel.trim()]
      })
      setNewNearbyHotel('')
    }
  }

  const removeNearbyHotel = (index: number) => {
    updateVenueInfo('accommodation', {
      ...venueInfo.accommodation,
      nearby: venueInfo.accommodation.nearby.filter((_, i) => i !== index)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'venue')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const { url } = await response.json()
        return url
      }
      return null
    })

    try {
      const urls = await Promise.all(uploadPromises)
      const validUrls = urls.filter(url => url !== null)
      updateVenueInfo('images', [...venueInfo.images, ...validUrls])
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('Some images failed to upload')
    }
  }

  const removeImage = (index: number) => {
    updateVenueInfo('images', venueInfo.images.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandingHeader activeTab="admin" />
      
      {/* Sticky Save Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={saveVenueInfo}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Venue Information</h1>
          

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
                <input
                  type="text"
                  value={venueInfo.name}
                  onChange={(e) => updateVenueInfo('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={venueInfo.address}
                  onChange={(e) => updateVenueInfo('address', e.target.value)}
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
                        const textarea = document.getElementById('venue-description') as HTMLTextAreaElement
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
                        const textarea = document.getElementById('venue-description') as HTMLTextAreaElement
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
                        const textarea = document.getElementById('venue-description') as HTMLTextAreaElement
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
                  id="venue-description"
                  value={venueInfo.description}
                  onChange={(e) => updateVenueInfo('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Transport Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transport Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">By Car</label>
                <textarea
                  value={venueInfo.transport.car}
                  onChange={(e) => updateVenueInfo('transport', { ...venueInfo.transport, car: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">By Train</label>
                <textarea
                  value={venueInfo.transport.train}
                  onChange={(e) => updateVenueInfo('transport', { ...venueInfo.transport, train: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">By Plane</label>
                <textarea
                  value={venueInfo.transport.plane}
                  onChange={(e) => updateVenueInfo('transport', { ...venueInfo.transport, plane: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">By Bus</label>
                <textarea
                  value={venueInfo.transport.bus}
                  onChange={(e) => updateVenueInfo('transport', { ...venueInfo.transport, bus: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Facilities</h2>
            <div className="space-y-2">
              {venueInfo.facilities.map((facility, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={facility}
                    onChange={(e) => {
                      const updated = [...venueInfo.facilities]
                      updated[index] = e.target.value
                      updateVenueInfo('facilities', updated)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeFacility(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  placeholder="Add new facility..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addFacility}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Venue Images</h2>
            <div className="mb-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:rounded-full file:border-0 file:text-sm file:font-semibold hover:file:bg-blue-50"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {venueInfo.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Venue image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
