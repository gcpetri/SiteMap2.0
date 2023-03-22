describe('home', () => {
  it('Visits the Base URL', () => {
    cy.visit('/')
    cy.title().should('contain', 'SiteMap')
  })
})

export {}