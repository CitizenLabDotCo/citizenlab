import { addDays, format, subDays, subMonths } from 'date-fns';

import { randomString, randomEmail } from '../support/commands';

describe('Volunteering survey CTA', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password)
      .then(() => {
        cy.apiLogin(email, password);
      })
      .then(() => {
        cy.apiCreateProject({
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          publicationStatus: 'published',
        }).then((project) => {
          projectId = project.body.data.id;
          projectSlug = project.body.data.attributes.slug;
          cy.apiCreatePhase({
            projectId,
            title: 'volunteerPhaseTitle',
            startAt: format(subMonths(new Date(), 9), 'dd/MM/yyyy'),
            participationMethod: 'volunteering',
            canPost: true,
            canComment: true,
            canReact: true,
          });
          cy.apiCreateEvent({
            projectId,
            title: 'Event title',
            location: 'Event location',
            includeLocation: true,
            description: 'Event description',
            startDate: subDays(new Date(), 1),
            endDate: addDays(new Date(), 1),
          });
        });
      });
  });

  it('shows the CTA button on visting the project page of an active volunteering project', () => {
    cy.visit(`/en/projects/${projectSlug}`);

    cy.get('#e2e-show-volunteering-cta').should('exist');

    cy.dockProjectCtaBar();
    cy.get('#e2e-participation-cta-volunteer').should('exist');

    // Shows the event CTA when there is an upcoming event
    cy.get('#e2e-project-see-events-button').should('exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
