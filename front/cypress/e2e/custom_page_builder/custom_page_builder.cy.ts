import { randomString } from '../../support/commands';

describe('Custom page builder', () => {
  const pageTitle = randomString();
  const projectTitle = randomString();

  let pageId = '';
  let pageSlug = '';
  let projectId = '';
  let filteringWasEnabled = false;

  const setFiltering = (enabled: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: { advanced_custom_pages: { allowed: enabled, enabled } },
    });

  // Ready means the toolbox is up as well as the canvas: a click before then selects nothing.
  const openBuilder = () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/custom-page-builder/pages/${pageId}`);
    cy.get('div#ROOT');
    cy.get('#e2e-draggable-text');
  };

  before(() => {
    cy.setAdminLoginCookie();

    cy.apiGetAppConfiguration().then((config) => {
      filteringWasEnabled =
        config.body.data.attributes.settings.advanced_custom_pages?.enabled ===
        true;
    });
    setFiltering(true);

    // Published widget needs a published project to list.
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectTitle,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
    });

    cy.apiCreateCustomPage(pageTitle).then((page) => {
      pageId = page.body.data.id;
      pageSlug = page.body.data.attributes.slug;
    });
  });

  after(() => {
    setFiltering(filteringWasEnabled);
    if (pageId) cy.apiRemoveCustomPage(pageId);
    if (projectId) cy.apiRemoveProject(projectId);
  });

  // The Call to action is the homepage widget worth checking on a published page: its buttons
  // used to render only while the editor was enabled, which the homepage never turns off but a
  // published custom page does.
  it('renders homepage widgets added in the builder on the published page', () => {
    const buttonText = `Go ${randomString()}`;
    openBuilder();

    cy.get('#e2e-draggable-published').dragAndDrop(
      '[data-cy="e2e-custom-page-body"]',
      { position: 'inside' }
    );
    cy.get('#e2e-draggable-call-to-action').dragAndDrop(
      '[data-cy="e2e-custom-page-body"]',
      { position: 'inside' }
    );

    // A dropped widget is selected, so its settings panel is open.
    cy.get('#highlight_primaryButtonText').type(buttonText);
    cy.get('#highlight_primaryButtonLink').type('/projects');

    cy.intercept('**/content_builder_layouts/custom_page/upsert').as(
      'saveCustomPageLayout'
    );
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveCustomPageLayout');

    cy.visit(`/pages/${pageSlug}`);
    cy.get('.e2e-published-projects-and-folders').should('exist');
    cy.contains(buttonText).should('be.visible');
  });

  // One page replaces the settings and content tabs: the settings form beside a preview, and
  // the builder one click away.
  it('edits the page from one page with a preview', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/pages-menu/pages/${pageId}/settings`);

    cy.get('[data-testid="customPageSettingsForm"]').should('be.visible');
    cy.get('.e2e-resource-tabs').should('not.exist');
    // The builder's widgets list projects and events, so the form's linked items are gone.
    cy.get('[id^="projects_filter_type_"]').should('not.exist');
    cy.dataCy('e2e-custom-page-preview')
      .find('iframe')
      .should('have.attr', 'src')
      .and('include', `/pages/${pageSlug}`);

    // The button only shows while the preview is hovered, which Cypress cannot do.
    cy.dataCy('e2e-edit-page-content').click({ force: true });
    cy.location('pathname').should(
      'include',
      `/admin/custom-page-builder/pages/${pageId}`
    );
    cy.get('#e2e-draggable-text');

    cy.get('#e2e-go-back-button').click();
    cy.location('pathname').should(
      'include',
      `/admin/pages-menu/pages/${pageId}/settings`
    );
  });
});
