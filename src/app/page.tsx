'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from './components/BrandingHeader'
import GlobalBackground from './components/GlobalBackground'

interface EventInfo {
  title: string
  date: string
  location: string
  description: string
  highlights: string[]
}

export default function LandingPage() {
  const [eventInfo] = useState<EventInfo>({
    title: "fwdLive! GOING FOR GROWTH 2025",
    date: "12 June 2025",
    location: "Crowne Plaza, Stratford upon Avon",
    description: "Join us for an inspiring day of growth, networking, and professional development at fwdLive! 2025. This premier conference brings together industry leaders, innovators, and professionals for a day of learning and connection.",
    highlights: [
      "Expert keynote speakers",
      "Interactive workshops", 
      "Networking opportunities",
      "Industry insights",
      "Professional development"
    ]
  })

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path
    }
  }

  return (
    <GlobalBackground>
      {/* Modern Branding Header */}
      <BrandingHeader
        activeTab="overview"
        onTabChange={(tab) => {
          if (tab === 'messages') navigateTo('/messages')
          if (tab === 'voting') navigateTo('/voting')
          if (tab === 'venue') navigateTo('/venue')
          if (tab === 'sponsors') navigateTo('/sponsors')
          if (tab === 'agenda') navigateTo('/agenda')
          if (tab === 'register') navigateTo('/register')
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {eventInfo.title}
          </h1>
          <div className="flex flex-col md:flex-row justify-center items-center mb-8 space-y-2 md:space-y-0 md:space-x-6">
            <div className="flex items-center text-2xl text-gray-600">
              📅 {eventInfo.date}
            </div>
            <div className="flex items-center text-2xl text-gray-600">
              📍 {eventInfo.location}
            </div>
          </div>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-600">
            {eventInfo.description}
          </p>
        </div>

        {/* Event Highlights */}
        <div className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              What to Expect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventInfo.highlights.map((highlight, index) => (
                <div key={index} className="bg-white bg-opacity-95 rounded-lg p-6 shadow-md text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    {highlight}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registration CTA */}
        <div className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white bg-opacity-95 rounded-lg shadow-xl p-8 md:p-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                  Ready to Join Us?
                </h2>
                <p className="text-xl mb-8 text-gray-600">
                  Secure your spot at fwdLive! 2025 and connect with industry leaders.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <a
                    href="/register"
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
                  >
                    Register Now
                  </a>
                  <a
                    href="/delegate"
                    className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/messages')}>
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
            <p className="text-gray-600 text-sm">View announcements and updates</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/voting')}>
            <div className="text-3xl mb-3">🗳️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Voting</h3>
            <p className="text-gray-600 text-sm">Participate in live polls</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/delegate')}>
            <div className="text-3xl mb-3">👤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delegate Area</h3>
            <p className="text-gray-600 text-sm">Access your registration</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/register')}>
            <div className="text-3xl mb-3">🎫</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Register Now</h3>
            <p className="text-gray-600 text-sm">Book your tickets</p>
          </div>
        </div>
      </div>
    </GlobalBackground>
  )
}
