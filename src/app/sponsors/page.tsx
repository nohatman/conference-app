'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '@/app/components/BrandingHeader'

interface Sponsor {
  id: string
  name: string
  logo: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  description: string
  website: string
  boothNumber?: string
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)

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
          <p className="mt-4 text-gray-600">Loading sponsors...</p>
        </div>
      </div>
    )
  }

  const getTierInfo = (tier: Sponsor['tier']) => {
    const tierInfo = {
      platinum: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'Platinum Sponsor',
        benefits: 'Prime exhibition space, speaking opportunities, extensive brand visibility'
      },
      gold: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Gold Sponsor',
        benefits: 'Premium exhibition space, brand visibility, networking opportunities'
      },
      silver: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        label: 'Silver Sponsor',
        benefits: 'Standard exhibition space, brand recognition, networking access'
      },
      bronze: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        label: 'Bronze Sponsor',
        benefits: 'Basic exhibition space, brand listing, networking opportunities'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandingHeader
        activeTab="sponsors"
        onTabChange={(tab) => {
          if (tab === 'overview') window.location.href = '/'
          if (tab === 'venue') window.location.href = '/venue'
          if (tab === 'agenda') window.location.href = '/agenda'
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
            <h1 className="text-3xl font-bold text-gray-900">Our Sponsors</h1>
            {isAdmin && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Manage Sponsors
              </button>
            )}
          </div>

          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              We're proud to partner with industry leaders who share our vision for business growth and innovation. 
              Our sponsors provide valuable products and services to help you succeed.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Why Partner With Us?</h3>
              <p className="text-blue-800 text-sm">
                Connect with 500+ business leaders, showcase your products, and generate quality leads. 
                Contact us at <a href="mailto:sponsors@fwdlive.com" className="underline">sponsors@fwdlive.com</a> for sponsorship opportunities.
              </p>
            </div>
          </div>

          {(['platinum', 'gold', 'silver', 'bronze'] as const).map((tier) => {
            const tierSponsors = groupedSponsors[tier]
            if (!tierSponsors || tierSponsors.length === 0) return null

            const tierInfo = getTierInfo(tier)

            return (
              <div key={tier} className="mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-4 ${tierInfo.color}`}>
                  <span className="font-semibold">{tierInfo.label}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tierSponsors.map((sponsor) => (
                    <div key={sponsor.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 mb-4">
                        {sponsor.logo && (
                          sponsor.logo.startsWith('/') || sponsor.logo.startsWith('http') ? (
                            <img
                              src={sponsor.logo.startsWith('/') ? sponsor.logo : sponsor.logo}
                              alt={`${sponsor.name} logo`}
                              className="w-16 h-16 object-contain border rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-2xl">
                              {sponsor.logo}
                            </div>
                          )
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{sponsor.name}</h3>
                          {sponsor.boothNumber && (
                            <p className="text-sm text-gray-600">Booth: {sponsor.boothNumber}</p>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{sponsor.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          Visit Website
                        </a>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
                          Learn More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Sponsor Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">All Sponsors Receive:</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Exhibition space at the event</li>
                  <li>• Logo placement on event materials</li>
                  <li>• Social media recognition</li>
                  <li>• Networking opportunities with delegates</li>
                  <li>• Post-event attendee list (opt-in)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Premium Tiers Include:</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Speaking opportunities</li>
                  <li>• Workshop hosting options</li>
                  <li>• Premium exhibition locations</li>
                  <li>• Dedicated networking sessions</li>
                  <li>• Enhanced brand visibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

