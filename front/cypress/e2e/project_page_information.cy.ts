import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

describe('Information with events CTA', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  // A retry re-runs the test body, so the CTA test can create more than one event.
  // All of them have to go before the ordering suites run: an ongoing leftover shows
  // up among the upcoming events. Each suite asks for the cleanup without knowing
  // whether another one already did it.
  const ctaEventIds: string[] = [];

  const removeCtaEvents = () => {
    ctaEventIds.splice(0).forEach((id) => cy.apiRemoveEvent(id));
  };

  before(() => {
    cy.apiSignup(firstName, lastName, email, password)
      .then(() => {
        cy.apiLogin(email, password);
      })
      .then(() => {
        cy.apiCreateProject({
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
        }).then((project) => {
          projectId = project.body.data.id;
          projectSlug = project.body.data.attributes.slug;
          cy.apiCreatePhase({
            projectId,
            title: 'informationPhaseTitle',
            startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
            endAt: moment().add(1, 'month').format('DD/MM/YYYY'),
            participationMethod: 'information',
            canPost: true,
            canComment: true,
            canReact: true,
          });
        });
      });
  });

  it('does not show the CTA elements when visiting active information project with no events', () => {
    cy.visit(`/en/projects/${projectSlug}`);

    cy.get('#e2e-project-see-events-button').should('not.exist');
    cy.get('#e2e-event-previews').should('not.exist');
    cy.get('#e2e-cta-bar-see-events').should('not.exist');
    cy.get('#e2e-project-page-events').should('not.exist');
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
    }).then((event) => {
      ctaEventIds.push(event.body.data.id);

      cy.visit(`/en/projects/${projectSlug}`);

      cy.get('#e2e-project-see-events-button').should('exist');
      cy.dockProjectCtaBar();
      cy.get('#e2e-cta-bar-see-events').should('exist');
      cy.get('#e2e-event-previews').should('exist');
      cy.get('#e2e-project-page-events').should('exist');
    });
  });

  describe('upcoming events order', () => {
    const soonestEventTitle = randomString();
    const latestEventTitle = randomString();
    let soonestEventId: string | undefined;
    let latestEventId: string | undefined;

    before(() => {
      removeCtaEvents();

      // Create 2 events in reverse chronological order, so that a wrong sort order
      // cannot pass by accidentally matching the creation order.
      cy.apiCreateEvent({
        projectId,
        title: latestEventTitle,
        location: 'Event location',
        includeLocation: true,
        description: 'Event description',
        startDate: moment().add(3, 'month').toDate(),
        endDate: moment().add(3, 'month').add(1, 'day').toDate(),
      }).then((event) => {
        latestEventId = event.body.data.id;
      });

      cy.apiCreateEvent({
        projectId,
        title: soonestEventTitle,
        location: 'Event location',
        includeLocation: true,
        description: 'Event description',
        startDate: moment().add(1, 'day').toDate(),
        endDate: moment().add(2, 'day').toDate(),
      }).then((event) => {
        soonestEventId = event.body.data.id;
      });
    });

    it('lists the upcoming events with the soonest one first', () => {
      cy.visit(`/en/projects/${projectSlug}`);

      const eventCards = '#e2e-project-page-upcoming-events .e2e-event-card';

      cy.get(eventCards).should('have.length', 2);
      cy.get(eventCards).eq(0).should('contain', soonestEventTitle);
      cy.get(eventCards).eq(1).should('contain', latestEventTitle);
    });

    after(() => {
      if (soonestEventId) cy.apiRemoveEvent(soonestEventId);
      if (latestEventId) cy.apiRemoveEvent(latestEventId);
    });
  });

  describe('past events order', () => {
    const mostRecentEventTitle = randomString();
    const oldestEventTitle = randomString();
    let mostRecentEventId: string | undefined;
    let oldestEventId: string | undefined;

    before(() => {
      removeCtaEvents();

      // Create the oldest event first, so that a wrong sort order cannot pass by
      // accidentally matching the creation order.
      cy.apiCreateEvent({
        projectId,
        title: oldestEventTitle,
        location: 'Event location',
        includeLocation: true,
        description: 'Event description',
        startDate: moment().subtract(1, 'month').toDate(),
        endDate: moment().subtract(1, 'month').add(1, 'day').toDate(),
      }).then((event) => {
        oldestEventId = event.body.data.id;
      });

      cy.apiCreateEvent({
        projectId,
        title: mostRecentEventTitle,
        location: 'Event location',
        includeLocation: true,
        description: 'Event description',
        startDate: moment().subtract(3, 'day').toDate(),
        endDate: moment().subtract(2, 'day').toDate(),
      }).then((event) => {
        mostRecentEventId = event.body.data.id;
      });
    });

    it('lists the past events in reverse chronological order', () => {
      cy.visit(`/en/projects/${projectSlug}`);

      const eventCards = '#e2e-project-page-past-events .e2e-event-card';

      cy.get(eventCards).should('have.length', 2);
      cy.get(eventCards).eq(0).should('contain', mostRecentEventTitle);
      cy.get(eventCards).eq(1).should('contain', oldestEventTitle);
    });

    after(() => {
      if (mostRecentEventId) cy.apiRemoveEvent(mostRecentEventId);
      if (oldestEventId) cy.apiRemoveEvent(oldestEventId);
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
