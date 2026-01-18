'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '../components/BrandingHeader'

interface BookingData {
  reference: string
  delegates: Array<{
    firstName: string
    lastName: string
    email: string
    jobTitle: string
    ticketType: string
  }>
  billingInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  totalAmount: number
  timestamp: string
}

export default function ConfirmationPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get booking data from localStorage
    const storedBooking = localStorage.getItem('latestBooking')
    if (storedBooking) {
      setBookingData(JSON.parse(storedBooking))
    }
    setLoading(false)
  }, [])

  const getTicketPrice = (ticketType: string) => {
    const prices = {
      CONFERENCE_DINNER_ACCOMMODATION: 499,
      CONFERENCE_DINNER: 429,
      CONFERENCE_ONLY: 399
    }
    return prices[ticketType as keyof typeof prices] || 0
  }

  const getTicketLabel = (ticketType: string) => {
    return ticketType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const handlePrint = () => {
    // Create a print-friendly version
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Confirmation - ${bookingData?.reference}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #e23f2c; text-align: center; }
          h2 { color: #333; border-bottom: 2px solid #e23f2c; padding-bottom: 10px; }
          .reference { background: #e3f2fd; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
          .section { margin: 30px 0; }
          .delegate-info { background: #f9f9f9; padding: 15px; border-radius: 5px; }
          .total { font-size: 18px; font-weight: bold; color: #059669; text-align: right; margin: 20px 0; }
          @media print { body { margin: 10px; } }
        </style>
      </head>
      <body>
        <h1>Booking Confirmation</h1>
        <div class="reference">Reference: ${bookingData?.reference}</div>
        
        <div class="section">
          <h2>Delegate Information</h2>
          ${bookingData?.delegates.map(delegate => `
            <div class="delegate-info">
              <p><strong>Name:</strong> ${delegate.firstName} ${delegate.lastName}</p>
              <p><strong>Email:</strong> ${delegate.email}</p>
              <p><strong>Job Title:</strong> ${delegate.jobTitle}</p>
              <p><strong>Ticket Type:</strong> ${getTicketLabel(delegate.ticketType)} - £${getTicketPrice(delegate.ticketType)}</p>
            </div>
          `).join('<hr>')}
        </div>
        
        <div class="section">
          <h2>Billing Information</h2>
          <div class="delegate-info">
            <p><strong>Name:</strong> ${bookingData?.billingInfo.name}</p>
            <p><strong>Email:</strong> ${bookingData?.billingInfo.email}</p>
            <p><strong>Phone:</strong> ${bookingData?.billingInfo.phone}</p>
            <p><strong>Address:</strong> ${bookingData?.billingInfo.address}</p>
          </div>
        </div>
        
        <div class="total">
          Total Amount Paid: £${bookingData?.totalAmount}
        </div>
        
        <div class="section">
          <p><strong>Event:</strong> fwdLive! GOING FOR GROWTH 2025</p>
          <p><strong>Date:</strong> 12 June 2025</p>
          <p><strong>Location:</strong> Crowne Plaza, Stratford upon Avon</p>
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  const handleSave = () => {
    if (bookingData) {
      // Create PDF content
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Booking Confirmation - ${bookingData.reference}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #e23f2c; text-align: center; }
            h2 { color: #333; border-bottom: 2px solid #e23f2c; padding-bottom: 10px; }
            .reference { background: #e3f2fd; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
            .section { margin: 30px 0; }
            .delegate-info { background: #f9f9f9; padding: 15px; border-radius: 5px; }
            .total { font-size: 18px; font-weight: bold; color: #059669; text-align: right; margin: 20px 0; }
            @page { size: A4; margin: 1cm; }
          </style>
        </head>
        <body>
          <h1>Booking Confirmation</h1>
          <div class="reference">Reference: ${bookingData.reference}</div>
          
          <div class="section">
            <h2>Delegate Information</h2>
            ${bookingData.delegates.map(delegate => `
              <div class="delegate-info">
                <p><strong>Name:</strong> ${delegate.firstName} ${delegate.lastName}</p>
                <p><strong>Email:</strong> ${delegate.email}</p>
                <p><strong>Job Title:</strong> ${delegate.jobTitle}</p>
                <p><strong>Ticket Type:</strong> ${getTicketLabel(delegate.ticketType)} - £${getTicketPrice(delegate.ticketType)}</p>
              </div>
            `).join('<hr>')}
          </div>
          
          <div class="section">
            <h2>Billing Information</h2>
            <div class="delegate-info">
              <p><strong>Name:</strong> ${bookingData.billingInfo.name}</p>
              <p><strong>Email:</strong> ${bookingData.billingInfo.email}</p>
              <p><strong>Phone:</strong> ${bookingData.billingInfo.phone}</p>
              <p><strong>Address:</strong> ${bookingData.billingInfo.address}</p>
            </div>
          </div>
          
          <div class="total">
            Total Amount Paid: £${bookingData.totalAmount}
          </div>
          
          <div class="section">
            <p><strong>Event:</strong> fwdLive! GOING FOR GROWTH 2025</p>
            <p><strong>Date:</strong> 12 June 2025</p>
            <p><strong>Location:</strong> Crowne Plaza, Stratford upon Avon</p>
          </div>
        </body>
        </html>
      `
      
      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `booking-${bookingData.reference}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BrandingHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Booking Found</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your booking details. Please make a booking first.
            </p>
            <a
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Registration
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandingHeader
        activeTab=""
        onTabChange={(tab) => {
          if (tab === 'overview') window.location.href = '/'
          if (tab === 'venue') window.location.href = '/venue'
          if (tab === 'sponsors') window.location.href = '/sponsors'
          if (tab === 'agenda') window.location.href = '/agenda'
          if (tab === 'messages') window.location.href = '/messages'
          if (tab === 'voting') window.location.href = '/voting'
          if (tab === 'register') window.location.href = '/register'
          if (tab === 'delegate') window.location.href = '/delegate'
          if (tab === 'admin') window.location.href = '/admin'
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Booking Confirmed!</h1>
          <p className="text-green-700">
            Thank you for your registration. Your booking has been successfully processed.
          </p>
        </div>

        {/* Booking Reference */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Booking Reference</h2>
            <div className="text-3xl font-bold text-blue-600 font-mono bg-blue-50 inline-block px-6 py-3 rounded-lg">
              {bookingData.reference}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Please save this reference number for your records
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            🖨️ Print Confirmation
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            💾 Save Details
          </button>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>
          
          {/* Delegate Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delegate Information</h3>
            <div className="space-y-4">
              {bookingData.delegates.map((delegate, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium text-gray-900">
                    Delegate {index + 1}: {delegate.firstName} {delegate.lastName}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-900">{delegate.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Job Title:</span>
                      <span className="ml-2 text-gray-900">{delegate.jobTitle}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ticket Type:</span>
                      <span className="ml-2 text-gray-900">{getTicketLabel(delegate.ticketType)}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      £{getTicketPrice(delegate.ticketType)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900">{bookingData.billingInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-900">{bookingData.billingInfo.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 text-gray-900">{bookingData.billingInfo.phone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2 text-gray-900">{bookingData.billingInfo.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Total Amount Paid</h3>
              <div className="text-2xl font-bold text-green-600">
                £{bookingData.totalAmount}
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Important Information</h3>
          <ul className="space-y-2 text-yellow-700">
            <li>• A confirmation email has been sent to your registered email address</li>
            <li>• Please arrive at the venue 30 minutes before the event starts</li>
            <li>• Bring a valid photo ID for registration at the venue</li>
            <li>• For any changes to your booking, contact us with your reference number</li>
            <li>• Dietary requirements and special requests have been noted and will be accommodated</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-3xl mb-2">📧</div>
              <h4 className="font-medium text-gray-900">Check Your Email</h4>
              <p className="text-sm text-gray-600">
                You'll receive a detailed confirmation email shortly
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">📅</div>
              <h4 className="font-medium text-gray-900">Add to Calendar</h4>
              <p className="text-sm text-gray-600">
                Save the event date to your calendar
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🏨</div>
              <h4 className="font-medium text-gray-900">Plan Your Trip</h4>
              <p className="text-sm text-gray-600">
                Book accommodation and travel arrangements
              </p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <a
              href="/"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </a>
            <a
              href="/messages"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join Discussion
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
