/**
 * Typed wrappers around cy.task() for database operations.
 * All operations use the Supabase service role key (via cypress.config.ts tasks)
 * to bypass RLS — only used in tests, never in the browser.
 */

import type { TestUser } from './commands'

export function dbCreateUser(opts: {
  email: string
  password: string
  username: string
}): Cypress.Chainable<TestUser> {
  return cy.task('createUser', opts)
}

export function dbDeleteUser(userId: string): Cypress.Chainable<null> {
  return cy.task('deleteUser', { userId })
}

export function dbCleanup(userIds: string[]): Cypress.Chainable<null> {
  return cy.task('cleanupTestData', { userIds })
}

export function dbCreateGroup(opts: {
  name: string
  createdBy: string
  inviteCode: string
}): Cypress.Chainable<{ id: string; name: string; invite_code: string }> {
  return cy.task('createGroup', opts)
}

export function dbCreateRoundInPhase(opts: {
  groupId: string
  createdBy: string
  phase: 'upcoming' | 'submitting' | 'voting' | 'complete'
  theme: string
}): Cypress.Chainable<{ id: string }> {
  return cy.task('createRoundInPhase', opts)
}

export function dbInsertSubmission(opts: {
  roundId: string
  userId: string
  trackData?: {
    spotify_track_id?: string
    track_name?: string
    artist_name?: string
    album_name?: string
  }
}): Cypress.Chainable<{ id: string }> {
  return cy.task('insertSubmission', opts)
}

export function dbInsertVote(opts: {
  roundId: string
  voterId: string
  submissionId: string
}): Cypress.Chainable<{ id: string }> {
  return cy.task('insertVote', opts)
}

export function dbGetSubmission(opts: {
  roundId: string
  userId: string
}): Cypress.Chainable<unknown[]> {
  return cy.task('getSubmission', opts)
}

export function dbGetVote(opts: {
  roundId: string
  voterId: string
}): Cypress.Chainable<unknown[]> {
  return cy.task('getVote', opts)
}

export function dbGetProfile(userId: string): Cypress.Chainable<unknown> {
  return cy.task('getProfile', { userId })
}

export function dbGetGroupMembers(groupId: string): Cypress.Chainable<unknown[]> {
  return cy.task('getGroupMembers', { groupId })
}
