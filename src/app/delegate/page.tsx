'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '../components/BrandingHeader'

interface BrandingData {
  eventTitle: string
  eventDate: string
  eventLocation: string
  primaryColor: string
  secondaryColor: string
  headerTextColor: string
  contentTextColor: string
  backgroundColor: string
  headerBackgroundColor: string
  logoUrl: string
  headerBackgroundImageUrl?: string
  pageBackgroundImageUrl?: string
  useHeaderBackgroundImage: boolean
  usePageBackgroundImage: boolean
  sponsorLogos: Array<{ id: string; name: string; url: string }>
}

export default function DelegatePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [branding, setBranding] = useState<BrandingData>({
    eventTitle: "fwdLive! GOING FOR GROWTH 2025",
    eventDate: "12 June 2025",
    eventLocation: "Crowne Plaza, Stratford upon Avon",
    primaryColor: "blue",
    secondaryColor: "gray",
    headerTextColor: "white",
    contentTextColor: "black",
    backgroundColor: "gray",
    headerBackgroundColor: "blue",
    logoUrl: "",
    headerBackgroundImageUrl: "",
    pageBackgroundImageUrl: "",
    useHeaderBackgroundImage: false,
    usePageBackgroundImage: false,
    sponsorLogos: []
  })

  // Load branding data from API with real-time updates
  useEffect(() => {
    const loadBranding = () => {
      fetch('/api/branding')
        .then(res => res.json())
        .then(data => setBranding(data))
        .catch(error => console.error('Failed to load branding:', error))
    }

    loadBranding()
    
    // Set up polling for real-time updates (every 2 seconds)
    const interval = setInterval(loadBranding, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const getBackgroundStyle = () => {
    if (branding.usePageBackgroundImage && branding.pageBackgroundImageUrl) {
      return {
        backgroundImage: `url(${branding.pageBackgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }
    }
    return {}
  }

  const getBackgroundColorClass = () => {
    if (!branding.usePageBackgroundImage) {
      const colorMap: Record<string, string> = {
        blue: 'bg-blue-50',
        green: 'bg-green-50',
        purple: 'bg-purple-50',
        red: 'bg-red-50',
        orange: 'bg-orange-50',
        teal: 'bg-teal-50',
        pink: 'bg-pink-50',
        indigo: 'bg-indigo-50',
        gray: 'bg-gray-50'
      }
      return colorMap[branding.backgroundColor] || 'bg-gray-50'
    }
    return ''
  }

  const getColorValue = (colorType: string) => {
    const color = branding[colorType as keyof BrandingData] as string
    const colorOptions = [
      { value: 'blue', hex: '#2563EB' },
      { value: 'green', hex: '#059669' },
      { value: 'purple', hex: '#9333EA' },
      { value: 'red', hex: '#DC2626' },
      { value: 'orange', hex: '#EA580C' },
      { value: 'teal', hex: '#0D9488' },
      { value: 'pink', hex: '#DB2777' },
      { value: 'indigo', hex: '#4F46E5' },
      { value: 'gray', hex: '#6B7280' },
      { value: 'white', hex: '#FFFFFF' },
      { value: 'black', hex: '#000000' }
    ]
    
    // If it's already a hex color, return it directly
    if (color.startsWith('#')) {
      return color
    }
    const matchingColor = colorOptions.find(c => c.value === color)
    // If it's a named color, return hex value
    return matchingColor?.hex || color
  }

  return (
    <div className={`min-h-screen ${getBackgroundColorClass()}`} style={getBackgroundStyle()}>
      {/* Modern Branding Header */}
      <BrandingHeader
        activeTab="delegate"
        onTabChange={(tab) => {
          if (tab === 'overview') window.location.href = '/'
          if (tab === 'register') window.location.href = '/register'
          if (tab === 'admin') window.location.href = '/admin'
          if (tab === 'messages') window.location.href = '/messages'
          if (tab === 'voting') window.location.href = '/voting'
          if (tab === 'venue') window.location.href = '/venue'
          if (tab === 'sponsors') window.location.href = '/sponsors'
          if (tab === 'agenda') window.location.href = '/agenda'
        }}
      />

      {/* Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Content sections would go here */}
        <div className="bg-white bg-opacity-95 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: getColorValue('contentTextColor') }}>Delegate Dashboard</h2>
          <p style={{ color: getColorValue('contentTextColor') }} className="mb-4">
            Welcome to delegate area. Here you can view venue information, sponsors, agenda, and participate in messaging and voting.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-95 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4" style={{ color: getColorValue('contentTextColor') }}>Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" style={{ color: getColorValue('contentTextColor') }}>
                  📅 Schedule
                </button>
                <button className="w-full text-left px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors" style={{ color: getColorValue('contentTextColor') }}>
                  🗺️ Venue Map
                </button>
                <button className="w-full text-left px-4 py-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors" style={{ color: getColorValue('contentTextColor') }}>
                  💬 Join Discussion
                </button>
                <button 
                  onClick={() => {
                    console.log('Book Tickets clicked - navigating to register')
                    window.location.assign('/register')
                  }}
                  className="w-full text-left px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors font-semibold cursor-pointer"
                  style={{ color: getColorValue('contentTextColor') }}
                >
                  🎫 Book Tickets
                </button>
              </div>
            </div>

            <div className="bg-white bg-opacity-95 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4" style={{ color: getColorValue('contentTextColor') }}>Recent Updates</h3>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium" style={{ color: getColorValue('contentTextColor') }}>Welcome to fwdLive! 2025</h4>
                  <p className="text-sm" style={{ color: getColorValue('contentTextColor') }}>Get ready for an amazing conference experience!</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h4 className="font-medium" style={{ color: getColorValue('contentTextColor') }}>Registration Open</h4>
                  <p className="text-sm" style={{ color: getColorValue('contentTextColor') }}>Check your schedule and prepare for the event.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
