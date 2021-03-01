describe('when logged out', () => {
  beforeEach(() => {
    cy.wait(1000);
    cy.visit('/initiatives/cleaning-the-sidewalks-party');
    cy.wait(1000);
    cy.get('#e2e-initiative-show');
    cy.acceptCookies();
  });

  it('shows the page', () => {
    cy.get('#e2e-initiative-show');
  });

  it('shows the home page link with correct href', () => {
    cy.get('#e2e-home-page-link')
      .should('have.attr', 'href')
      .and('include', '/en/');
  });

  it('shows the link to the initiatives overview page with correct href', () => {
    cy.get('#e2e-initiative-other-link')
      .should('have.attr', 'href')
      .and('include', '/en/initiatives');
  });

  it('shows the initiative title', () => {
    cy.get('#e2e-initiative-title');
  });

  it('shows a link to author profile', () => {
    cy.get('#e2e-initiative-posted-by .e2e-author-link').click();
    cy.location('pathname').should('eq', '/en/profile/casey-luettgen');
  });

  it('shows the initiative body', () => {
    cy.get('#e2e-initiative-description');
  });

  it('shows the vote control', () => {
    cy.get('#e2e-initiative-vote-control');
  });

  it('shows the sharing component', () => {
    cy.get('#e2e-initiative-sharing-component');
  });

  it('shows the comments correctly', () => {
    // Get parent comment
    cy.get('#e2e-parent-and-childcomments').find('.e2e-parentcomment');

    // Get child comment
    cy.get('#e2e-parent-and-childcomments').find('.e2e-childcomment');
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
