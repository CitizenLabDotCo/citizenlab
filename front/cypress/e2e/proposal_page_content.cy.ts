describe('when logged out', () => {
  beforeEach(() => {
    cy.wait(1000);
    cy.visit('/initiatives/cleaning-the-sidewalks-party');
    cy.wait(1000);
    cy.get('#e2e-initiative-show');
    cy.acceptCookies();
  });

  it('shows the page with elements', () => {
    cy.get('#e2e-initiative-show');

    cy.get('#e2e-home-page-link')
      .should('have.attr', 'href')
      .and('include', '/en/');

    cy.get('#e2e-initiative-other-link')
      .should('have.attr', 'href')
      .and('include', '/en/initiatives');

    cy.get('#e2e-initiative-title');

    cy.get('#e2e-initiative-posted-by .e2e-author-link').click();
    cy.location('pathname').should('eq', '/en/profile/casey-luettgen');
    cy.visit('/initiatives/cleaning-the-sidewalks-party');

    cy.get('#e2e-initiative-description');

    cy.get('#e2e-initiative-reaction-control');

    cy.get('#e2e-initiative-sharing-component');

    cy.get('.e2e-parent-and-childcomments').find('.e2e-parentcomment');

    cy.get('.e2e-parent-and-childcomments').find('.e2e-childcomment');
  });
});

describe('when logged in as an admin', () => {
  it('has the More Options menu and opens it', () => {
    cy.setAdminLoginCookie();
    cy.visit('/initiatives/cleaning-the-sidewalks-party');
    cy.wait(1000);
    cy.get('#e2e-initiative-more-actions-desktop').click();
    cy.get('.e2e-more-actions-list button').eq(0).contains('Report as spam');
    cy.get('.e2e-more-actions-list button').eq(1).contains('Edit proposal');
    cy.get('.e2e-more-actions-list button').eq(2).contains('Delete proposal');
  });
});
