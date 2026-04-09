/**
 * Group (Studio) management E2E tests
 */

import { dbCleanup, dbGetGroupMembers } from '../support/db'
import type { TestUser } from '../support/commands'

const TS = Date.now()
const createdUserIds: string[] = []

describe('Groups', () => {
  let creator: TestUser
  let joiner: TestUser

  before(() => {
    cy.task('createUser', {
      email: `cy_${TS}_creator@test.invalid`,
      password: 'TestPassword123!',
      username: `cy_${TS}_creator`,
    }).then((u: TestUser) => {
      creator = u
      createdUserIds.push(u.id)
    })

    cy.task('createUser', {
      email: `cy_${TS}_joiner@test.invalid`,
      password: 'TestPassword123!',
      username: `cy_${TS}_joiner`,
    }).then((u: TestUser) => {
      joiner = u
      createdUserIds.push(u.id)
    })
  })

  after(() => {
    dbCleanup(createdUserIds)
  })

  describe('Create studio', () => {
    beforeEach(() => {
      cy.loginProgrammatic(creator.email, creator.password)
    })

    it('creates a studio and redirects to the group page', () => {
      cy.visit('/groups/new')
      cy.get('#name').type(`Test Studio ${TS}`)
      cy.get('#description').type('A studio created by Cypress')
      cy.get('button[type=submit]').click()

      cy.url().should('match', /\/groups\/[a-f0-9-]+$/)
      cy.contains(`Test Studio ${TS}`).should('be.visible')
    })

    it('auto-adds creator as a group member in the database', () => {
      cy.visit('/groups/new')
      cy.get('#name').type(`Membership Test ${TS}`)
      cy.get('button[type=submit]').click()

      cy.url().should('match', /\/groups\/([a-f0-9-]+)$/).then((url) => {
        const groupId = (url as string).split('/groups/')[1]
        dbGetGroupMembers(groupId).should('have.length.gte', 1)
      })
    })

    it('shows "New Session" button only to the creator', () => {
      cy.visit('/groups/new')
      cy.get('#name').type(`Creator Button Test ${TS}`)
      cy.get('button[type=submit]').click()
      cy.url().should('match', /\/groups\/[a-f0-9-]+$/)

      cy.contains('+ New Session').should('be.visible')
    })
  })

  describe('Join via invite', () => {
    let groupId: string
    let inviteCode: string

    before(() => {
      // Create a group via DB task (faster than UI)
      inviteCode = `testinv${TS}`.slice(0, 10)
      cy.task('createGroup', {
        name: `Invite Test Group ${TS}`,
        createdBy: creator.id,
        inviteCode,
      }).then((g: { id: string }) => {
        groupId = g.id
      })
    })

    it('non-member can join via invite link', () => {
      cy.loginProgrammatic(joiner.email, joiner.password)
      cy.visit(`/invite/${inviteCode}`)

      cy.contains('Join Studio').should('be.visible')
      cy.contains('Join Studio').click()

      cy.url().should('include', `/groups/${groupId}`)

      // Verify DB row was created
      dbGetGroupMembers(groupId).should((members) => {
        const ids = (members as Array<{ user_id: string }>).map((m) => m.user_id)
        expect(ids).to.include(joiner.id)
      })
    })

    it('already-a-member visiting invite URL is redirected straight to the group', () => {
      // joiner is now a member from the previous test
      cy.loginProgrammatic(joiner.email, joiner.password)
      cy.visit(`/invite/${inviteCode}`)

      // Should redirect without showing the join button
      cy.url().should('include', `/groups/${groupId}`)
      cy.contains('Join Studio').should('not.exist')
    })

    it('shows error for an invalid invite code', () => {
      cy.loginProgrammatic(creator.email, creator.password)
      cy.visit('/invite/not-a-real-code')
      cy.contains('Invite not found').should('be.visible')
    })

    it('non-creator does not see the "New Session" button', () => {
      cy.loginProgrammatic(joiner.email, joiner.password)
      cy.visit(`/groups/${groupId}`)
      cy.contains('+ New Session').should('not.exist')
    })
  })
})
