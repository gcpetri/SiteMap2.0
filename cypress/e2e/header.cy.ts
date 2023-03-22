import { config } from "../../src/utils/config"

describe('header', () => {
  it('title and description are visible', () => {
    cy.visit('/')
    cy.get('#app-name').should('be.visible')
    cy.get('#app-description').should('be.visible')
    cy.get('#app-name').should('contain', config.appName)
    cy.get('#app-description').should('contain', config.appDescription)
  })
})

export {}