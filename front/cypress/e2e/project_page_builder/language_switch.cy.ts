import { randomString } from '../../support/commands';

describe('Project description builder language switch', () => {
  let projectId = '';
  let projectSlug = '';
  const projectTitle = randomString();

  // The platform locale is derived from the authenticated user (utils/locale.ts
  // prefers the user's locale over the one in the URL), so switching locale
  // means patching the user and reloading. Once the new locale reaches the
  // locale stream the app rewrites the URL prefix, so asserting on the prefix
  // is what tells us the switch has actually been applied.
  const switchLocale = (locale: string) => {
    cy.apiUpdateCurrentUser({ locale });
    cy.reload();
    cy.location('pathname').should('match', new RegExp(`^/${locale}/`));
  };

  // ProjectPageBuilderPage renders nothing at all until the tenant locales and
  // the layout query have resolved, so this container appearing is the builder's
  // readiness signal — gate on it before touching the toolbox. The admin bundle
  // is heavy enough that booting it can outlast defaultCommandTimeout on a
  // contended CI node (and by a wide margin against a local dev server), hence
  // the explicit budget.
  const BUILDER_BOOT_TIMEOUT = 60000;

  const visitBuilder = () => {
    cy.visit(`/admin/project-page-builder/projects/${projectId}`);
    cy.get('#e2e-project-page-content-builder-page', {
      timeout: BUILDER_BOOT_TIMEOUT,
    }).should('be.visible');
  };

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAdminAuthUser().then((user) => {
      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: randomString(),
        publicationStatus: 'published',
        assigneeId: user.body.data.id,
      }).then((project) => {
        projectSlug = projectTitle;
        projectId = project.body.data.id;
      });
    });
  });

  beforeEach(() => {
    // Test isolation clears cookies before every test, so the login cookie has
    // to be restored before anything that reads it — including
    // apiUpdateCurrentUser, which silently does nothing without it.
    cy.setAdminLoginCookie();
    // The previous test leaves the user on nl-BE; reset it so each test starts
    // from a known platform locale.
    cy.apiUpdateCurrentUser({ locale: 'en' });
  });

  after(() => {
    cy.setAdminLoginCookie();
    cy.apiUpdateCurrentUser({ locale: 'en' });
    cy.apiRemoveProject(projectId);
  });

  it('handles language specific content correctly', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );

    visitBuilder();

    // EN
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-project-page-body', {
      position: 'inside',
    });
    // The seeded layout already contains text widgets, so target the dropped one.
    cy.get('.e2e-text-box').should('have.length', 3);
    cy.get('.e2e-text-box').first().click('center');
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Language 1 text.', { force: true });
    cy.get('.ql-editor').should('contain.text', 'Language 1 text.');
    cy.wait(1000);
    // NL
    cy.get('.e2e-localeswitcher.nl-BE').click();
    cy.get('.ql-editor').clear().type('Language 2 text.', { force: true });
    cy.get('.ql-editor').should('contain.text', 'Language 2 text.');
    cy.wait(1000);
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    // Confirm correct content on live page
    cy.visit(`/projects/${projectSlug}`);
    switchLocale('en');
    cy.contains('Language 1 text.').should('be.visible');
    switchLocale('nl-BE');
    cy.contains('Language 2 text.').should('be.visible');
  });

  it('deletes language specific content correctly', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );

    visitBuilder();

    // The platform locale is reset to 'en' in beforeEach, so the widget renders
    // the English text.
    cy.contains('.e2e-text-box', 'Language 1 text.').click({ force: true });
    cy.get('#e2e-delete-button').click({ force: true });
    cy.contains('.e2e-text-box', 'Language 1 text.').should('not.exist');

    // The builder does not autosave, so the deletion has to be persisted before
    // the live page can say anything about it.
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    // Confirm correct content on live page. The project title is asserted first
    // so the "not.exist" checks run against a rendered page rather than passing
    // against one that has not painted yet.
    cy.visit(`/projects/${projectSlug}`);
    switchLocale('en');
    cy.contains(projectTitle).should('be.visible');
    cy.contains('Language 1 text.').should('not.exist');
    switchLocale('nl-BE');
    cy.contains(projectTitle).should('be.visible');
    cy.contains('Language 2 text.').should('not.exist');
  });
});
