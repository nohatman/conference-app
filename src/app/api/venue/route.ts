import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const VENUE_FILE = join(process.cwd(), 'data', 'venue.json')

interface VenueInfo {
  name: string
  address: string
  description: string
  facilities: string[]
  accessibility: string[]
  transport: {
    car: string
    train: string
    plane: string
    bus: string
  }
  parking: {
    onsite: boolean
    cost: string
    alternatives: string[]
  }
  accommodation: {
    onsite: boolean
    nearby: string[]
  }
  images: string[]
}

// Load venue information
async function getVenueInfo(): Promise<VenueInfo> {
  try {
    const data = await readFile(VENUE_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    // Return default venue info if file doesn't exist
    return {
      name: "Crowne Plaza Stratford upon Avon",
      address: "Bridgefoot, Stratford-upon-Avon CV37 6YR, United Kingdom",
      description: "A stunning riverside location in the heart of Shakespeare's country, offering modern conference facilities with historic charm.",
      facilities: [
        "Free high-speed Wi-Fi throughout",
        "State-of-the-art audiovisual equipment",
        "Multiple conference rooms and breakout spaces",
        "On-site restaurant and bar",
        "24-hour front desk",
        "Business center",
        "Fitness center and spa",
        "Indoor swimming pool",
        "Complimentary tea and coffee stations",
        "Climate control in all meeting rooms"
      ],
      accessibility: [
        "Wheelchair accessible throughout",
        "Accessible parking spaces available",
        "Accessible restrooms on all floors",
        "Hearing loop systems in main conference rooms",
        "Elevator access to all floors",
        "Assistance available upon request",
        "Braille signage in key areas",
        "Accessible accommodation rooms available"
      ],
      transport: {
        car: "Located just off the M40 motorway, approximately 2 hours from London and 1 hour from Birmingham. Postcode CV37 6YR for satellite navigation.",
        train: "Stratford-upon-Avon railway station is 0.5 miles away (10-minute walk). Direct services from Birmingham, London Marylebone, and Oxford.",
        plane: "Birmingham Airport (BHX) is 25 miles away (40-minute drive). Heathrow Airport is 90 miles away (2-hour drive).",
        bus: "Regular bus services from Warwick, Leamington Spa, and surrounding areas. Bus stop located 200 yards from the hotel."
      },
      parking: {
        onsite: true,
        cost: "Free for conference delegates",
        alternatives: [
          "Stratford-upon-Avon Park & Ride (0.3 miles)",
          "Bridge Street Car Park (0.2 miles)",
          "Windsor Street Car Park (0.4 miles)"
        ]
      },
      accommodation: {
        onsite: true,
        nearby: [
          "Macdonald Alveston Manor Hotel (2 miles)",
          "The Stratford Hotel (0.3 miles)",
          "The Falcon Hotel (0.5 miles)",
          "Ettington Park Hotel (5 miles)"
        ]
      },
      images: []
    }
  }
}

// Save venue information
async function saveVenueInfo(venueInfo: VenueInfo): Promise<void> {
  await writeFile(VENUE_FILE, JSON.stringify(venueInfo, null, 2))
}

export async function GET() {
  try {
    const venueInfo = await getVenueInfo()
    return NextResponse.json(venueInfo)
  } catch (error) {
    console.error('Failed to load venue info:', error)
    return NextResponse.json(
      { error: 'Failed to load venue information' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const venueInfo: VenueInfo = await request.json()
    await saveVenueInfo(venueInfo)

    return NextResponse.json({
      success: true,
      message: 'Venue information saved successfully',
      venueInfo
    })
  } catch (error) {
    console.error('Failed to save venue info:', error)
    return NextResponse.json(
      { error: 'Failed to save venue information' },
      { status: 500 }
    )
  }
}
