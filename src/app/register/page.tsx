'use client'

import { useState, useEffect } from 'react'
import BrandingHeader from '../components/BrandingHeader'

interface Delegate {
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  ticketType: 'CONFERENCE_ONLY' | 'CONFERENCE_DINNER' | 'CONFERENCE_DINNER_ACCOMMODATION'
  dietaryRequirements: string
}

interface BillingInfo {
  streetAddress: string
  streetAddress2: string
  city: string
  county: string
  postalCode: string
  purchaseOrder: string
  cardholderName: string
  cardholderPhone: string
}

interface RegistrationData {
  id: string
  bookingReference: string
  firstName: string
  lastName: string
  email: string
  company: string
  jobTitle: string
  ticketType: string
  dietaryRequirements: string
  specialRequests: string
  createdAt: string
  status: string
}

interface RegistrationResponse {
  success: boolean
  message: string
  reference?: string
  registrations?: RegistrationData[]
  registration?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

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
  headerBackgroundImageUrl: string
  pageBackgroundImageUrl: string
  useHeaderBackgroundImage: boolean
  usePageBackgroundImage: boolean
  sponsorLogos: Array<{
    id: string
    name: string
    url: string
  }>
}

export default function RegisterPage() {
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
    
    if (color.startsWith('#')) {
      return color
    }
    const matchingColor = colorOptions.find(c => c.value === color)
    return matchingColor?.hex || color
  }

  const [delegates, setDelegates] = useState<Delegate[]>([{
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    ticketType: 'CONFERENCE_ONLY',
    dietaryRequirements: ''
  }])

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    streetAddress: '',
    streetAddress2: '',
    city: '',
    county: '',
    postalCode: '',
    purchaseOrder: '',
    cardholderName: '',
    cardholderPhone: ''
  })

  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleAddressSearch = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      const suggestions = data.map((item: any) => 
        item.display_name || `${item.address?.road || ''}, ${item.address?.city || ''}, ${item.address?.country || ''}`
      ).filter(Boolean)
      setAddressSuggestions(suggestions)
      setShowAddressSuggestions(true)
    } catch (error) {
      console.error('Address search failed:', error)
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
    }
  }

  const selectAddress = (address: string) => {
    setBillingInfo({ ...billingInfo, streetAddress: address })
    setShowAddressSuggestions(false)
    setAddressSuggestions([])
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    delegates.forEach((delegate, index) => {
      if (!delegate.firstName.trim()) errors[`delegate_${index}_firstName`] = 'First name is required'
      if (!delegate.lastName.trim()) errors[`delegate_${index}_lastName`] = 'Last name is required'
      if (!delegate.email.trim()) errors[`delegate_${index}_email`] = 'Email is required'
      else if (!validateEmail(delegate.email)) errors[`delegate_${index}_email`] = 'Invalid email format'
      if (!delegate.jobTitle.trim()) errors[`delegate_${index}_jobTitle`] = 'Job title is required'
    })

    if (!billingInfo.streetAddress.trim()) errors.streetAddress = 'Street address is required'
    if (!billingInfo.city.trim()) errors.city = 'City is required'
    if (!billingInfo.postalCode.trim()) errors.postalCode = 'Postal code is required'
    if (billingInfo.cardholderPhone && !validatePhone(billingInfo.cardholderPhone)) {
      errors.cardholderPhone = 'Invalid phone number format'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const ticketPrices = {
    CONFERENCE_DINNER_ACCOMMODATION: 499,
    CONFERENCE_DINNER: 429,
    CONFERENCE_ONLY: 399
  }

  const calculateTotal = () => {
    return delegates.reduce((total, delegate) => {
      return total + (ticketPrices[delegate.ticketType as keyof typeof ticketPrices] || 0)
    }, 0)
  }

  const addDelegate = () => {
    if (delegates.length < 10) {
      setDelegates([...delegates, {
        firstName: '',
        lastName: '',
        jobTitle: '',
        email: '',
        ticketType: 'CONFERENCE_ONLY',
        dietaryRequirements: ''
      }])
    }
  }

  const removeDelegate = (index: number) => {
    if (delegates.length > 1) {
      setDelegates(delegates.filter((_, i) => i !== index))
    }
  }

  const updateDelegate = (index: number, field: string, value: string) => {
    const updatedDelegates = [...delegates]
    updatedDelegates[index] = { ...updatedDelegates[index], [field]: value }
    setDelegates(updatedDelegates)
  }

  const updateBillingInfo = (field: string, value: string) => {
    setBillingInfo({ ...billingInfo, [field]: value })
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<RegistrationResponse | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ delegates, billingInfo, total: calculateTotal() })
      })

      const result: RegistrationResponse = await response.json()

      if (result.success) {
        const bookingData = {
          reference: result.reference || `FWD${Date.now().toString().slice(-6)}`,
          delegates,
          billingInfo: {
            name: billingInfo.cardholderName,
            email: delegates[0].email,
            phone: billingInfo.cardholderPhone,
            address: `${billingInfo.streetAddress}, ${billingInfo.city}, ${billingInfo.postalCode}`
          },
          totalAmount: calculateTotal(),
          timestamp: new Date().toISOString()
        }
        
        localStorage.setItem('latestBooking', JSON.stringify(bookingData))
        
        window.location.href = '/confirmation'
        return
      } else {
        setSubmitResult(result)
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Failed to submit registration. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandingHeader
        activeTab="register"
        onTabChange={(tab) => {
          if (tab === 'overview') window.location.href = '/'
          if (tab === 'venue') window.location.href = '/venue'
          if (tab === 'sponsors') window.location.href = '/sponsors'
          if (tab === 'agenda') window.location.href = '/agenda'
          if (tab === 'messages') window.location.href = '/messages'
          if (tab === 'voting') window.location.href = '/voting'
          if (tab === 'delegate') window.location.href = '/delegate'
          if (tab === 'admin') window.location.href = '/admin'
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: getColorValue('primaryColor') }}>
            Book your Tickets
          </h1>
          <p className="text-xl" style={{ color: getColorValue('contentTextColor') }}>
            {branding.eventTitle} - {branding.eventDate}
          </p>
          <p className="text-lg" style={{ color: getColorValue('contentTextColor') }}>
            {branding.eventLocation}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: getColorValue('contentTextColor') }}>
                Delegate Information
              </h2>
              
              {delegates.map((delegate, index) => (
                <div key={index} className="mb-6 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Delegate {index + 1}
                    </h3>
                    {delegates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDelegate(index)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={delegate.firstName}
                        onChange={(e) => updateDelegate(index, 'firstName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors[`delegate_${index}_firstName`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {formErrors[`delegate_${index}_firstName`] && (
                        <p className="text-red-500 text-sm mt-1">{formErrors[`delegate_${index}_firstName`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={delegate.lastName}
                        onChange={(e) => updateDelegate(index, 'lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors[`delegate_${index}_lastName`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {formErrors[`delegate_${index}_lastName`] && (
                        <p className="text-red-500 text-sm mt-1">{formErrors[`delegate_${index}_lastName`]}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={delegate.jobTitle}
                      onChange={(e) => updateDelegate(index, 'jobTitle', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors[`delegate_${index}_jobTitle`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors[`delegate_${index}_jobTitle`] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors[`delegate_${index}_jobTitle`]}</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={delegate.email}
                      onChange={(e) => updateDelegate(index, 'email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors[`delegate_${index}_email`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors[`delegate_${index}_email`] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors[`delegate_${index}_email`]}</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket Type
                    </label>
                    <select
                      value={delegate.ticketType}
                      onChange={(e) => updateDelegate(index, 'ticketType', e.target.value as Delegate['ticketType'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CONFERENCE_ONLY">Conference Only - £399</option>
                      <option value="CONFERENCE_DINNER">Conference + Dinner - £429</option>
                      <option value="CONFERENCE_DINNER_ACCOMMODATION">Conference + Dinner + Accommodation - £499</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dietary Requirements
                    </label>
                    <textarea
                      value={delegate.dietaryRequirements}
                      onChange={(e) => updateDelegate(index, 'dietaryRequirements', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Please specify any dietary requirements..."
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addDelegate}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Another Delegate
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: getColorValue('contentTextColor') }}>
                Billing Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={billingInfo.streetAddress}
                      onChange={(e) => {
                        updateBillingInfo('streetAddress', e.target.value)
                        handleAddressSearch(e.target.value)
                      }}
                      onFocus={() => setShowAddressSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.streetAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Start typing your address..."
                      required
                    />
                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                        {addressSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onClick={() => selectAddress(suggestion)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {formErrors.streetAddress && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.streetAddress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={billingInfo.city}
                    onChange={(e) => updateBillingInfo('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={billingInfo.postalCode}
                    onChange={(e) => updateBillingInfo('postalCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={billingInfo.cardholderName}
                    onChange={(e) => updateBillingInfo('cardholderName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Phone
                  </label>
                  <input
                    type="tel"
                    value={billingInfo.cardholderPhone}
                    onChange={(e) => updateBillingInfo('cardholderPhone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.cardholderPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+44 20 1234 5678"
                  />
                  {formErrors.cardholderPhone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.cardholderPhone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">£{calculateTotal()}</span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Complete Registration'}
              </button>
            </div>

            {submitResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                submitResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {submitResult.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
