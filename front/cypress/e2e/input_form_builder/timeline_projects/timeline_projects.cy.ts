import moment = require('moment');
import { randomString } from '../../../support/commands';

describe('Input form builder timeline projects', () => {
  const projectTitle1 = randomString();
  const projectTitle2 = randomString();
  let projectID1: string;
  let projectID2: string;
  let phaseIDProject1: string;
  let phaseIDProject2: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.apiCreateProject({
      type: 'timeline',
      title: projectTitle1,
      descriptionPreview: '',
      description: '',
      publicationStatus: 'published',
    }).then((project) => {
      projectID1 = project.body.data.id;
      cy.apiCreatePhase(
        projectID1,
        'Ideation Phase I',
        moment().subtract(2, 'month').format('DD/MM/YYYY'),
        moment().add(2, 'days').format('DD/MM/YYYY'),
        'ideation',
        true,
        true,
        true
      ).then((phase) => {
        phaseIDProject1 = phase.body.data.id;
      });
      cy.apiCreatePhase(
        projectID1,
        'Ideation Phase II',
        moment().add(4, 'days').format('DD/MM/YYYY'),
        moment().add(2, 'months').format('DD/MM/YYYY'),
        'ideation',
        true,
        true,
        true
      );
    });

    // Create second project
    cy.apiCreateProject({
      type: 'timeline',
      title: projectTitle2,
      descriptionPreview: '',
      description: '',
      publicationStatus: 'published',
    }).then((project) => {
      projectID2 = project.body.data.id;
      cy.apiCreatePhase(
        projectID2,
        'Ideation Phase I',
        moment().subtract(2, 'month').format('DD/MM/YYYY'),
        moment().subtract(2, 'days').format('DD/MM/YYYY'),
        'ideation',
        true,
        true,
        true
      );
      cy.apiCreatePhase(
        projectID2,
        'Ideation Phase II',
        moment().add(4, 'days').format('DD/MM/YYYY'),
        moment().add(2, 'months').format('DD/MM/YYYY'),
        'ideation',
        true,
        true,
        true
      ).then((phase) => {
        phaseIDProject2 = phase.body.data.id;
      });
    });
  });

  afterEach(() => {
    if (projectID1) {
      cy.apiRemoveProject(projectID1);
    }

    if (projectID2) {
      cy.apiRemoveProject(projectID2);
    }
  });

  it('opens the idea form builder with correct phase ID', () => {
    // Test that any current ideation phase is passed
    cy.visit(`admin/projects/${projectID1}/ideaform`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();
    // verify URL has correct phaseID parameter
    cy.url().should('include', `${phaseIDProject1}`);
    // verify clicking view form takes you to correct phase-specific input form
    cy.get('[data-cy="e2e-preview-form-button"]').should('exist');
    cy.get('[data-cy="e2e-preview-form-button"]').click({ force: true });
    cy.url().should('include', `${phaseIDProject1}`);

    // Test that last phase is used if no current ideation phase
    cy.visit(`admin/projects/${projectID2}/ideaform`);
    cy.get('[data-cy="e2e-edit-input-form"]').click();
    // verify URL has correct phaseID parameter
    cy.url().should('include', `${phaseIDProject2}`);
    // verify clicking view form takes you to correct phase-specific input form
    cy.get('[data-cy="e2e-preview-form-button"]').should('exist');
    cy.get('[data-cy="e2e-preview-form-button"]').click({ force: true });
    cy.url().should('include', `${phaseIDProject2}`);
  });
});
