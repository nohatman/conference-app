'use client'

import { useState, useEffect } from 'react'

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

interface BrandingHeaderProps {
  activeTab?: string
  tabs?: Array<{ id: string; label: string; icon?: string }>
  onTabChange?: (tabId: string) => void
}

interface TabConfig {
  id: string
  label: string
  icon: string
  enabled: boolean
  order: number
}

export default function BrandingHeader({
  activeTab = "overview",
  tabs,
  onTabChange
}: BrandingHeaderProps) {
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

  const [savedTabs, setSavedTabs] = useState<TabConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTabState, setActiveTabState] = useState(activeTab)

  const loadBranding = async () => {
    try {
      const response = await fetch('/api/branding')
      if (response.ok) {
        const data = await response.json()
        setBranding(data)
      }
    } catch (error) {
      console.error('Failed to load branding:', error)
    }
  }

  useEffect(() => {
    loadBranding()
    loadTabs()
    
    // Listen for tab updates
    const handleTabsUpdate = () => {
      loadTabs()
    }
    
    window.addEventListener('tabs-updated', handleTabsUpdate)
    
    return () => {
      window.removeEventListener('tabs-updated', handleTabsUpdate)
    }
  }, [])

  const loadTabs = async () => {
    try {
      const response = await fetch('/api/tabs?t=' + Date.now()) // Cache busting
      if (response.ok) {
        const data = await response.json()
        // API returns { tabs: [...] } so we need to extract the tabs array
        const tabsArray = data.tabs || []
        setSavedTabs(tabsArray)
        console.log('Loaded tabs:', tabsArray)
      }
    } catch (error) {
      console.error('Failed to load tabs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Use saved tabs if available, otherwise use default tabs
  const effectiveTabs = savedTabs.length > 0 
    ? savedTabs
        .filter(tab => tab.enabled)
        .sort((a, b) => a.order - b.order)
        .map(tab => ({ id: tab.id, label: tab.label, icon: tab.icon }))
    : tabs || [
        { id: "overview", label: "Overview", icon: "🏠" },
        { id: "venue", label: "Venue", icon: "📍" },
        { id: "sponsors", label: "Sponsors", icon: "🤝" },
        { id: "agenda", label: "Agenda", icon: "📅" },
        { id: "messages", label: "Messages", icon: "💬" },
        { id: "voting", label: "Voting", icon: "🗳️" },
        { id: "register", label: "Book Tickets", icon: "🎫" }
      ]

  // Debug logging
  console.log('Saved tabs:', savedTabs)
  console.log('Effective tabs:', effectiveTabs)

  const getColorClass = (color: string, type: 'bg' | 'text' = 'bg') => {
    // Handle hex colors by using them directly as CSS custom properties
    if (color.startsWith('#')) {
      return type === 'bg' ? '' : '' // Will be handled by inline styles
    }
    
    const colorMap: Record<string, string> = {
      blue: type === 'bg' ? 'bg-blue-600' : 'text-blue-600',
      green: type === 'bg' ? 'bg-green-600' : 'text-green-600',
      purple: type === 'bg' ? 'bg-purple-600' : 'text-purple-600',
      red: type === 'bg' ? 'bg-red-600' : 'text-red-600',
      orange: type === 'bg' ? 'bg-orange-600' : 'text-orange-600',
      gray: type === 'bg' ? 'bg-gray-600' : 'text-gray-600'
    }
    return colorMap[color] || colorMap.blue
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
      { value: 'indigo', hex: '#4F46E5' }
    ]
    const matchingColor = colorOptions.find(c => c.value === color)
    return matchingColor?.hex || color
  }

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      {/* Top Branding Bar */}
      <div className="relative">
        {branding.useHeaderBackgroundImage && branding.headerBackgroundImageUrl ? (
          <div 
            className="h-32 md:h-40 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${branding.headerBackgroundImageUrl})` }}
          />
        ) : (
          <div 
            className="h-32 md:h-40 bg-gradient-to-r"
            style={{ backgroundColor: getColorValue('headerBackgroundColor') }}
          />
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-40">
          <div className="container mx-auto px-4 py-2 md:py-4 h-full flex items-center">
            <div className="flex flex-col md:flex-row justify-between items-center w-full space-y-3 md:space-y-0">
              {/* Logo and Event Info */}
              <div className="flex items-center space-x-3 md:space-x-4 w-full md:w-auto">
                {/* Event Logo */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  {branding.logoUrl ? (
                    <img 
                      src={branding.logoUrl} 
                      alt="Event Logo" 
                      className="w-12 h-12 md:w-16 md:h-16 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : (
                    <div className={`${getColorClass(branding.primaryColor, 'text')} font-bold text-sm md:text-xl text-center`}>
                      FWD<br/>LIVE
                    </div>
                  )}
                </div>
                
                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg md:text-2xl font-bold truncate" style={{ color: getColorValue('headerTextColor') }}>
                    {branding.eventTitle}
                  </h1>
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-xs md:text-sm opacity-90" style={{ color: getColorValue('headerTextColor') }}>
                    <span className="flex items-center truncate">
                      📅 {branding.eventDate}
                    </span>
                    <span className="flex items-center truncate">
                      📍 {branding.eventLocation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 md:space-x-3 flex-shrink-0">
                <button 
                  onClick={() => window.location.href = '/register'}
                  className="bg-white text-blue-600 px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                >
                  Book Tickets
                </button>
                <button 
                  onClick={() => window.location.href = '/admin'}
                  className="bg-blue-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-32 md:top-40 z-30">
        <div className="container mx-auto px-4">
          {/* Mobile Menu Button */}
          <div className="flex justify-between items-center py-3 md:hidden">
            <h2 className="text-lg font-semibold" style={{ color: getColorValue('headerTextColor') }}>
              {branding.eventTitle}
            </h2>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
              style={{ color: getColorValue('headerTextColor') }}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex space-x-1 py-2 overflow-x-auto">
            {effectiveTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTabState(tab.id)
                  onTabChange?.(tab.id)
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${getColorClass(branding.primaryColor, 'bg')} text-white`
                    : 'hover:bg-gray-100'
                }`}
                style={{ 
                  color: activeTab === tab.id ? 'white' : getColorValue('contentTextColor')
                }}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-2 border-t">
              {effectiveTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTabState(tab.id)
                    onTabChange?.(tab.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? `${getColorClass(branding.primaryColor, 'bg')} text-white`
                      : 'hover:bg-gray-100'
                  }`}
                  style={{ 
                    color: activeTab === tab.id ? 'white' : getColorValue('contentTextColor')
                  }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Optional Sponsor Banner */}
      {branding.sponsorLogos.length > 0 && (
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Presented by:</span>
              <div className="flex space-x-4">
                {branding.sponsorLogos.slice(0, 2).map((sponsor) => (
                  <div key={sponsor.id} className="w-20 h-8 bg-white rounded flex items-center justify-center">
                    <img
                      src={sponsor.url}
                      alt={sponsor.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
