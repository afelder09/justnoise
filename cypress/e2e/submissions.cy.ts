/**
 * Song submission E2E tests
 */

import { dbCleanup, dbGetSubmission } from '../support/db'
import type { TestUser } from '../support/commands'

const TS = Date.now()
const createdUserIds: string[] = []

describe('Submissions', () => {
  let submitter: TestUser
  let groupId: string
  let roundId: string

  before(() => {
    cy.task('createUser', {
      email: `cy_${TS}_sub@test.invalid`,
      password: 'TestPassword123!',
      username: `cy_${TS}_sub`,
    }).then((u: TestUser) => {
      submitter = u
      createdUserIds.push(u.id)

      cy.task('createGroup', {
        name: `Submissions Group ${TS}`,
        createdBy: u.id,
        inviteCode: `sub${TS}`.slice(0, 10),
      }).then((g: { id: string }) => {
        groupId = g.id

        cy.task('createRoundInPhase', {
          groupId: g.id,
          createdBy: u.id,
          phase: 'submitting',
          theme: `Sub Theme ${TS}`,
        }).then((r: { id: string }) => {
          roundId = r.id
        })
      })
    })
  })

  after(() => {
    dbCleanup(createdUserIds)
  })

  beforeEach(() => {
    cy.loginProgrammatic(submitter.email, submitter.password)
    cy.interceptSpotify()
  })

  it('submits a song via Spotify search and stores a DB record', () => {
    cy.visit(`/groups/${groupId}/rounds/${roundId}`)
    cy.contains('Submit your song').should('be.visible')

    // Search for a track (debounced 400ms — use cy.clock to control)
    cy.clock()
    cy.get('input[placeholder="Search for a song..."]').type('cypress test')
    cy.tick(500)
    cy.wait('@spotifySearch')

    // Click the first search result
    cy.contains('Cypress Test Song').click()

    // Click submit
    cy.contains('Submit song').click()

    // Success banner
    cy.contains('Your submission is in').should('be.visible')

    // Verify DB record
    dbGetSubmission({ roundId, userId: submitter.id }).should('have.length', 1)
  })

  it('updates an existing submission (upsert keeps one row)', () => {
    // Pre-seed a submission
    cy.task('insertSubmission', {
      roundId,
      userId: submitter.id,
      trackData: { track_name: 'Old Track', artist_name: 'Old Artist' },
    })

    cy.visit(`/groups/${groupId}/rounds/${roundId}`)

    // Should show the existing submission confirmation
    cy.contains('Your submission is in').should('be.visible')
    cy.contains('Change submission').click()

    // Pick a different track
    cy.clock()
    cy.get('input[placeholder="Search for a song..."]').type('another song')
    cy.tick(500)
    cy.wait('@spotifySearch')

    cy.contains('Cypress Test Song').click()
    cy.contains('Update submission').click()

    cy.contains('Your submission is in').should('be.visible')

    // Still only one row in DB (upsert)
    dbGetSubmission({ roundId, userId: submitter.id }).should('have.length', 1)
  })
})
