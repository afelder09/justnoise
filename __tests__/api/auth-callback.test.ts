import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers before importing the route
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: () => [],
    set: vi.fn(),
  }),
}))

const mockExchangeCodeForSession = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  }),
}))

const { GET } = await import('@/app/api/auth/callback/route')

describe('GET /api/auth/callback', () => {
  beforeEach(() => {
    mockExchangeCodeForSession.mockReset()
  })

  it('redirects to /login when no code is provided', async () => {
    const req = new Request('http://localhost:3000/api/auth/callback')
    const res = await GET(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?error=auth_callback_failed')
  })

  it('redirects to /dashboard on successful code exchange', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    const req = new Request('http://localhost:3000/api/auth/callback?code=valid_code')
    const res = await GET(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard')
  })

  it('redirects to the custom next param on successful code exchange', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    const req = new Request(
      'http://localhost:3000/api/auth/callback?code=valid_code&next=/groups/abc-123'
    )
    const res = await GET(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/groups/abc-123')
  })

  it('redirects to /login when code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: { message: 'Invalid code' } })
    const req = new Request('http://localhost:3000/api/auth/callback?code=bad_code')
    const res = await GET(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?error=auth_callback_failed')
  })
})
