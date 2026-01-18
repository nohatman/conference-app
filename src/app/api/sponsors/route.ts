import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const SPONSORS_FILE = join(process.cwd(), 'data', 'sponsors.json')

interface Sponsor {
  id: string
  name: string
  logo: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  description: string
  website: string
  boothNumber?: string
}

// Load sponsors
async function getSponsors(): Promise<Sponsor[]> {
  try {
    const data = await readFile(SPONSORS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    // Return default sponsors if file doesn't exist
    return [
      {
        id: '1',
        name: 'TechCorp Solutions',
        logo: '🏢',
        tier: 'platinum',
        description: 'Leading provider of enterprise software solutions and digital transformation services. Helping businesses scale with cutting-edge technology.',
        website: 'https://techcorp.example.com',
        boothNumber: 'A1'
      },
      {
        id: '2',
        name: 'Global Finance Partners',
        logo: '💰',
        tier: 'platinum',
        description: 'Specialized financial advisory and investment services for growing businesses. Your partner in sustainable financial growth.',
        website: 'https://globalfinance.example.com',
        boothNumber: 'A2'
      },
      {
        id: '3',
        name: 'Innovate Marketing',
        logo: '📈',
        tier: 'gold',
        description: 'Award-winning digital marketing agency specializing in ROI-driven campaigns and brand development.',
        website: 'https://innovatemarketing.example.com',
        boothNumber: 'B1'
      },
      {
        id: '4',
        name: 'CloudTech Systems',
        logo: '☁️',
        tier: 'gold',
        description: 'Cloud infrastructure and cybersecurity solutions for modern businesses. Secure, scalable, and reliable.',
        website: 'https://cloudtech.example.com',
        boothNumber: 'B2'
      },
      {
        id: '5',
        name: 'Business Growth Academy',
        logo: '🎓',
        tier: 'gold',
        description: 'Professional development and training programs for business leaders and teams. Accelerate your growth journey.',
        website: 'https://businessgrowth.example.com',
        boothNumber: 'B3'
      },
      {
        id: '6',
        name: 'Sustainable Solutions Ltd',
        logo: '🌱',
        tier: 'silver',
        description: 'Environmental consulting and sustainable business practices. Green solutions for modern enterprises.',
        website: 'https://sustainable.example.com',
        boothNumber: 'C1'
      },
      {
        id: '7',
        name: 'HR Innovations',
        logo: '👥',
        tier: 'silver',
        description: 'Modern HR solutions and employee engagement platforms. Building better workplaces for better results.',
        website: 'https://hrinnovations.example.com',
        boothNumber: 'C2'
      },
      {
        id: '8',
        name: 'Legal Eagle Services',
        logo: '⚖️',
        tier: 'silver',
        description: 'Business law and compliance specialists. Protecting your business while you focus on growth.',
        website: 'https://legaleagle.example.com',
        boothNumber: 'C3'
      },
      {
        id: '9',
        name: 'Data Analytics Pro',
        logo: '📊',
        tier: 'bronze',
        description: 'Business intelligence and data analytics solutions. Turn your data into actionable insights.',
        website: 'https://dataanalytics.example.com',
        boothNumber: 'D1'
      },
      {
        id: '10',
        name: 'MobileFirst Development',
        logo: '📱',
        tier: 'bronze',
        description: 'Custom mobile app development and digital solutions. Your vision, our expertise.',
        website: 'https://mobilefirst.example.com',
        boothNumber: 'D2'
      }
    ]
  }
}

// Save sponsors
async function saveSponsors(sponsors: Sponsor[]): Promise<void> {
  await writeFile(SPONSORS_FILE, JSON.stringify(sponsors, null, 2))
}

export async function GET() {
  try {
    const sponsors = await getSponsors()
    return NextResponse.json(sponsors)
  } catch (error) {
    console.error('Failed to load sponsors:', error)
    return NextResponse.json(
      { error: 'Failed to load sponsors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sponsors: Sponsor[] = await request.json()
    await saveSponsors(sponsors)

    return NextResponse.json({
      success: true,
      message: 'Sponsors saved successfully',
      sponsors
    })
  } catch (error) {
    console.error('Failed to save sponsors:', error)
    return NextResponse.json(
      { error: 'Failed to save sponsors' },
      { status: 500 }
    )
  }
}
