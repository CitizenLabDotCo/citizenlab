import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

describe('Information with events CTA', () => {
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
          participationMethod: 'information',
        }).then((project) => {
          projectId = project.body.data.id;
          projectSlug = project.body.data.attributes.slug;
        });
      });
  });

  it('does not show the CTA elements when visiting active information project with no events', () => {
    cy.visit(`/en/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('#e2e-project-see-events-button').should('not.exist');
    cy.get('#e2e-event-previews').should('not.exist');
    cy.get('#e2e-cta-bar-see-events').should('not.exist');
    cy.get('#e2e-events-section-project-page').should('not.exist');
  });

  it('shows the CTA elements when visiting active information project with events', () => {
    cy.apiCreateEvent({
      projectId,
      title: 'Event title',
      location: 'Event location',
      includeLocation: true,
      description: 'Event description',
      startDate: moment().subtract(1, 'day').toDate(),
      endDate: moment().add(1, 'day').toDate(),
    }).then(() => {
      cy.visit(`/en/projects/${projectSlug}`);
      cy.acceptCookies();
      cy.get('#e2e-project-see-events-button').should('exist');
      cy.get('#e2e-cta-bar-see-events').should('exist');
      cy.get('#e2e-event-previews').should('exist');
      cy.get('#e2e-events-section-project-page').should('exist');
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
