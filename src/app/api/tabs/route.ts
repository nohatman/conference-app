import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const TABS_FILE = join(process.cwd(), 'data', 'tabs.json')

interface TabConfig {
  id: string
  label: string
  icon: string
  enabled: boolean
  order: number
}

interface TabData {
  tabs: TabConfig[]
}

// Load tabs configuration
async function getTabs(): Promise<TabConfig[]> {
  try {
    const data = await readFile(TABS_FILE, 'utf-8')
    const tabData: TabData = JSON.parse(data)
    return tabData.tabs || []
  } catch {
    // Return default tabs if file doesn't exist
    return [
      { id: "overview", label: "Overview", icon: "🏠", enabled: true, order: 1 },
      { id: "venue", label: "Venue", icon: "📍", enabled: true, order: 2 },
      { id: "sponsors", label: "Sponsors", icon: "🤝", enabled: true, order: 3 },
      { id: "agenda", label: "Agenda", icon: "📅", enabled: true, order: 4 },
      { id: "messages", label: "Messages", icon: "💬", enabled: true, order: 5 },
      { id: "voting", label: "Voting", icon: "🗳️", enabled: true, order: 6 },
      { id: "register", label: "Book Tickets", icon: "🎫", enabled: true, order: 7 }
    ]
  }
}

// Save tabs configuration
async function saveTabs(tabs: TabConfig[]): Promise<void> {
  const tabData: TabData = { tabs }
  await writeFile(TABS_FILE, JSON.stringify(tabData, null, 2))
}

export async function GET() {
  try {
    const tabs = await getTabs()
    return NextResponse.json({ tabs })
  } catch (error) {
    console.error('Failed to load tabs:', error)
    return NextResponse.json(
      { error: 'Failed to load tabs configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tabs } = body

    if (!Array.isArray(tabs)) {
      return NextResponse.json(
        { error: 'Invalid tabs data' },
        { status: 400 }
      )
    }

    // Validate tab structure
    for (const tab of tabs) {
      if (!tab.id || !tab.label || !tab.icon || typeof tab.enabled !== 'boolean' || typeof tab.order !== 'number') {
        return NextResponse.json(
          { error: 'Invalid tab structure' },
          { status: 400 }
        )
      }
    }

    await saveTabs(tabs)

    return NextResponse.json({
      success: true,
      message: 'Tabs configuration saved successfully',
      tabs
    })
  } catch (error) {
    console.error('Failed to save tabs:', error)
    return NextResponse.json(
      { error: 'Failed to save tabs configuration' },
      { status: 500 }
    )
  }
}
