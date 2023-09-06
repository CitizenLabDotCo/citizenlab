import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

describe('Volunteering survey CTA', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
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
          type: 'continuous',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
          participationMethod: 'volunteering',
        }).then((project) => {
          projectId = project.body.data.id;
          projectSlug = project.body.data.attributes.slug;

          cy.apiCreateEvent({
            projectId,
            title: 'Event title',
            location: 'Event location',
            includeLocation: true,
            description: 'Event description',
            startDate: moment().subtract(1, 'day').toDate(),
            endDate: moment().add(1, 'day').toDate(),
          });
        });
      });
  });

  it('shows the CTA button on visting the project page of an active volunteering project', () => {
    cy.visit(`/en/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('#e2e-participation-cta-volunteer').should('exist');

    // Shows the event CTA when there is an upcoming event
    cy.get('#e2e-project-see-events-button').should('exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
