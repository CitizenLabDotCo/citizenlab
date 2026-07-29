import moment = require('moment');

import { randomString } from '../../support/commands';
import { clickExtraSurveyButton, createProjectWithExtraSurveys } from './utils';

describe('Project page participation box with extra surveys', () => {
  describe('with a primary method and one open extra survey', () => {
    let projectId = '';
    let projectSlug = '';
    let surveyPhaseId = '';

    before(() => {
      createProjectWithExtraSurveys({ surveys: [{}] }).then((result) => {
        projectId = result.projectId;
        projectSlug = result.projectSlug;
        surveyPhaseId = result.surveyPhaseIds[0];
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
    });

    it('shows the primary method CTA next to the extra survey button', () => {
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      cy.get('#project-ideabutton').should('exist');
      cy.get('#e2e-about-box .e2e-extra-survey-button')
        .should('have.length', 1)
        .and('contain', 'Take the survey');

      // Two open options only, so the box does not collapse
      cy.get('#e2e-about-box')
        .contains('button', 'Participate')
        .should('not.exist');
    });

    it('navigates to the extra survey form from the box', () => {
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      clickExtraSurveyButton();

      cy.url().should('include', `/projects/${projectSlug}/surveys/new`);
      cy.url().should('include', `phase_id=${surveyPhaseId}`);
    });
  });

  describe('with more than two open participation options', () => {
    let projectId = '';
    let projectSlug = '';

    before(() => {
      createProjectWithExtraSurveys({
        surveys: [
          {},
          {},
          {
            // An upcoming survey: only listed in the ways-to-participate modal
            startAt: moment().add(2, 'days').format('DD/MM/YYYY'),
            endAt: moment().add(2, 'month').format('DD/MM/YYYY'),
          },
        ],
      }).then((result) => {
        projectId = result.projectId;
        projectSlug = result.projectSlug;
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
    });

    it('collapses the box into a button that opens the ways-to-participate modal', () => {
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      // The individual CTAs are collapsed behind a single button
      cy.get('#e2e-about-box .e2e-extra-survey-button').should('not.exist');
      cy.get('#e2e-about-box #project-ideabutton').should('not.exist');
      cy.get('#e2e-about-box')
        .contains('button', 'Participate')
        .click({ force: true });

      cy.contains('Ways to participate').should('exist');
      cy.contains('3 open now').should('exist');
      cy.contains('4 in total').should('exist');

      cy.get('#e2e-modal-container').within(() => {
        cy.get('#project-ideabutton').should('exist');
        cy.get('.e2e-extra-survey-button').should('have.length', 3);
        // Two open surveys are actionable, the upcoming one is disabled
        cy.get('.e2e-extra-survey-button:contains("Take the survey")').should(
          'have.length',
          2
        );
        cy.get('.e2e-extra-survey-button:contains("Opens")')
          .should('have.length', 1)
          .find('button')
          .should('have.class', 'disabled');
      });
    });

    it('navigates to a survey from the ways-to-participate modal', () => {
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      cy.get('#e2e-about-box')
        .contains('button', 'Participate')
        .click({ force: true });

      cy.get(
        '#e2e-modal-container .e2e-extra-survey-button:contains("Take the survey")'
      )
        .first()
        .find('a, button')
        .first()
        .click({ force: true });

      cy.url().should('include', `/projects/${projectSlug}/surveys/new`);
      cy.url().should('include', 'phase_id=');
    });
  });

  describe('with a closed extra survey', () => {
    let projectId = '';
    let projectSlug = '';

    before(() => {
      createProjectWithExtraSurveys({
        surveys: [
          {
            startAt: moment().subtract(3, 'month').format('DD/MM/YYYY'),
            endAt: moment().subtract(1, 'month').format('DD/MM/YYYY'),
          },
        ],
      }).then((result) => {
        projectId = result.projectId;
        projectSlug = result.projectSlug;
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
    });

    it('does not surface the closed survey in the participation box', () => {
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();

      cy.get('#project-ideabutton').should('exist');
      cy.get('#e2e-about-box .e2e-extra-survey-button').should('not.exist');
    });
  });

  describe('hiding an extra survey via the participation box settings', () => {
    const surveyTitle = randomString();
    let projectId = '';
    let projectSlug = '';

    before(() => {
      createProjectWithExtraSurveys({ surveys: [{ title: surveyTitle }] }).then(
        (result) => {
          projectId = result.projectId;
          projectSlug = result.projectSlug;
        }
      );
    });

    beforeEach(() => {
      cy.setAdminLoginCookie();
    });

    after(() => {
      cy.apiRemoveProject(projectId);
    });

    it('removes the hidden survey CTA from the project page', () => {
      // The survey button is visible before hiding it
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();
      cy.get('#e2e-about-box .e2e-extra-survey-button').should('exist');

      // Uncheck the survey in the participation box settings
      cy.intercept('**/content_builder_layouts/project_page/upsert').as(
        'saveProjectPage'
      );
      cy.visit(`/admin/project-page-builder/projects/${projectId}`);
      cy.get('#e2e-about-box').click({ force: true });
      cy.contains(surveyTitle).click();
      cy.get('#e2e-content-builder-topbar-save').click();
      cy.wait('@saveProjectPage');

      // The primary CTA remains, the hidden survey is gone
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').scrollIntoView();
      cy.get('#project-ideabutton').should('exist');
      cy.get('#e2e-about-box .e2e-extra-survey-button').should('not.exist');
    });
  });
});
