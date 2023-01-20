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
      cy.apiCreatePhase(
        projectIdTimeline,
        'Future ',
        inTwoDays,
        inTwoMonths,
        'native_survey',
        true,
        true,
        true,
        `description ${phaseFutureTitle}`
      );
    });

    // create a regular user
    cy.apiSignup(userFirstName, userLastName, userEmail, userPassword).then(
      (response) => {
        userId = response.body.data.id;
      }
    );
  });

  it('tests actions when continuous survey project is active and accepting submissions', () => {
    // Action as unregistered user
    cy.visit(`/projects/${projectSlugContinous}`);
    cy.get('#e2e-cta-button').find('button').click({ force: true });
    cy.get('#e2e-sign-up-in-modal').should('exist');

    // Action as registered user
    cy.setLoginCookie(userEmail, userPassword);
    cy.visit(`/projects/${projectSlugContinous}`);
    cy.get('#e2e-cta-button').find('button').click({ force: true });
    cy.url().should('include', `/projects/${projectSlugContinous}/ideas/new`);

    // Action as admin user
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlugContinous}`);
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
    cy.get('#e2e-cta-button').find('button').click({ force: true });
    cy.contains('New submissions can only be added in active phases.').should(
      'exist'
    );
  });

  it('tests actions when survey is not accepting submissions', () => {
    // Login as admin
    cy.setAdminLoginCookie();
    // Visit admin project settings
    cy.visit(`admin/projects/${projectIdContinuous}/native-survey`);
    // Disable accepting submissions
    cy.get('[type="checkbox"]').check();
    // Login as regular user
    cy.setLoginCookie(userEmail, userPassword);
    // Visit timeline projecte2e-submit-parentcomment
    cy.visit(`/projects/${projectSlugTimeline}`);
    // Check that correct text and actions shown
    cy.get('#e2e-cta-button').find('button').click({ force: true });
    cy.contains('New submissions can only be added in active phases.').should(
      'exist'
    );
  });

  it('tests actions when unregistered users may submit survey responses', () => {
    // Login as admin
    cy.setAdminLoginCookie();
    // Visit admin project permissions page
    cy.visit(`admin/projects/${projectIdContinuous}/permissions`);

    // Logout
    cy.clearCookies();
    // Visit the project page
    cy.visit(`/projects/${projectSlugContinous}`);
    // Check that correct text and actions shown
    cy.get('#e2e-cta-button').should('be.visible');
  });

  after(() => {
    cy.apiRemoveProject(projectIdContinuous);
    cy.apiRemoveProject(projectIdArchived);
    cy.apiRemoveUser(userId);
  });
});
