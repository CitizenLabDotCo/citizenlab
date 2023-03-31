describe('Block user', () => {
  beforeEach(() => {
    cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
      const adminJwt = response.body.jwt;
      cy.request({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        method: 'PATCH',
        url: `web_api/v1/app_configuration`,
        body: {
          settings: {
            user_blocking: {
              enabled: true,
              allowed: true,
            },
          },
        },
      });
    });
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

    cy.intercept({ method: 'PATCH', url: '**/block' }).as('blockRequest');
    cy.get('#e2e-modal-container')
      .find('textarea')
      .type('Test block reason')
      .parents('form')
      .find('button')
      .contains('Block')
      .click();
    cy.wait('@blockRequest');

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

    cy.intercept({ method: 'PATCH', url: '**/unblock' }).as('unblockRequest');
    cy.get('#e2e-modal-container').contains('button', 'Yes').click();
    cy.wait('@unblockRequest');

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
    // Go to user profile by clicking on the first user in the table
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .not(':contains("admin@citizenlab.co")')
      .first()
      .find('td')
      .eq(2)
      .find('a')
      .click();

    cy.get('.e2e-more-actions').click().parent().contains('Block').click();

    cy.intercept({ method: 'PATCH', url: '**/block' }).as('blockRequest');
    cy.get('#e2e-modal-container')
      .find('textarea')
      .type('Test block reason')
      .parents('form')
      .find('button')
      .contains('Block')
      .click();
    cy.wait('@blockRequest');

    cy.get('#e2e-modal-container').contains('All done');

    cy.get('.e2e-modal-close-button').click();

    cy.get('#e2e-usersshowpage').contains('Blocked');

    cy.get('.e2e-more-actions').click().parent().contains('Unblock');
  });

  it('Unblock from User Profile', () => {
    // Go to user profile by clicking on the first user in the table
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .not(':contains("admin@citizenlab.co")')
      .first()
      .find('td')
      .eq(2)
      .find('a')
      .click();

    cy.get('.e2e-more-actions').click().parent().contains('Unblock').click();

    cy.intercept({ method: 'PATCH', url: '**/unblock' }).as('unblockRequest');
    cy.get('#e2e-modal-container').contains('button', 'Yes').click();
    cy.wait('@unblockRequest');

    cy.get('.e2e-more-actions').click().parent().contains('Block');
  });
});
