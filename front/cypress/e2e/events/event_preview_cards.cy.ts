// Test continuous and timeline projects. No events, only past events, only future events, and current events.

import moment = require('moment');
import { randomString, randomEmail } from '../../support/commands';

describe('Event preview cards on timeline project', () => {
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
          type: 'timeline',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
        }).then((project) => {
          projectId = project.body.data.id;
          projectSlug = project.body.data.attributes.slug;

          cy.apiCreatePhase({
            projectId,
            title: 'phaseTitle',
            startAt: moment().subtract(5, 'days').format('DD/MM/YYYY'),
            endAt: moment().add(5, 'days').format('DD/MM/YYYY'),
            participationMethod: 'ideation',
            canReact: true,
            canComment: true,
            canPost: true,
          });
        });
      });
  });

  it('does not show the event previews when visiting active phase with no events', () => {
    cy.visit(`/en/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('#e2e-event-previews').should('not.exist');
  });

  it('shows the CTA elements when visiting active information project with events', () => {
    cy.apiCreateEvent({
      projectId,
      title: 'Event title',
      location: 'Event location',
      includeLocation: true,
      description: 'Event description',
      startDate: moment().subtract(7, 'day').toDate(),
      endDate: moment().add(4, 'day').toDate(),
    }).then(() => {
      cy.visit(`/en/projects/${projectSlug}`);
      cy.acceptCookies();
      cy.get('#e2e-event-previews').should('exist');

      // No arrow buttons for lateral scrolling should exist
      cy.get('#e2e-event-previews-scroll-right').should('not.visible');
      cy.get('#e2e-event-previews-scroll-left').should('not.visible');
    });
  });

  it('shows the arrow buttons when lateral scroll enabled', () => {
    cy.apiCreateEvent({
      projectId,
      title: 'Event title',
      location: 'Event location',
      includeLocation: true,
      description: 'Event description',
      startDate: moment().subtract(1, 'day').toDate(),
      endDate: moment().add(1, 'day').toDate(),
    }).then(() => {
      cy.apiCreateEvent({
        projectId,
        title: 'Event title',
        location: 'Event location',
        includeLocation: true,
        description: 'Event description',
        startDate: moment().subtract(1, 'day').toDate(),
        endDate: moment().add(1, 'day').toDate(),
      }).then(() => {
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
          cy.get('#e2e-event-previews').should('exist');
          cy.get('#e2e-event-previews-scroll-right').should('exist');
          cy.get('#e2e-event-previews-scroll-left').should('exist');
        });
      });
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
