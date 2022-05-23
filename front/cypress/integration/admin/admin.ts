describe('/admin route', () => {
  it('redirects unauthenticated users to signin', () => {
    cy.visit('/admin');
    cy.wait(1000);
    cy.location('pathname').should('eq', '/en/sign-in');
  });

  it('redirects admins to dashboard', () => {
    cy.setAdminLoginCookie();
    cy.visit('/admin');
    cy.wait(1000);
    cy.location('pathname').should('eq', '/en/admin/dashboard');
    cy.get('#e2e-dashboard-container');
  });
});

const ADMIN_PAGES = [
  { url: 'moderation', container: '#e2e-moderation-container' },
  { url: 'projects', container: '#e2e-projects-admin-container' },
  { url: 'insights/reports', container: '#e2e-insights-container' },
  { url: 'ideas', container: '#e2e-input-manager-container' },
  { url: 'initiatives', container: '#e2e-initiatives-admin-container' },
  { url: 'users', container: '#e2e-users-container' },
  { url: 'invitations', container: '#e2e-invitations-container' },
  { url: 'messaging', container: '#e2e-messaging-container' },
  { url: 'settings/general', container: '#e2e-settings-container' },
];

describe('navigation to admin sections', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/en/admin/dashboard');
  });

  ADMIN_PAGES.forEach(({ url, container }, i) => {
    it(`navigates to ${url} when clicking corresponding button in side panel`, () => {
      cy.get(`nav#sidebar > a[href="/en/admin/${url}"]`).click();
      cy.location('pathname').should('include', `/en/admin/${url}`);
      cy.get(container);
    });
  });
});
