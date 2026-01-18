import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const REGISTRATIONS_FILE = join(process.cwd(), 'data', 'registrations.json')

interface RegistrationData {
  id: string
  bookingReference: string
  firstName: string
  lastName: string
  email: string
  company?: string
  jobTitle?: string
  ticketType: string
  dietaryRequirements?: string
  specialRequests?: string
  billingName?: string
  billingEmail?: string
  billingPhone?: string
  billingAddress?: string
  createdAt: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

// Load existing registrations
async function getRegistrations(): Promise<RegistrationData[]> {
  try {
    const data = await readFile(REGISTRATIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Save registrations
async function saveRegistrations(registrations: RegistrationData[]): Promise<void> {
  const dataDir = join(process.cwd(), 'data')
  try {
    await writeFile(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2))
  } catch (error) {
    console.error('Failed to save registrations:', error)
    throw new Error('Failed to save registration')
  }
}

// Send email notification (placeholder - would integrate with email service)
const sendEmailNotification = (registration: any) => {
  console.log(' EMAIL NOTIFICATION SENT:')
  console.log('To: admin@conference.com')
  console.log('Subject: New Registration Received')
  console.log('Registration Details:', JSON.stringify(registration, null, 2))
  
  // TODO: Replace with real email service like:
  // - SendGrid (sendgrid.com)
  // - Resend (resend.com) 
  // - AWS SES
  // - Nodemailer with SMTP
}

const sendAutoresponder = (delegate: any) => {
  console.log(' AUTO-RESPONDER SENT TO:', delegate.email)
  console.log('Subject: Registration Confirmation - fwdLive! 2025')
  
  const emailContent = `
    Thank you for registering for fwdLive! GOING FOR GROWTH 2025!
    
    Registration Details:
    - Name: ${delegate.firstName} ${delegate.lastName}
    - Email: ${delegate.email}
    - Company: ${delegate.company || 'N/A'}
    - Job Title: ${delegate.jobTitle || 'N/A'}
    - Ticket Type: ${delegate.ticketType}
    - Dietary Requirements: ${delegate.dietaryRequirements || 'None'}
    - Special Requests: ${delegate.specialRequests || 'None'}
    
    Event Details:
    - Date: 12 June 2025
    - Location: Crowne Plaza, Stratford upon Avon
    
    Status: ${delegate.status}
    
    We will send you a confirmation email once your registration is reviewed and confirmed.
    
    Best regards,
    fwdLive! 2025 Team
  `
  
  console.log('Email content:', emailContent)
}

export async function GET() {
  try {
    const registrations = await getRegistrations()
    return NextResponse.json(registrations)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load registrations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle both old format (single delegate) and new format (multiple delegates)
    const delegates = body.delegates || [body]
    const billingInfo = body.billingInfo || {}
    
    if (!delegates || delegates.length === 0) {
      return NextResponse.json(
        { error: 'No delegate data provided' },
        { status: 400 }
      )
    }

    // Validate each delegate
    for (const delegate of delegates) {
      if (!delegate.firstName || !delegate.lastName || !delegate.email || !delegate.ticketType) {
        return NextResponse.json(
          { error: 'Missing required fields for one or more delegates: firstName, lastName, email, ticketType' },
          { status: 400 }
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(delegate.email)) {
        return NextResponse.json(
          { error: `Invalid email format: ${delegate.email}` },
          { status: 400 }
        )
      }
    }

    // Create registrations for each delegate
    const baseReference = `FWD${Date.now().toString().slice(-6)}`
    const registrations: RegistrationData[] = delegates.map((delegate, index) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      bookingReference: delegates.length > 1 ? `${baseReference}-${index + 1}` : baseReference,
      firstName: delegate.firstName,
      lastName: delegate.lastName,
      email: delegate.email,
      company: billingInfo.company || '',
      jobTitle: delegate.jobTitle || '',
      ticketType: delegate.ticketType,
      dietaryRequirements: delegate.dietaryRequirements || '',
      specialRequests: delegate.specialRequests || '',
      billingName: billingInfo.cardholderName || '',
      billingEmail: delegate.email,
      billingPhone: billingInfo.cardholderPhone || '',
      billingAddress: `${billingInfo.streetAddress}, ${billingInfo.city}, ${billingInfo.postalCode}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }))

    // Save registrations
    const existingRegistrations = await getRegistrations()
    existingRegistrations.push(...registrations)
    await saveRegistrations(existingRegistrations)

    // Send email notifications for each registration
    registrations.forEach(registration => {
      sendEmailNotification(registration)
      sendAutoresponder(registration)
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      reference: baseReference,
      registrations
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to submit registration' },
      { status: 500 }
    )
  }
}
