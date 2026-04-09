/**
 * Voting E2E tests
 */

import { dbCleanup, dbGetVote } from '../support/db'
import type { TestUser } from '../support/commands'

const TS = Date.now()
const createdUserIds: string[] = []

describe('Voting', () => {
  let userA: TestUser  // submitted a song
  let userB: TestUser  // will vote
  let groupId: string
  let roundId: string
  let submissionAId: string
  let submissionBId: string

  before(() => {
    cy.task('createUser', {
      email: `cy_${TS}_voterA@test.invalid`,
      password: 'TestPassword123!',
      username: `cy_${TS}_votera`,
    }).then((u: TestUser) => {
      userA = u
      createdUserIds.push(u.id)
    })

    cy.task('createUser', {
      email: `cy_${TS}_voterB@test.invalid`,
      password: 'TestPassword123!',
      username: `cy_${TS}_voterb`,
    }).then((u: TestUser) => {
      userB = u
      createdUserIds.push(u.id)
    })

    cy.then(() => {
      const inviteCode = `vot${TS}`.slice(0, 10)
      cy.task('createGroup', {
        name: `Voting Group ${TS}`,
        createdBy: userA.id,
        inviteCode,
      }).then((g: { id: string }) => {
        groupId = g.id

        cy.task('addGroupMember', { groupId: g.id, userId: userB.id })

        cy.task('createRoundInPhase', {
          groupId: g.id,
          createdBy: userA.id,
          phase: 'voting',
          theme: `Voting Theme ${TS}`,
        }).then((r: { id: string }) => {
          roundId = r.id

          cy.task('insertSubmission', {
            roundId: r.id,
            userId: userA.id,
            trackData: { track_name: 'Song by A', artist_name: 'Artist A' },
          }).then((s: { id: string }) => {
            submissionAId = s.id
          })

          cy.task('insertSubmission', {
            roundId: r.id,
            userId: userB.id,
            trackData: { track_name: 'Song by B', artist_name: 'Artist B' },
          }).then((s: { id: string }) => {
            submissionBId = s.id
          })
        })
      })
    })
  })

  after(() => {
    dbCleanup(createdUserIds)
  })

  describe('Voting as userB (who submitted song B)', () => {
    beforeEach(() => {
      cy.loginProgrammatic(userB.email, userB.password)
    })

    it('shows the voting UI with all submissions', () => {
      cy.visit(`/groups/${groupId}/rounds/${roundId}`)
      cy.contains('Vote for your favorite').should('be.visible')
      cy.contains('Song by A').should('be.visible')
      cy.contains('Song by B').should('be.visible')
    })

    it("marks userB's own submission as disabled with 'Your submission' label", () => {
      cy.visit(`/groups/${groupId}/rounds/${roundId}`)

      // The wrapper div for userB's own submission has opacity-50
      cy.contains('Song by B')
        .closest('[class*="opacity-50"]')
        .should('exist')

      cy.contains('Your submission').should('be.visible')
    })

    it("submitting a vote for another user's song creates a DB record", () => {
      cy.visit(`/groups/${groupId}/rounds/${roundId}`)

      // Click Song by A (not own submission)
      cy.contains('Song by A').click()
      cy.contains('Submit vote').click()

      cy.contains('Vote submitted').should('be.visible')

      dbGetVote({ roundId, voterId: userB.id }).should('have.length', 1)
    })

    it('changing a vote updates the existing DB row', () => {
      // userB already voted in previous test — vote is cached in session
      cy.visit(`/groups/${groupId}/rounds/${roundId}`)

      // Current vote is for Song by A — the button should say "Update vote"
      cy.contains('Update vote').should('be.visible')

      // userB re-selects Song by A (same track to keep it simple)
      cy.contains('Song by A').click()
      cy.contains('Update vote').click()

      cy.contains('Vote submitted').should('be.visible')

      // Still only one row in DB
      dbGetVote({ roundId, voterId: userB.id }).should('have.length', 1)
    })
  })

  describe('Self-vote prevention', () => {
    it('rejects self-vote at the database level', () => {
      cy.task('trySelfVote', {
        roundId,
        voterId: userA.id,
        submissionId: submissionAId,
      }).should('include', 'vote for your own submission')
    })
  })
})
