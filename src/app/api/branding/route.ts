import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const BRANDING_FILE = join(process.cwd(), 'data', 'branding.json')

export async function GET() {
  try {
    // Load existing branding data
    try {
      const data = await readFile(BRANDING_FILE, 'utf-8')
      const parsedData = JSON.parse(data)
      
      // Ensure data has new fields, merge with defaults if missing
      const mergedData = {
        eventTitle: parsedData.eventTitle || "fwdLive! GOING FOR GROWTH 2025",
        eventDate: parsedData.eventDate || "12 June 2025",
        eventLocation: parsedData.eventLocation || "Crowne Plaza, Stratford upon Avon",
        primaryColor: parsedData.primaryColor || "blue",
        secondaryColor: parsedData.secondaryColor || "gray",
        headerTextColor: parsedData.headerTextColor || "white",
        contentTextColor: parsedData.contentTextColor || "black",
        backgroundColor: parsedData.backgroundColor || "gray",
        headerBackgroundColor: parsedData.headerBackgroundColor || "blue",
        logoUrl: parsedData.logoUrl || "",
        headerBackgroundImageUrl: parsedData.headerBackgroundImageUrl || "",
        pageBackgroundImageUrl: parsedData.pageBackgroundImageUrl || "",
        useHeaderBackgroundImage: parsedData.useHeaderBackgroundImage !== undefined ? parsedData.useHeaderBackgroundImage : false,
        usePageBackgroundImage: parsedData.usePageBackgroundImage !== undefined ? parsedData.usePageBackgroundImage : false,
        sponsorLogos: parsedData.sponsorLogos || []
      }
      
      return NextResponse.json(mergedData)
    } catch (error) {
      // Return default branding if file doesn't exist
      const defaultBranding = {
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
      }
      return NextResponse.json(defaultBranding)
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load branding' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const brandingData = await request.json()

    // Validate required fields
    const required = ['eventTitle', 'eventDate', 'eventLocation']
    for (const field of required) {
      if (!brandingData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data')
    await writeFile(join(dataDir, 'branding.json'), JSON.stringify(brandingData, null, 2))

    return NextResponse.json({ success: true, message: 'Branding saved successfully' })
  } catch (error) {
    console.error('Save branding error:', error)
    return NextResponse.json({ error: 'Failed to save branding' }, { status: 500 })
  }
}
