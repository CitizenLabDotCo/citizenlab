import { randomString } from '../../support/commands';

// Project pages on the content builder: the admin edit page with its preview, the builder, and
// the published page inside its project.
describe('Project page builder', () => {
  const projectTitle = randomString();
  const pageTitle = randomString();
  const bodyText = randomString();

  let projectId = '';
  let projectSlug = '';
  let pageId = '';
  let pageSlug = '';
  let projectPagesWasEnabled = false;

  const setFeatures = (enabled: boolean, projectPages: boolean) =>
    cy.apiUpdateAppConfiguration({
      settings: {
        custom_page_builder: { allowed: true, enabled },
        project_static_pages: { allowed: projectPages, enabled: projectPages },
      },
    });

  before(() => {
    cy.apiGetAppConfiguration().then((config) => {
      projectPagesWasEnabled =
        config.body.data.attributes.settings.project_static_pages?.enabled ===
        true;
    });

    // Created with the builder off, so the page starts with legacy content and no layout.
    setFeatures(false, true);
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectTitle,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      cy.apiCreateCustomPage(pageTitle, projectId).then((page) => {
        pageId = page.body.data.id;
        pageSlug = page.body.data.attributes.slug;
        cy.apiUpdateCustomPage(pageId, {
          top_info_section_enabled: true,
          top_info_section_multiloc: { en: `<p>${bodyText}</p>` },
        });
      });
    });
  });

  after(() => {
    setFeatures(false, projectPagesWasEnabled);
    if (pageId) cy.apiRemoveCustomPage(pageId);
    if (projectId) cy.apiRemoveProject(projectId);
  });

  it('edits the page from one page with a preview, and opens the builder', () => {
    setFeatures(true, true);
    cy.setAdminLoginCookie();
    cy.intercept('POST', '**/content_builder_layouts/custom_page/upsert').as(
      'deriveLayout'
    );
    cy.visit(`/admin/projects/${projectId}/pages/${pageId}`);
    // The first visit derives the layout from the page's content.
    cy.wait('@deriveLayout');

    cy.dataCy('e2e-save-project-page').should('exist');
    cy.dataCy('e2e-project-page-preview-panel')
      .find('iframe')
      .should('have.attr', 'src')
      .and('include', `/projects/${projectSlug}/pages/${pageSlug}`);

    // The button only shows while the preview is hovered, which Cypress cannot do.
    cy.dataCy('e2e-edit-page-content').click({ force: true });
    cy.location('pathname').should(
      'include',
      `/admin/custom-page-builder/pages/${pageId}`
    );
    cy.contains(bodyText).should('exist');

    cy.get('#e2e-go-back-button').click();
    cy.location('pathname').should(
      'include',
      `/admin/projects/${projectId}/pages/${pageId}`
    );
  });

  it('renders the derived layout on the published page, under its project', () => {
    setFeatures(true, true);
    cy.visit(`/projects/${projectSlug}/pages/${pageSlug}`);

    cy.contains(bodyText).should('be.visible');
    cy.contains('a', projectTitle).should('be.visible');
  });
});
