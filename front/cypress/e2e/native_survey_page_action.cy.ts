import moment = require('moment');
import { randomEmail, randomString } from '../support/commands';

describe('Native survey project page actions', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  const userFirstName = randomString(10);
  const userLastName = randomString(10);
  const userPassword = randomString(10);
  const userEmail = randomEmail();
  const inTwoDays = moment().add(2, 'days').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');
  const phaseFutureTitle = 'Future survey phase';
  let projectIdContinuous: string;
  let projectSlugContinous: string;
  let projectSlugPostingDisabled: string;
  let projectIdArchived: string;
  let projectSlugArchived: string;
  let projectIdTimeline: string;
  let projectSlugTimeline: string;
  let userId: string;

  before(() => {
    // Create active continuous project
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'native_survey',
    }).then((project) => {
      projectIdContinuous = project.body.data.id;
      projectSlugContinous = project.body.data.attributes.slug;
    });

    // Create active continuous project with posting disabled
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'native_survey',
      postingEnabled: false,
    }).then((project) => {
      projectSlugPostingDisabled = project.body.data.attributes.slug;
    });

    // Create archived continuous project
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'archived',
      participationMethod: 'native_survey',
    }).then((project) => {
      projectIdArchived = project.body.data.id;
      projectSlugArchived = project.body.data.attributes.slug;
    });

    // Create timeline project with no active phase
    cy.apiCreateProject({
      type: 'timeline',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectIdTimeline = project.body.data.id;
      projectSlugTimeline = project.body.data.attributes.slug;
      cy.apiCreatePhase({
        projectId: projectIdTimeline,
        title: 'Future ',
        startAt: inTwoDays,
        endAt: inTwoMonths,
        participationMethod: 'native_survey',
        canComment: true,
        canPost: true,
        canReact: true,
        description: `description ${phaseFutureTitle}`,
      });
    });

    // create a regular user
    cy.apiSignup(userFirstName, userLastName, userEmail, userPassword).then(
      (response) => {
        userId = (response as any).body.data.id;
      }
    );
  });

  it('tests actions when continuous survey project is active and accepting submissions', () => {
    // Action as unregistered user
    cy.visit(`/projects/${projectSlugContinous}`);
    cy.get('#e2e-cta-button').find('button').click({ force: true });
    cy.get('#e2e-authentication-modal').should('exist');

    // Action as registered user
    cy.setLoginCookie(userEmail, userPassword);
    cy.visit(`/projects/${projectSlugContinous}`);
    cy.get('#e2e-cta-button').find('button').click({ force: true });
    cy.url().should('include', `/projects/${projectSlugContinous}/ideas/new`);

    // Action as admin user
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlugContinous}`);
    cy.get('#e2e-cta-button').should('be.visible');
    cy.get('#e2e-cta-button').find('button').click({ force: true });
    cy.url().should('include', `/projects/${projectSlugContinous}/ideas/new`);
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
    cy.get('#e2e-cta-button').should('not.exist');
    cy.contains('1 survey').should('not.exist');
  });

  it('tests actions when survey phase is not active', () => {
    // Login
    cy.setLoginCookie(userEmail, userPassword);
    // Visit timeline project
    cy.visit(`/projects/${projectSlugTimeline}`);
    // Check that correct text and actions shown
    cy.get('#e2e-cta-button').should('be.visible').trigger('mouseenter');
    cy.contains('New submissions can only be added in active phases.').should(
      'exist'
    );
  });

  it('tests actions when survey is not accepting submissions', () => {
    // Login as regular user
    cy.setLoginCookie(userEmail, userPassword);
    // Visit timeline project
    cy.visit(`/projects/${projectSlugPostingDisabled}`);
    // Check that correct text and actions shown
    cy.get('#e2e-cta-button').should('be.visible').trigger('mouseenter');
    cy.contains('New submissions are not currently being accepted').should(
      'exist'
    );
  });

  it('tests actions when unregistered users may submit survey responses', () => {
    // Login as admin
    cy.setAdminLoginCookie();
    // Visit admin project permissions page
    cy.visit(`admin/projects/${projectIdContinuous}/permissions`);
    // Select that unregistered users may submit surveys
    cy.get('#e2e-granular-permissions').within(() => {
      cy.contains('Anyone').should('be.visible');
      cy.contains('Anyone').click({ force: true });
    });
    // Logout
    cy.clearCookies();
    // Visit the project page
    cy.visit(`/projects/${projectSlugContinous}`);
    // Check that correct text and actions shown
    cy.wait(3000); // I think the content build error is causing some flaky behaviour. This wait seems to fix it.
    cy.get('#e2e-idea-button').should('exist');
    cy.get('#e2e-idea-button').first().click();
    cy.url().should('include', `/projects/${projectSlugContinous}/ideas/new`);
  });

  after(() => {
    cy.apiRemoveProject(projectIdContinuous);
    cy.apiRemoveProject(projectIdArchived);
    cy.apiRemoveUser(userId);
  });
});
