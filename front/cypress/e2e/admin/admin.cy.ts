describe('/admin route', () => {
  it('redirects unauthenticated users to signin', () => {
    cy.visit('/admin');
    cy.wait(1000);
    cy.location('pathname').should('eq', '/en/');
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
  { url: 'projects', container: '#e2e-projects-admin-container' },
  { url: 'reporting', container: '#e2e-reporting-container' },
  { url: 'ideas', container: '#e2e-input-manager-container' },
  { url: 'initiatives', container: '#e2e-initiatives-admin-container' },
  { url: 'users', container: '#e2e-users-container' },
  { url: 'pages-menu', container: '#e2e-pages-menu-container' },
  { url: 'messaging', container: '#e2e-messaging-container' },
  { url: 'settings/general', container: '#e2e-settings-container' },
];

describe('navigation to admin section when clicking corresponding button in side panel', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/en/admin/dashboard');
  });

  ADMIN_PAGES.forEach(({ url, container }) => {
    it(`navigates to ${url}`, () => {
      cy.get(`nav#sidebar > a[href="/en/admin/${url}"]`).click();
      cy.location('pathname').should('include', `/en/admin/${url}`);
      cy.get(container);
    });
  });
});

describe('direct visits admin sections', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  ADMIN_PAGES.forEach(({ url, container }) => {
    it(`navigates to ${url}`, () => {
      cy.visit(`/en/admin/${url}`);
      cy.location('pathname').should('include', `/en/admin/${url}`);
      cy.get(container);
    });
  });
});
