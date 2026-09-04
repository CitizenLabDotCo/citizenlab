import { randomString, randomEmail } from '../../../support/commands';

const email = randomEmail();
const password = randomString();
const projectTitle = randomString();
const projectDescriptionPreview = randomString(30);
let projectId: string;
let userId: string;

describe('Admin project approval flow', () => {
  before(() => {
    if (projectId && userId) {
      cy.apiRemoveProject(projectId);
    }

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      publicationStatus: 'draft',
    }).then((project) => {
      projectId = project.body.data.id;
      cy.apiCreateModeratorForProject({
        firstName: 'John',
        lastName: 'Doe',
        email,
        password,
        projectId,
      }).then((moderator) => {
        userId = moderator.body.data.id;
      });
    });
  });

  after(() => {
    if (projectId && userId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('should be possible for a project moderator to request approval for a project', () => {
    cy.setLoginCookie(email, password);

    cy.intercept('GET', `**/projects/${projectId}/review`).as('getReview');
    cy.intercept('GET', `**/projects/${projectId}/phases`).as('getPhases');

    cy.visit(`admin/projects/${projectId}`);

    cy.location('pathname').should(
      'include',
      `/admin/projects/${projectId}/project-page`
    );
    cy.wait(['@getReview', '@getPhases']);

    cy.dataCy('e2e-request-approval')
      .should('be.visible')
      .and('not.have.class', 'processing')
      .click();

    cy.get('#e2e-request-approval-confirm').click(); // prob
    cy.dataCy('e2e-request-approval').should('not.exist');
    cy.dataCy('e2e-request-approval-pending').should('exist');
    cy.get('#e2e-publish').should('not.exist');
  });

  it('should be possible for an admin to approve a project', () => {
    cy.setLoginCookie('admin@govocal.com', 'democracy2.0');
    cy.visit(`admin/projects/${projectId}`);
    cy.get('#e2e-approve-project').click();
    cy.get('#e2e-approve-project').should('not.exist');
    cy.get('#e2e-publish').should('exist');
  });

  it('should be possible for a project moderator to publish an approved project', () => {
    cy.setLoginCookie(email, password);
    cy.visit(`admin/projects/${projectId}`);

    // Publishing now goes through the Schedule Launch modal: open it,
    // toggle to "Now" mode, then submit.
    cy.get('#e2e-publish').click();
    cy.dataCy('e2e-mode-toggle-now').click();
    cy.get('#e2e-schedule-launch-submit').click();

    // Once published, the entry button reflects the Published status.
    cy.get('#e2e-publish').should('contain', 'Published');
  });
});

describe('Admin publishing a project without approving it first', () => {
  const managerPassword = randomString();

  describe('when the project manager has requested approval', () => {
    const managerEmail = randomEmail();
    let projectId: string;
    let userId: string;

    before(() => {
      cy.apiCreateProject({
        title: randomString(),
        description: randomString(30),
        publicationStatus: 'draft',
      }).then((project) => {
        projectId = project.body.data.id;

        cy.apiCreateModeratorForProject({
          firstName: 'Jane',
          lastName: 'Doe',
          email: managerEmail,
          password: managerPassword,
          projectId,
        }).then((moderator) => {
          userId = moderator.body.data.id;

          // The manager requests approval, so the project has a pending review.
          cy.apiRequestProjectReview(projectId, managerEmail, managerPassword);
        });
      });
    });

    after(() => {
      if (projectId && userId) {
        cy.apiRemoveProject(projectId);
        cy.apiRemoveUser(userId);
      }
    });

    it('shows the Published button to the project manager', () => {
      // The admin publishes the project without approving the pending review first.
      cy.apiEditProject({ projectId, publicationStatus: 'published' });

      cy.setLoginCookie(managerEmail, managerPassword);

      cy.intercept('GET', `**/projects/${projectId}/review`).as('getReview');
      cy.intercept('GET', `**/projects/${projectId}/phases`).as('getPhases');

      cy.visit(`admin/projects/${projectId}`);
      cy.wait(['@getReview', '@getPhases']);

      cy.get('#e2e-publish')
        .should('be.visible')
        .and('contain', 'Published')
        .and('not.be.disabled');
      cy.dataCy('e2e-request-approval-pending').should('not.exist');
      cy.dataCy('e2e-request-approval').should('not.exist');
    });
  });

  describe('when the project manager has not requested approval', () => {
    const managerEmail = randomEmail();
    let projectId: string;
    let userId: string;

    before(() => {
      cy.apiCreateProject({
        title: randomString(),
        description: randomString(30),
        publicationStatus: 'draft',
      }).then((project) => {
        projectId = project.body.data.id;

        cy.apiCreateModeratorForProject({
          firstName: 'Jack',
          lastName: 'Doe',
          email: managerEmail,
          password: managerPassword,
          projectId,
        }).then((moderator) => {
          userId = moderator.body.data.id;
        });
      });
    });

    after(() => {
      if (projectId && userId) {
        cy.apiRemoveProject(projectId);
        cy.apiRemoveUser(userId);
      }
    });

    it('shows the Published button to the project manager', () => {
      // The admin publishes the project, which was never submitted for review.
      cy.apiEditProject({ projectId, publicationStatus: 'published' });

      cy.setLoginCookie(managerEmail, managerPassword);

      cy.intercept('GET', `**/projects/${projectId}/review`).as('getReview');
      cy.intercept('GET', `**/projects/${projectId}/phases`).as('getPhases');

      cy.visit(`admin/projects/${projectId}`);
      cy.wait(['@getReview', '@getPhases']);

      cy.get('#e2e-publish')
        .should('be.visible')
        .and('contain', 'Published')
        .and('not.be.disabled');
      cy.dataCy('e2e-request-approval').should('not.exist');
      cy.dataCy('e2e-request-approval-pending').should('not.exist');
    });
  });
});
