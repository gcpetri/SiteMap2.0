Cypress.Commands.add('shouldNotExist', (selector: string) => {
  cy.get(selector).should('not.exist')
})

declare global {
  namespace Cypress {
    interface Chainable {
      shouldNotExist(selector: string): Chainable<void>
    }
  }
}

export {}