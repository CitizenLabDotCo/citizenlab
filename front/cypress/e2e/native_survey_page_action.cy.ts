import { randomEmail, randomString } from '../support/commands';

describe('Native survey project page actions', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  const userFirstName = randomString(10);
  const userLastName = randomString(10);
  const userPassword = randomString(10);
  const userEmail = randomEmail();
  let projectId: string;
  let projectSlug: string;
  let userId: string;

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'native_survey',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });

    // create some users
    cy.apiSignup(userFirstName, userLastName, userEmail, userPassword).then(
      (response) => {
        userId = response.body.data.id;
      }
    );
  });

  it('visits the page as an unregistered user', () => {
    cy.logout();
  });

  it('visits the page as a logged in user', () => {
    cy.setLoginCookie(userEmail, userPassword);
    cy.visit(`/projects/${projectSlug}`);
    cy.wait(1000);
  });

  it('visits the page as an admin user', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
    cy.wait(1000);
  });

  it('visits the page when the survey is not accepting submissions', () => {
    // temp
  });

  it('visits the page when the survey phase is not active', () => {
    // temp
  });

  it('visits the page when the project is archived', () => {
    // temp
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(userId);
  });
});
