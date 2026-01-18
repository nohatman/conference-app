import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const VOTING_FILE = join(process.cwd(), 'data', 'voting.json')

interface VoteOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  title: string
  description: string
  options: VoteOption[]
  isActive: boolean
  createdAt: string
  endsAt?: string
  allowMultiple: boolean
}

interface Vote {
  pollId: string
  optionId: string
  voterId: string
  timestamp: string
}

// Load existing polls
async function getPolls(): Promise<Poll[]> {
  try {
    const data = await readFile(VOTING_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.polls || []
  } catch {
    return []
  }
}

// Load existing votes
async function getVotes(): Promise<Vote[]> {
  try {
    const data = await readFile(VOTING_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.votes || []
  } catch {
    return []
  }
}

// Save polls and votes
async function saveVotingData(polls: Poll[], votes: Vote[]): Promise<void> {
  try {
    const data = {
      polls,
      votes
    }
    await writeFile(VOTING_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Failed to save voting data:', error)
    throw new Error('Failed to save voting data')
  }
}

// GET - Retrieve all polls or specific poll
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pollId = searchParams.get('pollId')
    
    const polls = await getPolls()
    const votes = await getVotes()
    
    if (pollId) {
      const poll = polls.find(p => p.id === pollId)
      if (!poll) {
        return NextResponse.json(
          { error: 'Poll not found' },
          { status: 404 }
        )
      }
      
      // Add vote counts to poll options
      const pollVotes = votes.filter(v => v.pollId === pollId)
      poll.options.forEach(option => {
        option.votes = pollVotes.filter(v => v.optionId === option.id).length
      })
      
      return NextResponse.json(poll)
    }
    
    // Return all polls with vote counts
    polls.forEach(poll => {
      const pollVotes = votes.filter(v => v.pollId === poll.id)
      poll.options.forEach(option => {
        option.votes = pollVotes.filter(v => v.optionId === option.id).length
      })
    })
    
    return NextResponse.json(polls)
  } catch (error) {
    console.error('Failed to load polls:', error)
    return NextResponse.json(
      { error: 'Failed to load polls' },
      { status: 500 }
    )
  }
}

// POST - Create new poll or submit vote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'create_poll') {
      const { title, description, options, allowMultiple = false, endsAt } = body
      
      if (!title || !description || !options || options.length < 2) {
        return NextResponse.json(
          { error: 'Missing required fields or insufficient options' },
          { status: 400 }
        )
      }
      
      const newPoll: Poll = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        options: options.map((text: string, index: number) => ({
          id: `${Date.now()}_${index}`,
          text: text.trim(),
          votes: 0
        })),
        isActive: true,
        createdAt: new Date().toISOString(),
        endsAt: endsAt || null,
        allowMultiple
      }
      
      const polls = await getPolls()
      polls.push(newPoll)
      await saveVotingData(polls, await getVotes())
      
      return NextResponse.json({
        success: true,
        message: 'Poll created successfully',
        poll: newPoll
      })
    }
    
    if (action === 'vote') {
      const { pollId, optionId, voterId } = body
      
      if (!pollId || !optionId || !voterId) {
        return NextResponse.json(
          { error: 'Missing required fields: pollId, optionId, voterId' },
          { status: 400 }
        )
      }
      
      const polls = await getPolls()
      const poll = polls.find(p => p.id === pollId)
      
      if (!poll) {
        return NextResponse.json(
          { error: 'Poll not found' },
          { status: 404 }
        )
      }
      
      if (!poll.isActive) {
        return NextResponse.json(
          { error: 'Poll is no longer active' },
          { status: 400 }
        )
      }
      
      if (poll.endsAt && new Date(poll.endsAt) < new Date()) {
        return NextResponse.json(
          { error: 'Poll has ended' },
          { status: 400 }
        )
      }
      
      const votes = await getVotes()
      
      // Remove existing votes for this poll if multiple votes not allowed
      if (!poll.allowMultiple) {
        const existingVotes = votes.filter(v => v.pollId === pollId && v.voterId === voterId)
        const remainingVotes = votes.filter(v => !existingVotes.includes(v))
        remainingVotes.push({
          pollId,
          optionId,
          voterId,
          timestamp: new Date().toISOString()
        })
        await saveVotingData(polls, remainingVotes)
      } else {
        // Check if already voted for this option
        const existingVote = votes.find(v => v.pollId === pollId && v.optionId === optionId && v.voterId === voterId)
        if (existingVote) {
          return NextResponse.json(
            { error: 'You have already voted for this option' },
            { status: 400 }
          )
        }
        
        votes.push({
          pollId,
          optionId,
          voterId,
          timestamp: new Date().toISOString()
        })
        await saveVotingData(polls, votes)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Vote submitted successfully'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Voting error:', error)
    return NextResponse.json(
      { error: 'Failed to process voting request' },
      { status: 500 }
    )
  }
}

// PATCH - Update poll (activate/deactivate)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { pollId, isActive } = body
    
    if (!pollId || isActive === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: pollId, isActive' },
        { status: 400 }
      )
    }
    
    const polls = await getPolls()
    const pollIndex = polls.findIndex(p => p.id === pollId)
    
    if (pollIndex === -1) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }
    
    polls[pollIndex].isActive = isActive
    await saveVotingData(polls, await getVotes())
    
    return NextResponse.json({
      success: true,
      message: `Poll ${isActive ? 'activated' : 'deactivated'} successfully`,
      poll: polls[pollIndex]
    })
  } catch (error) {
    console.error('Update poll error:', error)
    return NextResponse.json(
      { error: 'Failed to update poll' },
      { status: 500 }
    )
  }
}
