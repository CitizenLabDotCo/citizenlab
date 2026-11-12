import { addDays, format, subDays } from 'date-fns';

import { randomEmail, randomString } from '../../support/commands';

describe('Redesigned event Manage view', () => {
  let projectId: string;
  let eventId: string;
  let participantIds: string[];
  const eventTitle = randomString();

  beforeEach(() => {
    participantIds = [];
    cy.setAdminLoginCookie();
    cy.viewport(1400, 900);
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: format(subDays(new Date(), 1), 'dd/MM/yyyy'),
          participationMethod: 'ideation',
        });
      })
      .then(() =>
        cy.apiCreateEvent({
          projectId,
          title: eventTitle,
          description: randomString(30),
          location: 'Central park',
          startDate: addDays(new Date(), 1),
          endDate: addDays(new Date(), 2),
          maximumAttendees: 25,
        })
      )
      .then((event) => {
        eventId = event.body.data.id;
      });
  });

  afterEach(() => {
    if (projectId) cy.apiRemoveProject(projectId);
    participantIds.forEach((id) => cy.apiRemoveUser(id));
  });

  const visitManage = () => {
    cy.visit(
      `admin/projects/${projectId}/events/${eventId}?project_backoffice_redesign`
    );
    cy.contains('button', /^Manage$/).click();
  };

  it('lists, searches, filters, sorts, paginates and exports registrants', () => {
    const surname = randomString();
    const email = randomEmail();
    let oldestAttendanceId: string;
    let newestAttendanceId: string;

    Array.from({ length: 21 }, (_, index) => {
      const participantEmail = index === 0 ? email : randomEmail();
      cy.apiSignup(
        'Registrant',
        `${surname}-${index}`,
        participantEmail,
        randomString(16)
      )
        .then((participant) => {
          participantIds.push(participant.body.data.id);
          return cy.apiAttendEvent(eventId, participant._jwt);
        })
        .then((attendance) => {
          if (index === 0) oldestAttendanceId = attendance.body.data.id;
          if (index === 20) newestAttendanceId = attendance.body.data.id;
        });
    });

    cy.then(() => {
      visitManage();
      cy.contains('21 registrants').should('be.visible');
      cy.contains('4 of 25').should('be.visible');
      cy.get('[data-cy^="e2e-event-registrant-"]')
        .should('have.length', 20)
        .first()
        .should(
          'have.attr',
          'data-cy',
          `e2e-event-registrant-${newestAttendanceId}`
        );
      cy.contains('button', /^2$/).click();
      cy.get(`[data-cy="e2e-event-registrant-${oldestAttendanceId}"]`).should(
        'be.visible'
      );
      cy.contains('button', /^1$/).click();
      cy.contains('th', 'Registered').find('button').click();
      cy.get('[data-cy^="e2e-event-registrant-"]')
        .first()
        .should(
          'have.attr',
          'data-cy',
          `e2e-event-registrant-${oldestAttendanceId}`
        );
      cy.get('[aria-label="Search registrants"]').click();
      cy.get('[data-cy="e2e-input-manager-search"]').type(email);
      cy.contains('1 registrant', { matchCase: false }).should('be.visible');
      cy.get('[data-cy^="e2e-event-registrant-"]')
        .should('have.length', 1)
        .and('contain.text', email);
      cy.contains('4 of 25').should('be.visible');
      cy.get('[aria-label="Filter"]').click();
      cy.get('[data-cy="e2e-manage-filter-signedUp"]').click();
      cy.contains('button', /^Earlier$/).click();
      cy.contains('No registrants match these filters').should('be.visible');
      cy.contains('button', 'Export registrants').should('be.visible');
      cy.get('body').type('{esc}');
      cy.contains('button', /^Clear$/).click();
      cy.contains('21 registrants').should('be.visible');
      cy.intercept('GET', `**/events/${eventId}/attendees_xlsx*`).as('export');
      cy.contains('button', 'Export registrants').click();
      cy.wait('@export').its('response.statusCode').should('eq', 200);
      cy.readFile(
        `${Cypress.config('downloadsFolder')}/registrants-${eventTitle}.xlsx`,
        'binary'
      ).should('not.be.empty');
    });
  });

  it('shows an empty Manage view for a draft and preserves edits when switching back', () => {
    cy.visit(
      `admin/projects/${projectId}/events/new?project_backoffice_redesign`
    );
    cy.get('#event-title').type('Community walk');
    cy.contains('button', /^Manage$/).click();
    cy.contains('No registrants yet').should('be.visible');
    cy.contains('button', 'Export registrants').should('not.exist');
    cy.contains('button', /^Build$/).click();
    cy.get('#event-title').should('have.value', 'Community walk');
  });

  it('offers retry when registrants cannot be loaded', () => {
    let requests = 0;
    cy.intercept('GET', `**/events/${eventId}/attendances*`, (request) => {
      requests += 1;
      if (requests === 1) request.reply({ statusCode: 503, body: {} });
      else request.continue();
    });
    visitManage();
    cy.get('[role="alert"]').should(
      'contain.text',
      'Registrants could not be loaded'
    );
    cy.contains('button', 'Try again').click();
    cy.contains('No registrants yet').should('be.visible');
  });
});
