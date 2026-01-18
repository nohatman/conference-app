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

interface GlobalBackgroundProps {
  children: React.ReactNode
}

export default function GlobalBackground({ children }: GlobalBackgroundProps) {
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

  useEffect(() => {
    fetch('/api/branding')
      .then(res => res.json())
      .then(data => setBranding(data))
      .catch(error => console.error('Failed to load branding:', error))
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

  return (
    <div className={`min-h-screen ${getBackgroundColorClass()}`} style={getBackgroundStyle()}>
      {children}
    </div>
  )
}
