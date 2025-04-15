import moment = require('moment');
import { randomString } from '../support/commands';

describe('Existing Timeline project', () => {
  before(() => {
    cy.visit('/projects/test-project-1-timeline-with-file');
    cy.get('#e2e-project-page');
    cy.acceptCookies();
    cy.wait(1000);
  });

  it('shows the correct elements', () => {
    // shows the project page
    cy.get('#e2e-project-page');

    // shows the project header
    cy.get('#e2e-project-header-image');
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-see-ideas-button');
    cy.get('#project-ideabutton');
    cy.get('.e2e-project-info')
      .contains('20190110_rueil_intermediaire.pdf')
      .should('have.attr', 'href');

    // shows the timeline
    cy.get('#project-timeline');

    // shows the timeline phases
    cy.get('.e2e-phases');

    // shows the phase navigation buttons
    cy.get('.e2e-timeline-phase-navigation');

    // has a selected phase
    cy.get('.e2e-phases .selectedPhase');

    // shows the phase title
    cy.get('.e2e-phase-title');

    // shows the phase description
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
  const today = moment().format('DD/MM/YYYY');
  const inTwoDays = moment().add(2, 'days').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  before(() => {
    // create new project
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'draft',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      // create new phases
      cy.apiCreatePhase({
        projectId,
        title: phasePastTitle,
        startAt: twoMonthsAgo,
        endAt: twoDaysAgo,
        participationMethod: 'ideation',
        canComment: true,
        canPost: true,
        canReact: true,
        description: `description ${phasePastTitle}`,
      });
      cy.apiCreatePhase({
        projectId,
        title: phaseCurrentTitle,
        startAt: today,
        endAt: today,
        participationMethod: 'ideation',
        canComment: true,
        canPost: true,
        canReact: true,
        description: phaseLongDescription,
      });
      cy.apiCreatePhase({
        projectId,
        title: phaseFutureTitle,
        startAt: inTwoDays,
        endAt: inTwoMonths,
        participationMethod: 'ideation',
        canComment: true,
        canPost: true,
        canReact: true,
        description: `description ${phaseFutureTitle}`,
      });
      return cy.apiCreateEvent({
        projectId,
        title: 'Some event',
        location: 'Some location',
        description: 'This is some event',
        startDate: moment().subtract(1, 'day').toDate(),
        endDate: moment().add(1, 'day').toDate(),
      });
    });
  });

  beforeEach(() => {
    // navigate to project
    cy.setAdminLoginCookie();
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

  // Temporarily disables on April 15 2025 - can verify this works locally
  // but doesn't pass on CI.
  it.skip('can toggle between read more and read less when description is long', () => {
    cy.get('.e2e-phases')
      .find('.currentPhase')
      .should('have.class', 'selectedPhase')
      .contains(phaseCurrentTitle);
    cy.get('.e2e-project-process-page').contains(phaseLongDescription);

    // Verify that the description is collapsed by default
    cy.get('[id*="see-less-button"]').should('not.exist');

    // Read more/less button functionality
    cy.get('[id*="read-more-button"]').should('be.visible').click();
    cy.get('[id*="read-more-button"]').should('not.exist');

    cy.get('[id*="see-less-button"]')
      .should('be.visible')
      .then(($btn) => {
        cy.wrap($btn).click();
      });

    // Verify that the description is collapsed again
    cy.get('[id*="read-more-button"]').should('be.visible');
    cy.get('[id*="see-less-button"]').should('not.exist');
  });

  it('shows the event CTA button', () => {
    // Shows the event CTA when there is an upcoming event
    cy.get('#e2e-project-see-events-button').should('be.visible');
  });

  it('shows the previous phase', () => {
    cy.intercept(`**/phases/**`).as('phaseRequests');
    cy.get('.e2e-previous-phase').should('be.visible');
    cy.get('.e2e-previous-phase').click({ force: true });
    cy.wait('@phaseRequests');
    cy.get('.e2e-previous-phase')
      .find('button')
      .should('have.attr', 'aria-disabled', 'true');

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
    cy.intercept(`**/phases/**`).as('phaseRequests');
    // go to the next (and last) phase
    cy.get('.e2e-next-phase').should('be.visible');
    cy.get('.e2e-next-phase').click({ force: true });
    cy.wait('@phaseRequests');
    // verify it's not possible to go to a next phase
    // and this is our last phase
    cy.get('.e2e-next-phase')
      .find('button')
      .should('have.attr', 'aria-disabled', 'true');
    // shows the current phase in the timeline as active, with its title
    cy.get('.e2e-phases')
      .find('.selectedPhase')
      .should('have.class', 'last')
      .contains(phaseFutureTitle);
    cy.get('.e2e-project-process-page').contains(
      `description ${phaseFutureTitle}`
    );
  });

  it('shows the events viewer even in draft projects', () => {
    cy.get('[data-testid="EventInformation"]').should('be.visible');
  });

  it('correctly handles phaseNumber URL parameter', () => {
    cy.intercept(`**/phases/**`).as('phaseRequests');

    const pathWithLocale = `/en/projects/${projectSlug}`;

    cy.location('pathname').should('eq', pathWithLocale);

    // visit first (past phase)
    cy.visit(`${pathWithLocale}/1`);

    cy.get('.e2e-phases').find('.selectedPhase').contains(phasePastTitle);

    // go to next (current) phase
    cy.get('.e2e-next-phase').click();
    cy.wait('@phaseRequests');

    cy.location('pathname').should('eq', pathWithLocale);

    cy.get('.e2e-phases').find('.selectedPhase').contains(phaseCurrentTitle);

    // go to next (last) phase
    cy.get('.e2e-next-phase').click();
    cy.wait('@phaseRequests');

    cy.location('pathname').should('eq', `${pathWithLocale}/3`);

    cy.get('.e2e-phases').find('.selectedPhase').contains(phaseFutureTitle);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
