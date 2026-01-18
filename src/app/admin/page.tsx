'use client'

import { useState, useRef } from 'react'

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

interface LogoAsset {
  id: string
  name: string
  url: string
  type: 'logo' | 'background'
}

interface SectionProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}

function AdminSection({ title, children, isOpen, onToggle }: SectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center text-left"
      >
        <span className="font-semibold text-gray-900">{title}</span>
        <span className="text-gray-500">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
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

  const [logoAssets, setLogoAssets] = useState<LogoAsset[]>([])
  const [logoViewMode, setLogoViewMode] = useState<'grid' | 'list'>('grid')
  const [uploading, setUploading] = useState(false)
  const [openSections, setOpenSections] = useState({
    event: true,
    preview: true,
    colors: true,
    logos: false,
    backgrounds: false,
    sponsors: false
  })

  const logoInputRef = useRef<HTMLInputElement>(null)
  const headerBgInputRef = useRef<HTMLInputElement>(null)
  const pageBgInputRef = useRef<HTMLInputElement>(null)
  const sponsorInputRef = useRef<HTMLInputElement>(null)
  const logoAssetInputRef = useRef<HTMLInputElement>(null)

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

  const handleColorChange = (colorType: keyof BrandingData, value: string) => {
    setBranding(prev => ({ ...prev, [colorType]: value }))
  }

  const getColorValue = (colorType: string) => {
    const color = branding[colorType as keyof BrandingData] as string
    // If it's already a hex color, return it directly
    if (color.startsWith('#')) {
      return color
    }
    const matchingColor = colorOptions.find(c => c.value === color)
    // If it's a named color, return the hex value
    return matchingColor?.hex || color
  }

  const getColorLabel = (colorType: string) => {
    const color = branding[colorType as keyof BrandingData] as string
    const matchingColor = colorOptions.find(c => c.value === color)
    return matchingColor?.value || color
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const { url } = await response.json()
        
        if (type === 'logo') {
          setBranding(prev => ({ ...prev, logoUrl: url }))
        } else if (type === 'header-background') {
          setBranding(prev => ({ ...prev, headerBackgroundImageUrl: url }))
        } else if (type === 'page-background') {
          setBranding(prev => ({ ...prev, pageBackgroundImageUrl: url }))
        } else if (type === 'sponsor') {
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
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleBulkLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'logo')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const { url } = await response.json()
          const name = file.name.replace(/\.[^/.]+$/, "") // Remove file extension
          return {
            id: Date.now().toString() + Math.random().toString(36),
            name,
            url,
            type: 'logo' as const
          }
        }
        throw new Error(`Upload failed for ${file.name}`)
      })

      const newLogos = await Promise.all(uploadPromises)
      setLogoAssets(prev => [...prev, ...newLogos])
    } catch (error) {
      console.error('Bulk upload failed:', error)
      alert('Some uploads failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleLogoAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const name = prompt('Enter logo name:') || 'Logo'
        setLogoAssets(prev => [...prev, {
          id: Date.now().toString(),
          name,
          url,
          type: 'logo'
        }])
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const selectLogoAsset = (url: string) => {
    setBranding(prev => ({ ...prev, logoUrl: url }))
  }

  const removeSponsor = (id: string) => {
    setBranding(prev => ({
      ...prev,
      sponsorLogos: prev.sponsorLogos.filter(s => s.id !== id)
    }))
  }

  const removeLogoAsset = (id: string) => {
    setLogoAssets(prev => prev.filter(l => l.id !== id))
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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={saveBranding}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg"
        >
          Save All Changes
        </button>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="bg-white bg-opacity-95 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Event Administration</h1>
            <div className="flex gap-2">
              <a
                href="/admin/tabs"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                📑 Manage Tabs
              </a>
              <a
                href="/admin/venue"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📍 Edit Venue
              </a>
              <a
                href="/admin/agenda"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📅 Edit Agenda
              </a>
              <a
                href="/admin/sponsors"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                🤝 Edit Sponsors
              </a>
              <a
                href="/bookings"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                📊 View Bookings
              </a>
            </div>
          </div>

          {/* Live Preview */}
          <AdminSection
            title="Live Preview"
            isOpen={openSections.preview}
            onToggle={() => toggleSection('preview')}
          >
            <div className="border rounded-lg p-2 bg-gray-50 overflow-hidden">
              <div className="relative h-48 max-w-md mx-auto">
                {/* Page Background */}
                {branding.usePageBackgroundImage && branding.pageBackgroundImageUrl ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                    style={{ backgroundImage: `url(${branding.pageBackgroundImageUrl})` }}
                  />
                ) : (
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundColor: getColorValue('backgroundColor') }}
                  />
                )}
                
                <div className="relative h-full overflow-hidden">
                  {/* Header Background */}
                  {branding.useHeaderBackgroundImage && branding.headerBackgroundImageUrl ? (
                    <div 
                      className="h-12 bg-cover bg-center bg-no-repeat mb-1"
                      style={{ backgroundImage: `url(${branding.headerBackgroundImageUrl})` }}
                    />
                  ) : (
                    <div 
                      className="h-12 bg-gradient-to-r mb-1 flex items-center px-2"
                      style={{ backgroundColor: getColorValue('headerBackgroundColor') }}
                    >
                      {branding.logoUrl ? (
                        <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                      ) : (
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-xs">FWD</span>
                        </div>
                      )}
                      <div className="ml-1" style={{ color: getColorValue('headerTextColor') }}>
                        <h4 className="text-xs font-bold truncate">{branding.eventTitle}</h4>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Tabs */}
                  <div className="bg-white rounded shadow-sm mb-1">
                    <div className="flex space-x-1 p-1">
                      {['Overview', 'Venue'].map((tab) => (
                        <button
                          key={tab}
                          className="px-1 py-1 text-xs font-medium rounded hover:bg-gray-100"
                          style={{ color: getColorValue('contentTextColor') }}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="bg-white rounded p-2">
                    <h3 style={{ color: getColorValue('contentTextColor') }} className="text-xs font-bold mb-1">Dashboard</h3>
                    <p style={{ color: getColorValue('contentTextColor') }} className="text-xs">
                      Welcome to delegate area with quick actions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AdminSection>

          {/* Event Information */}
          <AdminSection
            title="Event Information"
            isOpen={openSections.event}
            onToggle={() => toggleSection('event')}
          >
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
          </AdminSection>

          {/* Color Scheme */}
          <AdminSection
            title="Color Scheme"
            isOpen={openSections.colors}
            onToggle={() => toggleSection('colors')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'primaryColor', label: 'Primary Color' },
                { key: 'secondaryColor', label: 'Secondary Color' },
                { key: 'headerTextColor', label: 'Header Text Color' },
                { key: 'contentTextColor', label: 'Content Text Color' },
                { key: 'backgroundColor', label: 'Page Background Color' },
                { key: 'headerBackgroundColor', label: 'Header Background Color' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={getColorValue(key)}
                      onChange={(e) => handleColorChange(key as keyof BrandingData, e.target.value)}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={getColorValue(key)}
                      onChange={(e) => handleColorChange(key as keyof BrandingData, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </AdminSection>

          {/* Logo Management */}
          <AdminSection
            title="Logo Management"
            isOpen={openSections.logos}
            onToggle={() => toggleSection('logos')}
          >
            <div className="space-y-4">
              {/* View Toggle and Bulk Upload */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setLogoViewMode('grid')}
                    className={`px-3 py-1 text-sm rounded ${
                      logoViewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                    }`}
                  >
                    Grid View
                  </button>
                  <button
                    onClick={() => setLogoViewMode('list')}
                    className={`px-3 py-1 text-sm rounded ${
                      logoViewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                    }`}
                  >
                    List View
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    ref={logoAssetInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBulkLogoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => logoAssetInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    {uploading ? 'Uploading...' : 'Bulk Upload'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Logo</label>
                <div className="flex items-center space-x-4">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="Current Logo" className="w-16 h-16 object-contain border rounded" />
                  ) : (
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500">
                      No logo
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Current selection</p>
                    <button
                      onClick={() => setBranding(prev => ({ ...prev, logoUrl: '' }))}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Clear logo
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Library ({logoAssets.length})</label>
                {logoViewMode === 'grid' ? (
                  <div className="grid grid-cols-4 gap-2">
                    {logoAssets.map((logo) => (
                      <div key={logo.id} className="relative group">
                        <img
                          src={logo.url}
                          alt={logo.name}
                          className="w-full h-16 object-contain border rounded cursor-pointer hover:border-blue-500"
                          onClick={() => selectLogoAsset(logo.url)}
                        />
                        <button
                          onClick={() => removeLogoAsset(logo.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 truncate mt-1">{logo.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {logoAssets.map((logo) => (
                      <div key={logo.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <img
                            src={logo.url}
                            alt={logo.name}
                            className="w-12 h-12 object-contain border rounded cursor-pointer"
                            onClick={() => selectLogoAsset(logo.url)}
                          />
                          <div>
                            <p className="text-sm font-medium">{logo.name}</p>
                            <p className="text-xs text-gray-500">Click to select</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => selectLogoAsset(logo.url)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => removeLogoAsset(logo.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </AdminSection>

          {/* Background Images */}
          <AdminSection
            title="Background Images"
            isOpen={openSections.backgrounds}
            onToggle={() => toggleSection('backgrounds')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Header Background</label>
                
                <div className="flex items-center space-x-3 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={branding.useHeaderBackgroundImage}
                      onChange={(e) => setBranding(prev => ({ ...prev, useHeaderBackgroundImage: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Use Image</span>
                  </label>
                  {!branding.useHeaderBackgroundImage && (
                    <span className="text-sm text-gray-500">Using Color</span>
                  )}
                </div>

                {branding.useHeaderBackgroundImage ? (
                  <div>
                    <input
                      ref={headerBgInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e, 'header-background')}
                      className="hidden"
                    />
                    <button
                      onClick={() => headerBgInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm w-full mb-2"
                    >
                      {uploading ? 'Uploading...' : 'Upload Header Background'}
                    </button>
                    {branding.headerBackgroundImageUrl && (
                      <img src={branding.headerBackgroundImageUrl} alt="Header Background" className="w-full h-20 object-cover rounded" />
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    Using header background color from Color Scheme section
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Background</label>
                
                <div className="flex items-center space-x-3 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={branding.usePageBackgroundImage}
                      onChange={(e) => setBranding(prev => ({ ...prev, usePageBackgroundImage: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Use Image</span>
                  </label>
                  {!branding.usePageBackgroundImage && (
                    <span className="text-sm text-gray-500">Using Color</span>
                  )}
                </div>

                {branding.usePageBackgroundImage ? (
                  <div>
                    <input
                      ref={pageBgInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e, 'page-background')}
                      className="hidden"
                    />
                    <button
                      onClick={() => pageBgInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 text-sm w-full mb-2"
                    >
                      {uploading ? 'Uploading...' : 'Upload Page Background'}
                    </button>
                    {branding.pageBackgroundImageUrl && (
                      <img src={branding.pageBackgroundImageUrl} alt="Page Background" className="w-full h-20 object-cover rounded" />
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    Using page background color from Color Scheme section
                  </div>
                )}
              </div>
            </div>
          </AdminSection>

          {/* Sponsor Logos */}
          <AdminSection
            title="Sponsor Logos"
            isOpen={openSections.sponsors}
            onToggle={() => toggleSection('sponsors')}
          >
            <div className="space-y-4">
              <div>
                <input
                  ref={sponsorInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, 'sponsor')}
                  className="hidden"
                />
                <button
                  onClick={() => sponsorInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {uploading ? 'Uploading...' : 'Add Sponsor Logo'}
                </button>
              </div>
              
              {branding.sponsorLogos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {branding.sponsorLogos.map((sponsor) => (
                    <div key={sponsor.id} className="relative group">
                      <img
                        src={sponsor.url}
                        alt={sponsor.name}
                        className="w-full h-12 object-contain border rounded"
                      />
                      <button
                        onClick={() => removeSponsor(sponsor.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 truncate">{sponsor.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AdminSection>
        </div>
      </div>
    </div>
  )
}
