import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Input form builder', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let phaseId: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.setAdminLoginCookie();

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          endAt: moment().subtract(3, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });
  });

  it('does not allow the title field to be deleted and provides no way to edit the question title', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.dataCy('e2e-edit-input-form').click();

    cy.dataCy('e2e-form-fields').within(() => {
      cy.contains('Title').should('exist');
      cy.contains('Title').click();
    });

    cy.dataCy('e2e-form-fields').within(() => {
      cy.contains('Title').within(() => {
        cy.dataCy('e2e-more-field-actions').should('not.exist');
      });
    });

    cy.get('#e2e-title-multiloc').should('not.exist');
  });
});
