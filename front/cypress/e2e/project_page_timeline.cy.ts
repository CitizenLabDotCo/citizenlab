import moment = require('moment');
import { randomString, apiRemoveProject } from '../support/commands';

describe('Existing Timeline project', () => {
  before(() => {
    cy.visit('/projects/test-project-1-timeline-with-file');
    cy.get('#e2e-project-page');
    cy.acceptCookies();
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-header-image');
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-phases-count');
    cy.get('#e2e-project-sidebar-participants-count');
    cy.get('#e2e-project-sidebar-share-button');
    cy.get('#e2e-project-see-ideas-button');
    cy.get('#project-ideabutton');
    cy.get('.e2e-project-info')
      .contains('20190110_rueil_intermediaire.pdf')
      .should('have.attr', 'href');
  });

  it('shows the timeline', () => {
    cy.get('#project-timeline');
  });

  it('shows the timeline phases', () => {
    cy.get('.e2e-phases');
  });

  it('shows the phase navigation buttons', () => {
    cy.get('.e2e-timeline-phase-navigation');
  });

  it('has a selected phase', () => {
    cy.get('.e2e-phases .selectedPhase');
  });

  it('shows the phase title', () => {
    cy.get('.e2e-phase-title');
  });

  it('shows the phase description', () => {
    cy.get('.e2e-phase-description');
  });
});

describe('New timeline project', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  const phasePastTitle = randomString();
  const phaseCurrentTitle = randomString();
  const phaseLongDescription = randomString(10000);
  const phaseFutureTitle = randomString();

  let projectId: string;
  let projectSlug: string;

  const twoMonthsAgo = moment().subtract(2, 'month').format('DD/MM/YYYY');
  const twoDaysAgo = moment().subtract(2, 'days').format('DD/MM/YYYY');
  const yesterday = moment().add(1, 'days').format('DD/MM/YYYY');
  const tomorrow = moment().add(1, 'days').format('DD/MM/YYYY');
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
        yesterday,
        tomorrow,
        'ideation',
        true,
        true,
        true,
        phaseLongDescription
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
    const path = `/projects/${projectSlug}`;
    cy.visit(path);
    cy.wait(1000);
  });

  it('shows the current phase', () => {
    // shows the current phase in the timeline as active, with its title
    cy.get('.e2e-phases')
      .find('.currentPhase')
      .should('have.class', 'selectedPhase')
      .contains(phaseCurrentTitle);
    cy.get('.e2e-project-process-page').contains(phaseLongDescription);
  });

  it('can toggle between read more and read less when description is long', () => {
    cy.get('.e2e-phases')
      .find('.currentPhase')
      .should('have.class', 'selectedPhase')
      .contains(phaseCurrentTitle);
    cy.get('.e2e-project-process-page').contains(phaseLongDescription);

    cy.get('#e2e-project-phase-description-see-less-button').should(
      'not.exist'
    );
    cy.get('#e2e-project-phase-description-read-more-button')
      .should('exist')
      .click();

    cy.get('#e2e-project-phase-description-read-more-button').should(
      'not.exist'
    );
    cy.get('#e2e-project-phase-description-see-less-button')
      .should('exist')
      .click();
  });

  it('shows the previous phase', () => {
    cy.get('.e2e-previous-phase').click();
    cy.get('.e2e-previous-phase').should('have.attr', 'disabled');

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
    // go to the next (and last) phase
    cy.get('.e2e-next-phase').click();
    // verify it's not possible to go to a next phase
    // and this is our last phase
    cy.get('.e2e-next-phase').should('have.attr', 'disabled');
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
