import moment = require('moment');
import { randomString, apiRemoveProject } from '../support/commands';

describe('Project timeline page', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  const phasePastTitle = randomString();
  const phaseCurrentTitle = randomString();
  const phaseFutureTitle = randomString();

  let projectId: string;
  let projectSlug: string;

  const twoMonthsAgo = moment().subtract(2, 'month').format('DD/MM/YYYY');
  const twoDaysAgo = moment().subtract(2, 'days').format('DD/MM/YYYY');
  const today = moment().format('DD/MM/YYYY');
  const inTwoDays = moment().add(2, 'days').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  before(() => {
    // create new project
    cy.apiCreateProject({
      type: 'timeline',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      // create new phases
      cy.apiCreatePhase(
        projectId,
        phasePastTitle,
        twoMonthsAgo,
        twoDaysAgo,
        'ideation',
        true,
        true,
        true,
        `description ${phasePastTitle}`
      );
      cy.apiCreatePhase(
        projectId,
        phaseCurrentTitle,
        today,
        today,
        'ideation',
        true,
        true,
        true,
        `description ${phaseCurrentTitle}`
      );
      cy.apiCreatePhase(
        projectId,
        phaseFutureTitle,
        inTwoDays,
        inTwoMonths,
        'ideation',
        true,
        true,
        true,
        `description ${phaseFutureTitle}`
      );
    });
  });

  beforeEach(() => {
    // navigate to project
    cy.visit(`/projects/${projectSlug}`);
    cy.wait(1000);
  });

  it('shows the current phase', () => {
    // shows the timeline tab with active state
    cy.get('.e2e-project-process-link').should('have.class', 'active');
    // shows the current phase's title
    cy.get('.selected.present').contains(phaseCurrentTitle);
    // shows the current phase in the timeline as active, with its title
    cy.get('.e2e-phases')
      .find('.currentPhase')
      .should('have.class', 'selectedPhase')
      .contains(phaseCurrentTitle);
    cy.get('.e2e-project-process-page').contains(
      `description ${phaseCurrentTitle}`
    );
  });

  it('shows the previous phase', () => {
    cy.get('.e2e-previous-phase').click();
    cy.get('.e2e-previous-phase').should('have.attr', 'disabled');
    // shows the current phase's title
    cy.get('.selected.past').contains(phasePastTitle);
    // shows the current phase in the timeline as active, with its title
    cy.get('.e2e-phases')
      .find('.selectedPhase')
      .should('have.class', 'first')
      .contains(phasePastTitle);
    cy.get('.e2e-project-process-page').contains(
      `description ${phasePastTitle}`
    );
  });

  it('shows the next phase', () => {
    cy.get('.e2e-phases').find('.last').click();
    // shows the current phase's title
    cy.get('.selected.future').contains(phaseFutureTitle);
    // shows the current phase in the timeline as active, with its title
    cy.get('.e2e-phases')
      .find('.selectedPhase')
      .should('have.class', 'last')
      .contains(phaseFutureTitle);
    cy.get('.e2e-project-process-page').contains(
      `description ${phaseFutureTitle}`
    );
  });

  after(() => {
    apiRemoveProject(projectId);
  });
});
