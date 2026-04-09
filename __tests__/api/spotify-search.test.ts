import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'

// Mock next/headers before importing the route
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: () => [],
    set: vi.fn(),
  }),
}))

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

const { GET } = await import('@/app/api/spotify/search/route')

const authenticatedUser = { id: 'user-1', email: 'test@example.com' }

describe('GET /api/spotify/search', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
  })

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const req = new Request('http://localhost:3000/api/spotify/search?q=radiohead')
    const res = await GET(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns empty tracks when q param is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: authenticatedUser } })
    const req = new Request('http://localhost:3000/api/spotify/search')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.tracks).toEqual([])
  })

  it('returns empty tracks when q param is too short (1 char)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: authenticatedUser } })
    const req = new Request('http://localhost:3000/api/spotify/search?q=a')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.tracks).toEqual([])
  })

  it('returns tracks for a valid query', async () => {
    mockGetUser.mockResolvedValue({ data: { user: authenticatedUser } })
    const req = new Request('http://localhost:3000/api/spotify/search?q=radiohead')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.tracks)).toBe(true)
    expect(body.tracks.length).toBeGreaterThan(0)
    expect(body.tracks[0].id).toBe('track_001')
  })

  it('returns 500 when Spotify search throws', async () => {
    mockGetUser.mockResolvedValue({ data: { user: authenticatedUser } })
    server.use(
      http.get('https://api.spotify.com/v1/search', () =>
        HttpResponse.json({ error: 'server error' }, { status: 500 })
      )
    )
    const req = new Request('http://localhost:3000/api/spotify/search?q=radiohead')
    const res = await GET(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Search failed')
  })
})
