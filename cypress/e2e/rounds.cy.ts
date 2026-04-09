/**
 * Round (Session) lifecycle E2E tests
 */

import { dbCleanup } from '../support/db'
import type { TestUser } from '../support/commands'

const TS = Date.now()
const createdUserIds: string[] = []

describe('Rounds', () => {
  let creator: TestUser
  let member: TestUser
  let groupId: string

  before(() => {
    cy.task('createUser', {
      email: `cy_${TS}_rcreator@test.invalid`,
      password: 'TestPassword123!',
      username: `cy_${TS}_rcreator`,
    }).then((u: TestUser) => {
      creator = u
      createdUserIds.push(u.id)
    })

    cy.task('createUser', {
      email: `cy_${TS}_rmember@test.invalid`,
      password: 'TestPassword123!',
      username: `cy_${TS}_rmember`,
    }).then((u: TestUser) => {
      member = u
      createdUserIds.push(u.id)
    })

    // Create group and add both users
    const inviteCode = `rnd${TS}`.slice(0, 10)
    cy.then(() =>
      cy.task('createGroup', {
        name: `Rounds Test Group ${TS}`,
        createdBy: creator.id,
        inviteCode,
      })
    ).then((g: { id: string }) => {
      groupId = g.id
      cy.task('addGroupMember', { groupId: g.id, userId: member.id })
    })
  })

  after(() => {
    dbCleanup(createdUserIds)
  })

  describe('Create round via UI', () => {
    beforeEach(() => {
      cy.loginProgrammatic(creator.email, creator.password)
    })

    it('creates a session and redirects to the round page', () => {
      cy.visit(`/groups/${groupId}/rounds/new`)

      cy.get('#theme').type(`Cypress Theme ${TS}`)
      // Dates already have valid defaults from the form — just submit
      cy.get('button[type=submit]').click()

      cy.url().should('match', /\/groups\/[a-f0-9-]+\/rounds\/[a-f0-9-]+$/)
      cy.contains(`Cypress Theme ${TS}`).should('be.visible')
    })
  })

  describe('Access control', () => {
    it('non-creator visiting /rounds/new is redirected to the group page', () => {
      // Add member to group first
      cy.task('createGroup', {
        name: `Access Test Group ${TS}`,
        createdBy: creator.id,
        inviteCode: `acc${TS}`.slice(0, 10),
      }).then((g: { id: string }) => {
        const gid = g.id
        // Member is NOT in this group — they should 404 or be redirected
        cy.loginProgrammatic(member.email, member.password)
        cy.visit(`/groups/${gid}/rounds/new`, { failOnStatusCode: false })
        cy.url().should('not.include', '/rounds/new')
      })
    })
  })

  describe('Round phase display', () => {
    beforeEach(() => {
      cy.loginProgrammatic(creator.email, creator.password)
    })

    it('shows "Session not started yet" for an upcoming round', () => {
      cy.task('createRoundInPhase', {
        groupId,
        createdBy: creator.id,
        phase: 'upcoming',
        theme: `Upcoming ${TS}`,
      }).then((round: { id: string }) => {
        cy.visit(`/groups/${groupId}/rounds/${round.id}`)
        cy.contains('Session not started yet').should('be.visible')
      })
    })

    it('shows the submission form during the submitting phase', () => {
      cy.task('createRoundInPhase', {
        groupId,
        createdBy: creator.id,
        phase: 'submitting',
        theme: `Submitting ${TS}`,
      }).then((round: { id: string }) => {
        cy.visit(`/groups/${groupId}/rounds/${round.id}`)
        cy.contains('Submit your song').should('be.visible')
      })
    })

    it('shows the voting UI during the voting phase', () => {
      cy.task('createRoundInPhase', {
        groupId,
        createdBy: creator.id,
        phase: 'voting',
        theme: `Voting ${TS}`,
      }).then((round: { id: string }) => {
        cy.visit(`/groups/${groupId}/rounds/${round.id}`)
        cy.contains('Vote for your favorite').should('be.visible')
      })
    })

    it('shows results in the complete phase', () => {
      cy.task('createRoundInPhase', {
        groupId,
        createdBy: creator.id,
        phase: 'complete',
        theme: `Complete ${TS}`,
      }).then((round: { id: string }) => {
        cy.visit(`/groups/${groupId}/rounds/${round.id}`)
        // ResultsSection renders when status is complete
        cy.contains('Session ended').should('be.visible')
      })
    })
  })
})
