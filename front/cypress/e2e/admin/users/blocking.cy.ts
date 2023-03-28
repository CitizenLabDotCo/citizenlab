describe('/admin/users/ page', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/users');
  });

  it('Block from User Manager', () => {
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .not(':contains("admin@citizenlab.co")')
      .first()
      .find('.e2e-more-actions')
      .click()
      .parent()
      .contains('Block')
      .click();

    cy.get('#e2e-modal-container')
      .find('textarea')
      .type('Test block reason')
      .parents('form')
      .find('button')
      .contains('Block')
      .click();

    cy.wait(500);

    cy.get('#e2e-modal-container').contains('All done');

    cy.get('.e2e-modal-close-button').click();

    cy.get('.e2e-left-panel').contains('a', 'Blocked users').contains('1');

    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .first()
      .find('.e2e-more-actions')
      .click()
      .parent()
      .contains('Unblock');
  });

  it('Unblock from User Manager', () => {
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .not(':contains("admin@citizenlab.co")')
      .first()
      .find('.e2e-more-actions')
      .click()
      .parent()
      .contains('Unblock')
      .click();

    cy.get('#e2e-modal-container').contains('button', 'Yes').click();

    cy.get('.e2e-left-panel').contains('a', 'Blocked users').contains('0');

    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .first()
      .find('.e2e-more-actions')
      .click()
      .parent()
      .contains('Block');
  });

  it('Block from User Profile', () => {
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .not(':contains("admin@citizenlab.co")')
      .first()
      .find('td')
      .eq(2)
      .find('a')
      .click();

    cy.get('.e2e-more-actions').click().parent().contains('Block').click();

    cy.get('#e2e-modal-container')
      .find('textarea')
      .type('Test block reason')
      .parents('form')
      .find('button')
      .contains('Block')
      .click();

    cy.wait(500);

    cy.get('#e2e-modal-container').contains('All done');

    cy.get('.e2e-modal-close-button').click();

    cy.get('#e2e-usersshowpage').contains('Blocked');

    cy.get('.e2e-more-actions').click().parent().contains('Unblock');
  });

  it('Unblock from User Profile', () => {
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .not(':contains("admin@citizenlab.co")')
      .first()
      .find('td')
      .eq(2)
      .find('a')
      .click();

    cy.get('.e2e-more-actions').click().parent().contains('Unblock').click();

    cy.get('#e2e-modal-container').contains('button', 'Yes').click();

    cy.wait(500);

    cy.get('.e2e-more-actions').click().parent().contains('Block');
  });

  it('Should not allow for current user to block itself', () => {
    cy.get('.e2e-user-table')
      .contains('.e2e-user-table-row', 'admin@citizenlab.co')
      .find('.e2e-more-actions')
      .click()
      .parent()
      .contains('Block')
      .should('not.exist');
  });
});
