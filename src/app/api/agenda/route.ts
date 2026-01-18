import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const AGENDA_FILE = join(process.cwd(), 'data', 'agenda.json')

interface AgendaItem {
  id: string
  time: string
  title: string
  speaker: string
  location: string
  description: string
  type: 'keynote' | 'session' | 'break' | 'workshop' | 'networking'
}

// Load agenda items
async function getAgendaItems(): Promise<AgendaItem[]> {
  try {
    const data = await readFile(AGENDA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    // Return default agenda if file doesn't exist
    return [
      {
        id: '1',
        time: '08:30 - 09:00',
        title: 'Registration & Welcome Coffee',
        speaker: '',
        location: 'Main Lobby',
        description: 'Collect your badge and enjoy refreshments before the main event begins.',
        type: 'networking'
      },
      {
        id: '2',
        time: '09:00 - 09:30',
        title: 'Opening Keynote: The Future of Business Growth',
        speaker: 'Sarah Johnson, CEO',
        location: 'Main Hall',
        description: 'Insights into emerging trends and strategies for sustainable business growth in 2025 and beyond.',
        type: 'keynote'
      },
      {
        id: '3',
        time: '09:30 - 10:30',
        title: 'Digital Transformation Workshop',
        speaker: 'Michael Chen, CTO',
        location: 'Workshop Room A',
        description: 'Hands-on session exploring practical digital transformation strategies for SMEs.',
        type: 'workshop'
      },
      {
        id: '4',
        time: '10:30 - 11:00',
        title: 'Coffee Break & Networking',
        speaker: '',
        location: 'Exhibition Area',
        description: 'Connect with fellow delegates and explore sponsor exhibitions.',
        type: 'break'
      },
      {
        id: '5',
        time: '11:00 - 12:00',
        title: 'Marketing in AI Era',
        speaker: 'Emma Williams, Marketing Director',
        location: 'Main Hall',
        description: 'How artificial intelligence is revolutionizing marketing strategies and customer engagement.',
        type: 'session'
      },
      {
        id: '6',
        time: '12:00 - 13:30',
        title: 'Networking Lunch',
        speaker: '',
        location: 'Dining Hall',
        description: 'Three-course lunch with dedicated networking time.',
        type: 'networking'
      },
      {
        id: '7',
        time: '13:30 - 14:30',
        title: 'Sustainable Business Practices',
        speaker: 'David Green, Sustainability Expert',
        location: 'Main Hall',
        description: 'Implementing environmentally sustainable practices without compromising profitability.',
        type: 'session'
      },
      {
        id: '8',
        time: '14:30 - 15:30',
        title: 'Leadership in Remote Teams',
        speaker: 'Lisa Anderson, HR Director',
        location: 'Workshop Room B',
        description: 'Best practices for managing and motivating distributed teams effectively.',
        type: 'workshop'
      },
      {
        id: '9',
        time: '15:30 - 16:00',
        title: 'Afternoon Tea & Exhibition',
        speaker: '',
        location: 'Exhibition Area',
        description: 'Final opportunity to connect with sponsors and speakers.',
        type: 'break'
      },
      {
        id: '10',
        time: '16:00 - 17:00',
        title: 'Closing Keynote: Your Growth Journey Starts Now',
        speaker: 'Robert Taylor, Business Coach',
        location: 'Main Hall',
        description: 'Actionable insights and next steps to implement what you\'ve learned today.',
        type: 'keynote'
      },
      {
        id: '11',
        time: '17:00 onwards',
        title: 'Conference Dinner & Networking',
        speaker: '',
        location: 'Grand Ballroom',
        description: 'Join us for an evening of dining, entertainment, and networking with fellow delegates and speakers.',
        type: 'networking'
      }
    ]
  }
}

// Save agenda items
async function saveAgendaItems(agendaItems: AgendaItem[]): Promise<void> {
  await writeFile(AGENDA_FILE, JSON.stringify(agendaItems, null, 2))
}

export async function GET() {
  try {
    const agendaItems = await getAgendaItems()
    return NextResponse.json(agendaItems)
  } catch (error) {
    console.error('Failed to load agenda:', error)
    return NextResponse.json(
      { error: 'Failed to load agenda' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const agendaItems: AgendaItem[] = await request.json()
    await saveAgendaItems(agendaItems)

    return NextResponse.json({
      success: true,
      message: 'Agenda saved successfully',
      agendaItems
    })
  } catch (error) {
    console.error('Failed to save agenda:', error)
    return NextResponse.json(
      { error: 'Failed to save agenda' },
      { status: 500 }
    )
  }
}
