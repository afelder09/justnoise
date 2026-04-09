/// <reference types="cypress" />

export interface TestUser {
  id: string
  email: string
  password: string
  username: string
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login using cy.session() for caching. Navigates to /login and submits the form.
       * Session is cached and restored between tests — avoids repeated full logins.
       */
      loginProgrammatic(email: string, password: string): Chainable<void>
      /**
       * Set up cy.intercept() for /api/spotify/search returning fixture data.
       * Aliased as @spotifySearch.
       */
      interceptSpotify(): Chainable<void>
    }
  }
}

Cypress.Commands.add('loginProgrammatic', (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/login')
      cy.get('#email').type(email)
      cy.get('#password').type(password)
      cy.get('button[type=submit]').click()
      cy.url().should('include', '/dashboard')
    },
    {
      validate() {
        cy.visit('/dashboard')
        cy.url().should('include', '/dashboard')
      },
    }
  )
})

Cypress.Commands.add('interceptSpotify', () => {
  cy.intercept('GET', '/api/spotify/search*', { fixture: 'spotify-search.json' }).as(
    'spotifySearch'
  )
})
