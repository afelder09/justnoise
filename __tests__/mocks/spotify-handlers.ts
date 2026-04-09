import { http, HttpResponse } from 'msw'

const mockTracks = [
  {
    id: 'track_001',
    name: 'Fake Song One',
    artists: [{ name: 'Fake Artist' }],
    album: {
      name: 'Fake Album',
      images: [{ url: 'https://i.scdn.co/image/fake1.jpg', width: 300, height: 300 }],
    },
    preview_url: 'https://p.scdn.co/mp3-preview/fake1',
    external_urls: { spotify: 'https://open.spotify.com/track/track_001' },
    duration_ms: 210000,
  },
  {
    id: 'track_002',
    name: 'Fake Song Two',
    artists: [{ name: 'Fake Artist' }, { name: 'Collab Artist' }],
    album: {
      name: 'Fake Album Two',
      images: [{ url: 'https://i.scdn.co/image/fake2.jpg', width: 300, height: 300 }],
    },
    preview_url: null,
    external_urls: { spotify: 'https://open.spotify.com/track/track_002' },
    duration_ms: 180000,
  },
]

export const spotifyHandlers = [
  http.post('https://accounts.spotify.com/api/token', () =>
    HttpResponse.json({ access_token: 'mock_access_token', expires_in: 3600, token_type: 'Bearer' })
  ),

  http.get('https://api.spotify.com/v1/search', () =>
    HttpResponse.json({ tracks: { items: mockTracks } })
  ),

  http.get('https://api.spotify.com/v1/tracks/:id', ({ params }) =>
    HttpResponse.json({ ...mockTracks[0], id: params.id })
  ),
]

export { mockTracks }
