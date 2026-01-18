import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const MESSAGES_FILE = join(process.cwd(), 'data', 'messages.json')

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  type: 'announcement' | 'question' | 'discussion'
  status: 'active' | 'archived'
  replies?: Message[]
}

// Load existing messages
async function getMessages(): Promise<Message[]> {
  try {
    const data = await readFile(MESSAGES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Save messages
async function saveMessages(messages: Message[]): Promise<void> {
  try {
    await writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2))
  } catch (error) {
    console.error('Failed to save messages:', error)
    throw new Error('Failed to save message')
  }
}

// GET - Retrieve all messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    const messages = await getMessages()
    
    let filteredMessages = messages
    if (type && ['announcement', 'question', 'discussion'].includes(type)) {
      filteredMessages = messages.filter(msg => msg.type === type)
    }
    
    // Sort by timestamp (newest first)
    filteredMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return NextResponse.json(filteredMessages)
  } catch (error) {
    console.error('Failed to load messages:', error)
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    )
  }
}

// POST - Create new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, senderName, content, type = 'discussion' } = body
    
    // Validate required fields
    if (!senderId || !senderName || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: senderId, senderName, content' },
        { status: 400 }
      )
    }
    
    if (!['announcement', 'question', 'discussion'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid message type' },
        { status: 400 }
      )
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      senderName,
      content: content.trim(),
      type,
      timestamp: new Date().toISOString(),
      status: 'active',
      replies: []
    }
    
    const messages = await getMessages()
    messages.push(newMessage)
    await saveMessages(messages)
    
    return NextResponse.json({
      success: true,
      message: 'Message posted successfully',
      data: newMessage
    })
  } catch (error) {
    console.error('Failed to post message:', error)
    return NextResponse.json(
      { error: 'Failed to post message' },
      { status: 500 }
    )
  }
}
