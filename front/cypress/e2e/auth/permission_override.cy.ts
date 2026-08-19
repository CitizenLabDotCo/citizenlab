import { randomString } from '../../support/commands';

describe('Access rights: overriding and inheriting the platform defaults', () => {
  let projectId: string;
  let phaseId: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();

    // An ideation phase with only the submission action enabled, so the page
    // holds as few panels as possible. 'attending_event' is always available,
    // so the panels still start collapsed.
    cy.createProjectWithIdeationPhase({
      projectTitle: randomString(),
      canPost: true,
      canReact: false,
      canComment: false,
    }).then((result) => {
      projectId = result.projectId;
      phaseId = result.phaseId;
    });
  });

  afterEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
      projectId = '';
    }
  });

  it('overrides the defaults, persists a change and reverts back to inherited', () => {
    cy.intercept(
      'PATCH',
      '**/web_api/v1/phases/*/permissions/posting_idea/override'
    ).as('override');
    cy.intercept('PATCH', '**/web_api/v1/phases/*/permissions/posting_idea').as(
      'updatePermission'
    );
    cy.intercept(
      'PATCH',
      '**/web_api/v1/phases/*/permissions/posting_idea/inherit'
    ).as('inherit');

    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/access-rights`);

    // The action has no permission of its own yet: it follows the platform
    // defaults, and the panel is inert until it is overridden.
    cy.dataCy('e2e-action-inherited-posting_idea').within(() => {
      cy.dataCy('e2e-platform-defaults-header').should('be.visible');
      cy.dataCy('e2e-override-platform-defaults').click();
    });
    cy.wait('@override');

    // The regular panel takes over, and opens itself on override.
    cy.dataCy('e2e-action-inherited-posting_idea').should('not.exist');
    cy.dataCy('e2e-action-form-posting_idea').should('be.visible');

    // Drop the full name requirement under "Personal information".
    cy.dataCy('e2e-action-form-posting_idea').within(() => {
      cy.dataCy('e2e-personal-info-section').find('button').first().click();
      cy.dataCy('e2e-require-name-toggle')
        .find('input[type="checkbox"]')
        .should('be.checked')
        .click({ force: true });
    });
    cy.wait('@updatePermission');
    cy.dataCy('e2e-require-name-toggle')
      .find('input[type="checkbox"]')
      .should('not.be.checked');

    // The setting is persisted, not just held in the form state.
    cy.reload();
    cy.dataCy('e2e-action-accordion-posting_idea').click();
    cy.dataCy('e2e-action-form-posting_idea').within(() => {
      cy.dataCy('e2e-personal-info-section').find('button').first().click();
      cy.dataCy('e2e-require-name-toggle')
        .find('input[type="checkbox"]')
        .should('not.be.checked');

      // Hand the action back to the platform defaults. The modal it opens
      // lives outside this panel, so it is confirmed below.
      cy.dataCy('e2e-revert-to-platform-defaults-posting_idea').click();
    });
    cy.dataCy('e2e-confirm-revert-to-platform-defaults').click();
    cy.wait('@inherit');

    // Back to the inherited state, and the overridden setting is gone with it.
    cy.dataCy('e2e-action-form-posting_idea').should('not.exist');
    cy.dataCy('e2e-action-inherited-posting_idea')
      .find('[data-cy="e2e-platform-defaults-header"]')
      .should('be.visible');
  });
});
