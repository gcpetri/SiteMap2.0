describe('manual input', () => {
  const FILE_TYPES_SELECTOR = '#file-types-selector'
  const KML_TAGS_SELECTOR = '#kml-tags-selector'
  const REGEX_TABLE = '#regex-table'
  const EXPORT_SETUP_FILE_BTN = '#export-setup-file-btn'
  const IMPORT_SETUP_FILE_BTN = '#import-setup-file-btn'
  const SCROLL_NEXT_BTN = '#scroll-next-btn'

  beforeEach(() => {
    cy.visit('/')

    cy.get(FILE_TYPES_SELECTOR).as('ftSelector')
    cy.get(IMPORT_SETUP_FILE_BTN).as('imSetupFileBtn')
    cy.get(EXPORT_SETUP_FILE_BTN).as('exSetupFileBtn')
    cy.get(SCROLL_NEXT_BTN).as('nextBtn')
  })

  it('verify initial state', () => {
    cy.get('#settings-page')
      .should('be.visible')
      .should('contain', 'Setup')

    cy.get('#file-types-component')
      .should('be.visible')

    cy.shouldNotExist('kml-tags-component')

    cy.shouldNotExist('regex-component')

    cy.get('@imSetupFileBtn')
      .should('be.visible')
      .should('not.be.disabled')

    cy.get('@exSetupFileBtn')
      .should('be.visible')
      .should('be.disabled')
    
    cy.get('@nextBtn')
      .should('be.visible')
      .should('be.disabled')
  })

  it('kml or kmz', () => {
    cy.get('@ftSelector')
      .click()

    cy.get('#file-types-selector-option-KML')
      .click()

    cy.get(KML_TAGS_SELECTOR)
      .should('be.visible')

    cy.get('@nextBtn')
      .should('be.disabled')

    cy.get(KML_TAGS_SELECTOR)
      .click()

    cy.get('#kml-tags-selector-option-Placemark')
      .click()

    cy.get('@nextBtn')
      .should('not.be.disabled')

    cy.get('#kml-tags-selector-option-GroundOverlay')
      .click()

    cy.get('@nextBtn')
      .should('not.be.disabled')

    cy.get('#file-types-selector-option-KML')
      .parent()
      .find('.clear-icon')
      .click()

    cy.get('@nextBtn')
      .should('be.disabled')

    cy.get('@ftSelector')
      .click()

    cy.get('#file-types-selector-option-KMZ')
      .click()

    cy.get('#kml-tags-selector-option-Placemark')
      .should('be.visible')

    cy.get('#kml-tags-selector-option-GroundOverlay')
      .should('be.visible')

    cy.get('@nextBtn')
      .should('not.be.disabled')

    cy.get('#kml-tags-selector-option-Placemark')
      .parent()
      .find('.clear-icon')
      .click()

    cy.get('#kml-tags-selector-option-GroundOverlay')
      .parent()
      .find('.clear-icon')
      .click()

    cy.get('@nextBtn')
      .should('be.disabled')
  })

  it('pdf', () => {
    cy.get('@ftSelector')
      .click()

    cy.get('#file-types-selector-option-PDF')
      .click()

    cy.get('#regex-component')
      .should('be.visible')

    // test add and then remove
    cy.get('#regex-add-expr-btn')
      .click()

    cy.get('@nextBtn')
      .should('be.disabled')

    cy.get('#regex-add-expr-btn')
      .should('be.disabled')

    cy.get(REGEX_TABLE)
      .find('tr')
      .find('button')
      .eq(1)
      .click()

    cy.get('#regex-add-expr-btn')
      .should('not.be.disabled')

    // test add one regex
    cy.get('#regex-add-expr-btn')
      .click()

    cy.get(REGEX_TABLE)
      .find('tr')
      .find('input')
      .type('test')
      .type('{enter}')
    
    cy.get('@nextBtn')
      .should('not.be.disabled')

    cy.get(REGEX_TABLE)
      .find('tr')
      .find('button')
      .eq(1)
      .click()

    cy.get('@nextBtn')
      .should('be.disabled')

    // edit label

    // type in first one but leave second blank

    // type duplicate regexes
  })
})

export {}