import moment = require('moment');
import { randomEmail, randomString } from '../support/commands';

describe('Native survey project page actions', () => {
  const userFirstName = randomString(10);
  const userLastName = randomString(10);
  const userPassword = randomString(10);
  const userEmail = randomEmail();
  const inTwoDays = moment().add(2, 'days').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');
  const phaseFutureTitle = 'Future survey phase';
  let userId: string;

  before(() => {
    // create a regular user
    cy.apiSignup(userFirstName, userLastName, userEmail, userPassword).then(
      (response) => {
        userId = (response as any).body.data.id;
      }
    );
  });

  describe('with project with 1 open ended survey phase active', () => {
    let projectIdWithOneOpenEndedPhase: string;
    let projectSlugWithOneOpenEndedPhase: string;
    let phaseId: string;

    beforeEach(() => {
      if (projectIdWithOneOpenEndedPhase) {
        cy.apiRemoveProject(projectIdWithOneOpenEndedPhase);
        projectIdWithOneOpenEndedPhase = '';
      }

      // Create active project with one open ended phase
      cy.createProjectWithNativeSurveyPhase().then((result) => {
        projectIdWithOneOpenEndedPhase = result.projectId;
        projectSlugWithOneOpenEndedPhase = result.projectSlug;
        phaseId = result.phaseId;
      });
    });

    afterEach(() => {
      if (projectIdWithOneOpenEndedPhase) {
        cy.apiRemoveProject(projectIdWithOneOpenEndedPhase);
        projectIdWithOneOpenEndedPhase = '';
      }
    });

    it('tests actions when accepting submissions', () => {
      // Action as unregistered user
      cy.visit(`/projects/${projectSlugWithOneOpenEndedPhase}`);
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });
      cy.get('#e2e-authentication-modal').should('exist');

      // Action as registered user
      cy.setLoginCookie(userEmail, userPassword);
      cy.visit(`/projects/${projectSlugWithOneOpenEndedPhase}`);
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });
      cy.url().should(
        'include',
        `/projects/${projectSlugWithOneOpenEndedPhase}/surveys/new`
      );

      // Action as admin user
      cy.setAdminLoginCookie();
      cy.visit(`/projects/${projectSlugWithOneOpenEndedPhase}`);
      cy.get('.e2e-idea-button').first().find('div').should('be.visible');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });
      cy.url().should(
        'include',
        `/projects/${projectSlugWithOneOpenEndedPhase}/surveys/new`
      );
    });

    it('tests actions when unregistered users may submit survey responses', () => {
      // Login as admin
      cy.setAdminLoginCookie();
      // Visit admin phase permissions page
      cy.visit(
        `admin/projects/${projectIdWithOneOpenEndedPhase}/phases/${phaseId}/access-rights`
      );

      // Select that unregistered users may submit surveys
      cy.get('.e2e-action-accordion-posting_idea').click();
      cy.get('.e2e-action-form-posting_idea').within(() => {
        cy.contains('Anyone').should('be.visible');
        cy.contains('Anyone').click({ force: true });
      });
      // Logout
      cy.clearCookies();
      // Visit the project page
      cy.visit(`/projects/${projectSlugWithOneOpenEndedPhase}`);
      // Check that correct text and actions shown
      cy.wait(3000); // I think the content build error is causing some flaky behaviour. This wait seems to fix it.
      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click();
      cy.url().should(
        'include',
        `/projects/${projectSlugWithOneOpenEndedPhase}/surveys/new`
      );
    });
  });

  describe('archived project', () => {
    let projectIdArchived: string;
    let projectSlugArchived: string;

    beforeEach(() => {
      if (projectIdArchived) {
        cy.apiRemoveProject(projectIdArchived);
        projectIdArchived = '';
      }

      // Create archived project
      cy.createProjectWithNativeSurveyPhase({
        publicationStatus: 'archived',
        canPost: false,
      }).then((result) => {
        projectIdArchived = result.projectId;
        projectSlugArchived = result.projectSlug;
      });
    });

    afterEach(() => {
      if (projectIdArchived) {
        cy.apiRemoveProject(projectIdArchived);
        projectIdArchived = '';
      }
    });

    it('tests actions when project is archived', () => {
      // Login
      cy.setLoginCookie(userEmail, userPassword);
      // Visit Archived project
      cy.visit(`/projects/${projectSlugArchived}`);
      // Check that correct text and actions shown
      cy.contains(
        "Unfortunately, you can't participate in this project anymore because it has been archived"
      );
      cy.get('.e2e-idea-button').should('not.exist');
    });
  });

  describe('Project with future survey phase', () => {
    let projectIdWithFutureSurvey: string;
    let projectSlugWithFutureSurvey: string;
    beforeEach(() => {
      if (projectIdWithFutureSurvey) {
        cy.apiRemoveProject(projectIdWithFutureSurvey);
        projectIdWithFutureSurvey = '';
      }

      // Create timeline project with future native survey phase
      cy.createProjectWithNativeSurveyPhase({
        phaseStartAt: inTwoDays,
        phaseEndAt: inTwoMonths,
        phaseTitle: 'Future ',
        description: `description ${phaseFutureTitle}`,
      }).then((result) => {
        projectIdWithFutureSurvey = result.projectId;
        projectSlugWithFutureSurvey = result.projectSlug;
      });
    });

    afterEach(() => {
      if (projectIdWithFutureSurvey) {
        cy.apiRemoveProject(projectIdWithFutureSurvey);
        projectIdWithFutureSurvey = '';
      }
    });

    it('tests actions when survey phase is not active', () => {
      // Login
      cy.setLoginCookie(userEmail, userPassword);
      // Visit timeline project
      cy.visit(`/projects/${projectSlugWithFutureSurvey}`);
      // Check that correct text and actions shown
      cy.get('.e2e-idea-button')
        .first()
        .find('div')
        .first()
        .should('be.visible')
        .trigger('mouseenter');
      cy.contains('New submissions can only be added in active phases.').should(
        'exist'
      );
    });
  });

  describe('with project with active survey that has post set to false', () => {
    let projectIdWithPostingDisabled: string;
    let projectSlugPostingDisabled: string;
    beforeEach(() => {
      if (projectIdWithPostingDisabled) {
        cy.apiRemoveProject(projectIdWithPostingDisabled);
        projectIdWithPostingDisabled = '';
      }

      // Create native survey phase with posting disabled
      cy.createProjectWithNativeSurveyPhase({
        canPost: false,
      }).then((result) => {
        projectIdWithPostingDisabled = result.projectId;
        projectSlugPostingDisabled = result.projectSlug;
      });
    });

    afterEach(() => {
      if (projectIdWithPostingDisabled) {
        cy.apiRemoveProject(projectIdWithPostingDisabled);
        projectIdWithPostingDisabled = '';
      }
    });

    // TODO: Look into message shown for this scenario
    it('tests actions when survey is not accepting submissions', () => {
      // Login as regular user
      cy.setLoginCookie(userEmail, userPassword);
      // Visit timeline project
      cy.visit(`/projects/${projectSlugPostingDisabled}`);
      // Check that correct text and actions shown
      cy.get('.e2e-idea-button')
        .first()
        .find('div')
        .should('be.visible')
        .trigger('mouseenter');
      cy.contains('New submissions are not currently being accepted').should(
        'exist'
      );
    });
  });

  after(() => {
    cy.apiRemoveUser(userId);
  });
});
