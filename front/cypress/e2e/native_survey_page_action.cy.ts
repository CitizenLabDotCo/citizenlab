import { randomEmail, randomString } from '../support/commands';

describe('Native survey project page actions', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  const userFirstName = randomString(10);
  const userLastName = randomString(10);
  const userPassword = randomString(10);
  const userEmail = randomEmail();
  let projectIdContinuous: string;
  let projectSlugContinous: string;
  let projectIdArchived: string;
  let projectSlugArchived: string;
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

    // create some users
    cy.apiSignup(userFirstName, userLastName, userEmail, userPassword).then(
      (response) => {
        userId = response.body.data.id;
      }
    );
  });

  it('tests actions when continuous survey project is active and accepting submissions', () => {
    // Unregistered user
    cy.logout();
    cy.visit(`/projects/${projectSlugContinous}`);
    cy.contains('Take the survey').click();
    cy.contains('Please log in').should('exist');

    // Regular user
    cy.setLoginCookie(userEmail, userPassword);
    cy.visit(`/projects/${projectSlugContinous}`);
    cy.contains('Take the survey').click();
    cy.url().should('include', `/projects/${projectSlugContinous}/ideas/new`);

    // Admin user
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlugContinous}`);
    cy.contains('Take the survey').click();
    cy.url().should('include', `/projects/${projectSlugContinous}/ideas/new`);
  });

  it('tests actions when project is archived', () => {
    cy.setLoginCookie(userEmail, userPassword);
    cy.visit(`/projects/${projectSlugArchived}`);
    cy.contains(
      "Unfortunately, you can't participate in this project anymore because it has been archived"
    );
    cy.contains('Take the survey').should('not.exist');
    cy.contains('1 survey').should('not.exist');
  });

  it('tests actions when survey is not accepting submissions', () => {
    cy.setAdminLoginCookie();
    cy.visit(`admin/projects/${projectIdContinuous}`);
    cy.contains('Submitting posts').within(() => {
      cy.get('[type="checkbox"]').check();
    });
    cy.contains('Save').click();
  });

  it('tests actions when survey phase is not active', () => {
    // temp
  });

  after(() => {
    cy.apiRemoveProject(projectIdContinuous);
    cy.apiRemoveProject(projectIdArchived);
    cy.apiRemoveUser(userId);
  });
});
