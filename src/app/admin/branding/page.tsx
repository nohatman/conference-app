'use client'

import { useState, useRef } from 'react'

interface BrandingData {
  eventTitle: string
  eventDate: string
  eventLocation: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  backgroundColor: string
  backgroundImageUrl?: string
  logoUrl: string
  sponsorLogos: Array<{ id: string; name: string; url: string }>
}

export default function AdminBrandingPage() {
  const [branding, setBranding] = useState<BrandingData>({
    eventTitle: "fwdLive! GOING FOR GROWTH 2025",
    eventDate: "12 June 2025",
    eventLocation: "Crowne Plaza, Stratford upon Avon",
    primaryColor: "blue",
    secondaryColor: "gray",
    textColor: "white",
    backgroundColor: "gray",
    logoUrl: "",
    backgroundImageUrl: "",
    sponsorLogos: []
  })

  const getColorClass = (color: string, type: 'bg' | 'text' = 'bg') => {
    const colorMap: Record<string, string> = {
      blue: type === 'bg' ? 'bg-blue-600' : 'text-blue-600',
      green: type === 'bg' ? 'bg-green-600' : 'text-green-600',
      purple: type === 'bg' ? 'bg-purple-600' : 'text-purple-600',
      red: type === 'bg' ? 'bg-red-600' : 'text-red-600',
      orange: type === 'bg' ? 'bg-orange-600' : 'text-orange-600',
      teal: type === 'bg' ? 'bg-teal-600' : 'text-teal-600',
      pink: type === 'bg' ? 'bg-pink-600' : 'text-pink-600',
      indigo: type === 'bg' ? 'bg-indigo-600' : 'text-indigo-600',
      gray: type === 'bg' ? 'bg-gray-600' : 'text-gray-600'
    }
    return colorMap[color] || colorMap.blue
  }

  const [uploading, setUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const sponsorInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'background')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const { url } = await response.json()
        setBranding(prev => ({ ...prev, backgroundImageUrl: url }))
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor' | 'textColor' | 'backgroundColor', value: string) => {
    // Check if it's a predefined color
    const matchingColor = colorOptions.find(c => c.value === value)
    if (matchingColor) {
      setBranding(prev => ({ ...prev, [colorType]: value }))
    } else {
      // Custom hex color - store as hex
      setBranding(prev => ({ ...prev, [colorType]: value }))
    }
  }

  const getColorValue = (colorType: string) => {
    const color = branding[colorType as keyof BrandingData] as string
    const matchingColor = colorOptions.find(c => c.value === color)
    return matchingColor?.hex || color
  }

  const getColorLabel = (colorType: string) => {
    const color = branding[colorType as keyof BrandingData] as string
    const matchingColor = colorOptions.find(c => c.value === color)
    return matchingColor?.value || color
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'logo')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const { url } = await response.json()
        setBranding(prev => ({ ...prev, logoUrl: url }))
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSponsorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
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
        const sponsorName = prompt('Enter sponsor name:') || 'New Sponsor'
        setBranding(prev => ({
          ...prev,
          sponsorLogos: [...prev.sponsorLogos, {
            id: Date.now().toString(),
            name: sponsorName,
            url
          }]
        }))
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeSponsor = (id: string) => {
    setBranding(prev => ({
      ...prev,
      sponsorLogos: prev.sponsorLogos.filter(s => s.id !== id)
    }))
  }

  const saveBranding = async () => {
    try {
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding)
      })

      if (response.ok) {
        alert('Branding saved successfully!')
      } else {
        alert('Failed to save branding')
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save branding')
    }
  }

  const colorOptions = [
    { value: 'blue', label: 'Blue', hex: '#2563EB', class: 'bg-blue-600' },
    { value: 'green', label: 'Green', hex: '#059669', class: 'bg-green-600' },
    { value: 'purple', label: 'Purple', hex: '#9333EA', class: 'bg-purple-600' },
    { value: 'red', label: 'Red', hex: '#DC2626', class: 'bg-red-600' },
    { value: 'orange', label: 'Orange', hex: '#EA580C', class: 'bg-orange-600' },
    { value: 'teal', label: 'Teal', hex: '#0D9488', class: 'bg-teal-600' },
    { value: 'pink', label: 'Pink', hex: '#DB2777', class: 'bg-pink-600' },
    { value: 'indigo', label: 'Indigo', hex: '#4F46E5', class: 'bg-indigo-600' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="bg-white bg-opacity-95 rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Branding</h1>
          
          {/* Event Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Event Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={branding.eventTitle}
                  onChange={(e) => setBranding(prev => ({ ...prev, eventTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input
                  type="text"
                  value={branding.eventDate}
                  onChange={(e) => setBranding(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Location</label>
                <input
                  type="text"
                  value={branding.eventLocation}
                  onChange={(e) => setBranding(prev => ({ ...prev, eventLocation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Color Scheme</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="space-y-2">
                  <select
                    value={getColorLabel('primaryColor')}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-8 rounded ${colorOptions.find(c => c.value === getColorLabel('primaryColor'))?.class}`}></div>
                    <input
                      type="color"
                      value={getColorValue('primaryColor')}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-20 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 font-mono">{getColorValue('primaryColor')}</span>
                  </div>
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                <div className="space-y-2">
                  <select
                    value={getColorLabel('secondaryColor')}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-8 rounded ${colorOptions.find(c => c.value === getColorLabel('secondaryColor'))?.class}`}></div>
                    <input
                      type="color"
                      value={getColorValue('secondaryColor')}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-20 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 font-mono">{getColorValue('secondaryColor')}</span>
                  </div>
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                <div className="space-y-2">
                  <select
                    value={getColorLabel('textColor')}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-8 rounded ${colorOptions.find(c => c.value === getColorLabel('textColor'))?.class}`}></div>
                    <input
                      type="color"
                      value={getColorValue('textColor')}
                      onChange={(e) => handleColorChange('textColor', e.target.value)}
                      className="w-20 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 font-mono">{getColorValue('textColor')}</span>
                  </div>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Background Color</label>
                <div className="space-y-2">
                  <select
                    value={getColorLabel('backgroundColor')}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-8 rounded ${colorOptions.find(c => c.value === getColorLabel('backgroundColor'))?.class}`}></div>
                    <input
                      type="color"
                      value={getColorValue('backgroundColor')}
                      onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                      className="w-20 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 font-mono">{getColorValue('backgroundColor')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Event Logo</h2>
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Recommended: PNG or JPG, max 5MB, larger size for better quality
                </p>
              </div>
              {branding.logoUrl && (
                <div className="w-48 h-32 border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={branding.logoUrl}
                    alt="Event Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Background Image Upload */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Background Image</h2>
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <input
                  ref={backgroundInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                />
                <button
                  onClick={() => backgroundInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Background'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Optional: Background image for header area
                </p>
              </div>
              {branding.backgroundImageUrl && (
                <div className="w-48 h-32 border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={branding.backgroundImageUrl}
                    alt="Background Image"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sponsor Logos */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Sponsor Logos</h2>
            <div className="space-y-4">
              <div>
                <input
                  ref={sponsorInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSponsorUpload}
                  className="hidden"
                />
                <button
                  onClick={() => sponsorInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Add Sponsor Logo'}
                </button>
              </div>
              
              {branding.sponsorLogos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {branding.sponsorLogos.map(sponsor => (
                    <div key={sponsor.id} className="border rounded-lg p-3">
                      <div className="relative">
                        <img
                          src={sponsor.url}
                          alt={sponsor.name}
                          className="w-full h-16 object-contain mb-2"
                        />
                        <button
                          onClick={() => removeSponsor(sponsor.id)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm font-medium truncate">{sponsor.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            <div className="border rounded-lg p-4 bg-gray-50 overflow-hidden">
              {branding.backgroundImageUrl ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${branding.backgroundImageUrl})` }}
                />
              ) : null}
              <div className={`relative bg-gradient-to-r ${getColorClass(branding.primaryColor, 'bg')} to-${branding.primaryColor}-800 text-white rounded-lg p-4`}>
                <div className="flex items-center space-x-4">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt="Event Logo"
                      className="w-16 h-16 bg-white rounded-lg object-contain shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-md">
                      <div className={`${getColorClass(branding.primaryColor, 'text')} font-bold text-xl`}>
                        FWD<br/>LIVE
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-2xl">{branding.eventTitle}</h3>
                    <p className="text-sm opacity-90">{branding.eventDate} • {branding.eventLocation}</p>
                  </div>
                </div>
              </div>
              
              {/* Preview Navigation */}
              <div className="relative bg-white border-t">
                <div className="flex space-x-1 p-2">
                  {[
                    { id: "overview", label: "Overview", icon: "🏠" },
                    { id: "venue", label: "Venue", icon: "📍" },
                    { id: "sponsors", label: "Sponsors", icon: "🤝" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`flex items-center space-x-2 px-3 py-2 border-b-2 font-medium text-sm ${
                        'border-blue-500 text-blue-600 bg-blue-50'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveBranding}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Save Branding Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
