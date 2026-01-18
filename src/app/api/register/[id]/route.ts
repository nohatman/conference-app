import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const REGISTRATIONS_FILE = join(process.cwd(), 'data', 'registrations.json')

interface RegistrationData {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  jobTitle?: string
  ticketType: string
  dietaryRequirements?: string
  specialRequests?: string
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

// PATCH - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const registrations = await getRegistrations()
    const bookingIndex = registrations.findIndex(r => r.id === id)

    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    registrations[bookingIndex].status = status
    await saveRegistrations(registrations)

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: registrations[bookingIndex]
    })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE - Remove booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const registrations = await getRegistrations()
    const filteredRegistrations = registrations.filter(r => r.id !== id)

    if (registrations.length === filteredRegistrations.length) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    await saveRegistrations(filteredRegistrations)

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
