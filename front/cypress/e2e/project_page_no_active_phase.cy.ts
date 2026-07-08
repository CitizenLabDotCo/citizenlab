import moment = require('moment');
import { randomString } from '../support/commands';

describe('Project page without an active phase', () => {
  const dateFormat = 'DD/MM/YYYY';

  describe('Finished project', () => {
    let projectId = '';
    let projectSlug = '';

    before(() => {
      cy.apiCreateProject({
        title: randomString(),
        descriptionPreview: randomString(),
        description: randomString(),
        publicationStatus: 'published',
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;

        cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: moment().subtract(60, 'days').format(dateFormat),
          endAt: moment().subtract(31, 'days').format(dateFormat),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
    });

    it('does not show participation CTAs', () => {
      cy.visit(`/en/projects/${projectSlug}`);

      // The past phase content is still browsable
      cy.get('#project-ideas');

      cy.get('#e2e-ideation-cta-button').should('not.exist');
      cy.get('.e2e-idea-button').should('not.exist');
    });
  });

  describe('Archived project with a currently running phase', () => {
    let projectId = '';
    let projectSlug = '';

    before(() => {
      cy.apiCreateProject({
        title: randomString(),
        descriptionPreview: randomString(),
        description: randomString(),
        publicationStatus: 'archived',
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;

        cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: moment().subtract(30, 'days').format(dateFormat),
          endAt: moment().add(30, 'days').format(dateFormat),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });

        cy.apiCreateEvent({
          projectId,
          title: randomString(),
          description: randomString(),
          includeLocation: false,
          location: 'Some location',
          startDate: moment().add(1, 'day').toDate(),
          endDate: moment().add(2, 'days').toDate(),
        });
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
    });

    it('does not show participation or event CTAs', () => {
      cy.visit(`/en/projects/${projectSlug}`);

      // The events section still shows the upcoming event
      cy.get('#e2e-events-section-project-page');

      cy.get('#e2e-ideation-cta-button').should('not.exist');
      cy.get('.e2e-idea-button').should('not.exist');
      cy.get('#e2e-cta-bar-see-events').should('not.exist');
    });
  });
});
