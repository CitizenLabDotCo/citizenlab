import { randomString, randomEmail } from '../support/commands';

describe('Existing continuous ideation project', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);
    cy.apiLogin(email, password);
    cy.visit('/projects/an-idea-bring-it-to-your-council');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-header-image');
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-participants-count');
    cy.get('#e2e-project-sidebar-ideas-count');
    cy.get('#e2e-project-sidebar-share-button');
    cy.get('#e2e-project-see-ideas-button');
    cy.get('#project-ideabutton');
    cy.get('#e2e-project-description-read-more-button');
  });

  it('shows the post-your-idea button', () => {
    cy.get('#project-ideabutton');
  });

  it('shows the idea cards', () => {
    cy.get('#e2e-continuos-project-idea-cards');
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card');
  });

  it('asks unauthorised users to log in or sign up before they vote', () => {
    cy.get('#e2e-ideas-container')
      .find('.e2e-idea-card')
      .first()
      .find('.upvote.enabled')
      .click();
    cy.get('#e2e-sign-up-in-modal');
    cy.get('.e2e-modal-close-button').click();
  });

  it('takes you to the idea page when clicking an idea card', () => {
    cy.get('#e2e-ideas-container')
      .find('.e2e-idea-card')
      .first()
      .as('ideaCard');
    cy.get('@ideaCard').then(($a) => {
      const href = $a.prop('href');
      cy.get('@ideaCard').click();
      cy.url().should('eq', href);
    });
  });

  it('redirects to the idea creation form when pressing the post-your-idea button when logged in', () => {
    cy.setLoginCookie(email, password);
    cy.visit('/projects/an-idea-bring-it-to-your-council');
    cy.get('#project-ideabutton').click();
    cy.get('#idea-form');
  });
});

describe('Existing timeline project with ended ideation phase', () => {
  before(() => {
    cy.visit('/projects/timeline-ideation-card');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-participants-count');
    cy.get('#e2e-project-sidebar-phases-count');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the idea cards', () => {
    cy.get('.e2e-timeline-project-idea-cards');
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card');
  });
});

describe('New timeline project with active ideation phase', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);
  let projectId: string;
  let ideaId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password)
      .then(() => {
        cy.apiLogin(email, password);
      })
      .then(() => {
        return cy.apiCreateProject({
          type: 'timeline',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'published',
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase(
          projectId,
          'phaseTitle',
          '2018-03-01',
          '2025-01-01',
          'ideation',
          true,
          true,
          true
        );
      })
      .then(() => {
        return cy.apiCreatePhase(
          projectId,
          'phaseTitle',
          '2025-01-02',
          '2025-01-25',
          'ideation',
          true,
          true,
          true
        );
      })
      .then(() => {
        return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
      })
      .then((idea) => {
        ideaId = idea.body.data.id;
        cy.visit(`/projects/${projectTitle}`);
      });
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-phases-count');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the see-the-ideas button', () => {
    cy.get('#e2e-project-see-ideas-button');
  });

  it('shows the post-your-idea button and authentication modal when you click on it', () => {
    cy.get('#project-ideabutton').click();
    cy.get('#e2e-sign-up-in-modal');
    cy.get('#e2e-sign-up-container');
    cy.get('.e2e-modal-close-button').click();
  });

  it('shows the idea cards', () => {
    cy.get('.e2e-timeline-project-idea-cards');
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card');
  });

  it('redirects to the idea creation form when pressing the post-your-idea button when logged in', () => {
    cy.setLoginCookie(email, password);
    cy.visit(`/projects/${projectTitle}`);
    cy.get('#project-ideabutton').click();
    cy.get('#idea-form');
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveProject(projectId);
  });
});
