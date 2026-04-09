import { setupServer } from 'msw/node'
import { spotifyHandlers } from './spotify-handlers'

export const server = setupServer(...spotifyHandlers)
