'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '@/app/components/BrandingHeader'

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

export default function VenuePage() {
  const [venueInfo, setVenueInfo] = useState<VenueInfo | null>(null)
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading venue information...</p>
        </div>
      </div>
    )
  }

  if (!venueInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No venue information available</p>
        </div>
      </div>
    )
  }

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path
    }
  }

  const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin')

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandingHeader
        activeTab="venue"
        onTabChange={(tab) => {
          if (tab === 'overview') navigateTo('/')
          if (tab === 'sponsors') navigateTo('/sponsors')
          if (tab === 'agenda') navigateTo('/agenda')
          if (tab === 'messages') navigateTo('/messages')
          if (tab === 'voting') navigateTo('/voting')
          if (tab === 'register') navigateTo('/register')
          if (tab === 'delegate') navigateTo('/delegate')
          if (tab === 'admin') navigateTo('/admin')
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Venue Information</h1>
            {isAdmin && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Venue
              </button>
            )}
          </div>

          {/* Main Venue Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{venueInfo.name}</h2>
            <p className="text-gray-600 mb-4">{venueInfo.description}</p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-900 font-medium">📍 {venueInfo.address}</p>
            </div>
          </div>

          {/* Images */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Venue Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {venueInfo.images && venueInfo.images.length > 0 ? (
                venueInfo.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.startsWith('/') ? image : `/uploads/${image}`}
                      alt={`Venue image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No venue images available
                </div>
              )}
            </div>
          </div>

          {/* Facilities */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Conference Facilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {venueInfo.facilities.map((facility, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">{facility}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Accessibility</h3>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {venueInfo.accessibility.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-green-600">♿</span>
                    <span className="text-green-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transport Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Here</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">🚗 By Car</h4>
                  <p className="text-gray-600 text-sm">{venueInfo.transport.car}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">🚂 By Train</h4>
                  <p className="text-gray-600 text-sm">{venueInfo.transport.train}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">✈️ By Plane</h4>
                  <p className="text-gray-600 text-sm">{venueInfo.transport.plane}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">🚌 By Bus</h4>
                  <p className="text-gray-600 text-sm">{venueInfo.transport.bus}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Parking */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Parking</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-blue-600">🅿️</span>
                <span className="font-medium text-blue-900">
                  On-site parking: {venueInfo.parking.onsite ? 'Available' : 'Not Available'}
                </span>
              </div>
              <p className="text-blue-800 mb-3">Cost: {venueInfo.parking.cost}</p>
              {venueInfo.parking.alternatives.length > 0 && (
                <div>
                  <p className="font-medium text-blue-900 mb-2">Alternative Parking:</p>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    {venueInfo.parking.alternatives.map((alt, index) => (
                      <li key={index}>• {alt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Accommodation */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Accommodation</h3>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-purple-600">🏨</span>
                <span className="font-medium text-purple-900">
                  On-site accommodation: {venueInfo.accommodation.onsite ? 'Available' : 'Not Available'}
                </span>
              </div>
              {venueInfo.accommodation.nearby.length > 0 && (
                <div>
                  <p className="font-medium text-purple-900 mb-2">Nearby Hotels:</p>
                  <ul className="text-purple-800 space-y-1 text-sm">
                    {venueInfo.accommodation.nearby.map((hotel, index) => (
                      <li key={index}>• {hotel}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Local Attractions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Local Attractions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🎭 Shakespeare's Birthplace</h4>
                <p className="text-gray-600 text-sm">William Shakespeare's childhood home, just 0.3 miles away</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🎭 Royal Shakespeare Theatre</h4>
                <p className="text-gray-600 text-sm">World-renowned theatre, 0.4 miles from venue</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🛍️ Stratford Town Centre</h4>
                <p className="text-gray-600 text-sm">Shopping, dining, and historic sites, 0.2 miles away</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🚢 River Avon</h4>
                <p className="text-gray-600 text-sm">Scenic riverside walks and boat trips, 0.1 miles away</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Venue Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Phone:</span> +44 (0)1789 279722
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Email:</span> conferences@crowneplaza-stratford.co.uk
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Website:</span> www.crowneplaza-stratford.co.uk
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Conference Team:</span> Available 24/7 during event
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Emergency Contact:</span> +44 (0)1789 279733
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

