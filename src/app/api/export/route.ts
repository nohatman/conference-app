import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
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
  status: string
}

async function getRegistrations(): Promise<RegistrationData[]> {
  try {
    const data = await readFile(REGISTRATIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function generateCSV(bookings: RegistrationData[]): string {
  const headers = [
    'Booking Reference',
    'First Name',
    'Last Name',
    'Email',
    'Company',
    'Job Title',
    'Ticket Type',
    'Price',
    'Dietary Requirements',
    'Special Requests',
    'Billing Name',
    'Billing Email',
    'Billing Phone',
    'Billing Address',
    'Status',
    'Created Date'
  ]

  const ticketPrices = {
    CONFERENCE_DINNER_ACCOMMODATION: 499,
    CONFERENCE_DINNER: 429,
    CONFERENCE_ONLY: 399
  }

  const rows = bookings.map(booking => [
    booking.bookingReference || booking.id,
    booking.firstName,
    booking.lastName,
    booking.email,
    booking.company || '',
    booking.jobTitle || '',
    booking.ticketType,
    ticketPrices[booking.ticketType as keyof typeof ticketPrices] || 0,
    booking.dietaryRequirements || '',
    booking.specialRequests || '',
    booking.billingName || '',
    booking.billingEmail || '',
    booking.billingPhone || '',
    booking.billingAddress || '',
    booking.status,
    new Date(booking.createdAt).toLocaleDateString()
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csvContent
}

function generatePDF(bookings: RegistrationData[]): string {
  const ticketPrices = {
    CONFERENCE_DINNER_ACCOMMODATION: 499,
    CONFERENCE_DINNER: 429,
    CONFERENCE_ONLY: 399
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #e23f2c; text-align: center; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .status-pending { background-color: #fff3cd; }
        .status-confirmed { background-color: #d4edda; }
        .status-cancelled { background-color: #f8d7da; }
        .summary { margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px; }
        .billing-section { margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; }
        @media print {
          body { margin: 10px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Booking Report - fwdLive! 2025</h1>
      <p style="text-align: center; margin-bottom: 30px;">
        Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
      </p>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Ticket Type</th>
            <th>Price</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(booking => `
            <tr class="status-${booking.status}">
              <td>${booking.firstName} ${booking.lastName}</td>
              <td>${booking.email}</td>
              <td>${booking.company || '-'}</td>
              <td>${booking.ticketType.replace(/_/g, ' ')}</td>
              <td>£${ticketPrices[booking.ticketType as keyof typeof ticketPrices] || 0}</td>
              <td>${booking.status}</td>
              <td>${new Date(booking.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="billing-section">
        <h3>Billing Information Summary</h3>
        <table style="margin-top: 15px;">
          <thead>
            <tr>
              <th>Booking Reference</th>
              <th>Billing Name</th>
              <th>Billing Email</th>
              <th>Billing Phone</th>
              <th>Billing Address</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(booking => `
              <tr>
                <td>${booking.bookingReference || booking.id}</td>
                <td>${booking.billingName || '-'}</td>
                <td>${booking.billingEmail || '-'}</td>
                <td>${booking.billingPhone || '-'}</td>
                <td>${booking.billingAddress || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Bookings:</strong> ${bookings.length}</p>
        <p><strong>Confirmed:</strong> ${bookings.filter(b => b.status === 'confirmed').length}</p>
        <p><strong>Pending:</strong> ${bookings.filter(b => b.status === 'pending').length}</p>
        <p><strong>Cancelled:</strong> ${bookings.filter(b => b.status === 'cancelled').length}</p>
        <p><strong>Total Revenue:</strong> £${bookings.filter(b => b.status === 'confirmed').reduce((total, booking) => total + (ticketPrices[booking.ticketType as keyof typeof ticketPrices] || 0), 0)}</p>
      </div>
      
      <div class="no-print" style="margin-top: 30px; text-align: center; color: #666;">
        <p>This is a printable booking report. Use your browser's print function to save as PDF.</p>
      </div>
    </body>
    </html>
  `

  return html
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'
  
  try {
    const bookings = await getRegistrations()
    
    if (format === 'csv') {
      const csv = generateCSV(bookings)
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="bookings-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
    
    if (format === 'pdf') {
      const html = generatePDF(bookings)
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="bookings-${new Date().toISOString().split('T')[0]}.html"`
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid format. Use ?format=csv or ?format=pdf' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export bookings' },
      { status: 500 }
    )
  }
}
