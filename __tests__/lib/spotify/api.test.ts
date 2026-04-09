import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'

// Re-import module fresh each test to reset module-level cachedToken
async function importApi() {
  vi.resetModules()
  return import('@/lib/spotify/api')
}

describe('searchTracks', () => {
  it('returns mapped tracks from Spotify', async () => {
    const { searchTracks } = await importApi()
    const tracks = await searchTracks('radiohead', 2)
    expect(Array.isArray(tracks)).toBe(true)
    expect(tracks[0].id).toBe('track_001')
    expect(tracks[0].name).toBe('Fake Song One')
    expect(tracks[0].artists[0].name).toBe('Fake Artist')
  })

  it('caches the access token between calls', async () => {
    let tokenCalls = 0
    server.use(
      http.post('https://accounts.spotify.com/api/token', () => {
        tokenCalls++
        return HttpResponse.json({ access_token: 'cached_token', expires_in: 3600 })
      })
    )

    const { searchTracks } = await importApi()
    await searchTracks('test1', 1)
    await searchTracks('test2', 1)

    expect(tokenCalls).toBe(1)
  })

  it('refreshes expired token on next call', async () => {
    let tokenCalls = 0
    server.use(
      http.post('https://accounts.spotify.com/api/token', () => {
        tokenCalls++
        // Return a token that expires immediately (0 seconds - 300 = negative → always expired)
        return HttpResponse.json({ access_token: `token_${tokenCalls}`, expires_in: 0 })
      })
    )

    const { searchTracks } = await importApi()
    await searchTracks('test1', 1)
    await searchTracks('test2', 1)

    expect(tokenCalls).toBe(2)
  })

  it('throws when Spotify token endpoint returns an error', async () => {
    server.use(
      http.post('https://accounts.spotify.com/api/token', () =>
        HttpResponse.json({ error: 'invalid_client' }, { status: 401 })
      )
    )

    const { searchTracks } = await importApi()
    await expect(searchTracks('test', 1)).rejects.toThrow('Failed to get Spotify token')
  })

  it('throws when Spotify search endpoint returns an error', async () => {
    server.use(
      http.get('https://api.spotify.com/v1/search', () =>
        HttpResponse.json({ error: 'server error' }, { status: 500 })
      )
    )

    const { searchTracks } = await importApi()
    await expect(searchTracks('test', 1)).rejects.toThrow('Spotify search failed')
  })
})

describe('getTrack', () => {
  it('returns track data for a given id', async () => {
    const { getTrack } = await importApi()
    const track = await getTrack('track_001')
    expect(track.id).toBe('track_001')
    expect(track.name).toBeDefined()
  })

  it('throws when track endpoint returns an error', async () => {
    server.use(
      http.get('https://api.spotify.com/v1/tracks/:id', () =>
        HttpResponse.json({ error: 'not found' }, { status: 404 })
      )
    )

    const { getTrack } = await importApi()
    await expect(getTrack('bad_id')).rejects.toThrow('Failed to get Spotify track')
  })
})
