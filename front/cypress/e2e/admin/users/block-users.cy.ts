describe('Block user', () => {
  let userBlockingWasAllowed = false;
  let userBlockingWasEnabled = false;

  before(() => {
    cy.apiGetAppConfiguration().then((config) => {
      const userBlocking = config.body.data.attributes.settings.user_blocking;
      userBlockingWasAllowed = userBlocking?.allowed === true;
      userBlockingWasEnabled = userBlocking?.enabled === true;
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.apiUpdateAppConfiguration({
      settings: { user_blocking: { allowed: true, enabled: true } },
    });

    cy.visit('/admin/users');
  });

  after(() => {
    cy.apiUpdateAppConfiguration({
      settings: {
        user_blocking: {
          allowed: userBlockingWasAllowed,
          enabled: userBlockingWasEnabled,
        },
      },
    });
  });

  it('Block from User Manager', () => {
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .not(':contains("admin@govocal.com")')
      .first()
      .find('.e2e-more-actions')
      .click();

    cy.get('.e2e-more-actions-list').contains('Block').click();

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
      .click();

    cy.get('.e2e-more-actions-list').contains('Unblock');
  });

  it('Unblock from User Manager', () => {
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .not(':contains("admin@govocal.com")')
      .first()
      .find('.e2e-more-actions')
      .click();

    cy.get('.e2e-more-actions-list').contains('Unblock').click();

    cy.intercept({ method: 'PATCH', url: '**/unblock' }).as('unblockRequest');
    cy.get('#e2e-modal-container').contains('button', 'Yes').click();
    cy.wait('@unblockRequest');

    cy.get('.e2e-left-panel').contains('a', 'Blocked users').contains('0');

    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .first()
      .find('.e2e-more-actions')
      .click();

    cy.get('.e2e-more-actions-list').contains('Block');
  });

  it('Block from User Profile', () => {
    // Go to user profile by clicking on the first user in the table
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .not(':contains("admin@govocal.com")')
      .first()
      .find('td')
      .eq(1)
      .find('a')
      .click();

    cy.get('.e2e-more-actions').click();

    cy.get('.e2e-more-actions-list').contains('Block').click();

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

    cy.get('.e2e-more-actions').click();

    cy.get('.e2e-more-actions-list').contains('Unblock');
  });

  it('Unblock from User Profile', () => {
    // Go to user profile by clicking on the first user in the table
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .not(':contains("admin@govocal.com")')
      .first()
      .find('td')
      .eq(1)
      .find('a')
      .click();

    cy.get('.e2e-more-actions').click();

    cy.get('.e2e-more-actions-list').contains('Unblock').click();

    cy.intercept({ method: 'PATCH', url: '**/unblock' }).as('unblockRequest');
    cy.get('#e2e-modal-container').contains('button', 'Yes').click();
    cy.wait('@unblockRequest');

    cy.get('.e2e-more-actions').click();

    cy.get('.e2e-more-actions-list').contains('Block');
  });
});
