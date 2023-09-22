import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

// describe('Existing continuous ideation project', () => {
//   const firstName = randomString();
//   const lastName = randomString();
//   const email = randomEmail();
//   const password = randomString();

//   before(() => {
//     cy.apiSignup(firstName, lastName, email, password);
//     cy.apiLogin(email, password);
//     cy.visit('/projects/an-idea-bring-it-to-your-council');
//     cy.get('#e2e-project-page');
//     cy.wait(1000);
//   });

//   it('shows the correct project header', () => {
//     cy.get('#e2e-project-header-image');
//     cy.get('#e2e-project-description');
//     cy.get('#e2e-project-sidebar');
//     cy.get('#e2e-project-sidebar-participants-count');
//     cy.get('#e2e-project-sidebar-ideas-count');
//     cy.get('#e2e-project-sidebar-share-button');
//     cy.get('#e2e-project-see-ideas-button');
//     cy.get('#project-ideabutton');
//     cy.get('#e2e-project-description-read-more-button');
//   });

//   it('shows the post-your-idea button', () => {
//     cy.get('#project-ideabutton');
//   });

//   it('shows the idea cards', () => {
//     cy.get('#e2e-continuous-project-idea-cards');
//     cy.get('#e2e-ideas-list');
//     cy.get('.e2e-idea-card');
//   });

//   it('shows the current sorting options', () => {
//     cy.get('.e2e-filter-selector-button').first().click();
//     cy.get('#e2e-item-random').should('exist');
//     cy.get('#e2e-item-new').should('exist');
//     cy.get('#e2e-item--new').should('exist');
//     cy.get('#e2e-item-trending').should('exist');
//     cy.get('#e2e-item-popular').should('exist');
//   });

//   it('asks unauthorised users to log in or sign up before they reaction', () => {
//     cy.clearCookies();
//     cy.get('#e2e-ideas-container')
//       .find('.e2e-idea-card')
//       .first()
//       .find('.e2e-ideacard-like-button')
//       .click();
//     cy.get('#e2e-authentication-modal').should('exist');
//     cy.get('.e2e-modal-close-button').click();
//   });

//   it('takes you to the idea page when clicking an idea card', () => {
//     cy.get('#e2e-ideas-container')
//       .find('.e2e-idea-card')
//       .first()
//       .as('ideaCard');
//     cy.get('@ideaCard').then(($a) => {
//       const href = $a.prop('href');
//       cy.get('@ideaCard').click();
//       cy.url().should('eq', href);
//     });
//   });

//   it('redirects to the idea creation form when pressing the post-your-idea button when logged in', () => {
//     cy.setLoginCookie(email, password);
//     cy.visit('/projects/an-idea-bring-it-to-your-council');
//     cy.get('#project-ideabutton').should('be.visible');
//     cy.get('#project-ideabutton').click();
//     cy.wait(4000);
//     cy.get('#idea-form');
//   });
// });

// describe('Existing timeline project with ended ideation phase', () => {
//   before(() => {
//     cy.visit('/projects/timeline-ideation-card');
//     cy.get('#e2e-project-page');
//     cy.wait(1000);
//   });

//   it('shows the correct project header', () => {
//     cy.get('#e2e-project-description');
//     cy.get('#e2e-project-sidebar');
//     cy.get('#e2e-project-sidebar-participants-count');
//     cy.get('#e2e-project-sidebar-phases-count');
//     cy.get('#e2e-project-sidebar-share-button');
//   });

//   it('shows the idea cards', () => {
//     cy.get('.e2e-timeline-project-idea-cards');
//     cy.get('#e2e-ideas-list');
//     cy.get('.e2e-idea-card');
//   });
// });

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

        cy.apiCreateEvent({
          projectId,
          title: 'Event title',
          location: 'Event location',
          includeLocation: true,
          description: 'Event description',
          startDate: moment().subtract(1, 'day').toDate(),
          endDate: moment().add(1, 'day').toDate(),
        });

        return cy.apiCreatePhase({
          projectId,
          title: 'phaseTitle',
          startAt: '2018-03-01',
          endAt: '2025-01-01',
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
        });
      })
      .then(() => {
        return cy.apiCreatePhase({
          projectId,
          title: 'phaseTitle',
          startAt: '2025-01-02',
          endAt: '2025-01-25',
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
        });
      })
      .then(() => {
        return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
      })
      .then((idea) => {
        ideaId = idea.body.data.id;
        cy.visit(`/projects/${projectTitle}`);
        cy.clearCookies();
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

    // Does not show an event CTA if "see idea" button is present
    cy.get('#e2e-project-see-events-button').should('not.exist');
  });

  it('shows the post-your-idea button and authentication modal when you click on it', () => {
    cy.get('#project-ideabutton').should('be.visible');
    cy.get('#project-ideabutton').click();
    cy.get('#e2e-authentication-modal');
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
    cy.acceptCookies();
    cy.get('#project-ideabutton').should('be.visible');
    cy.get('#project-ideabutton').click();
    cy.wait(4000);
    cy.get('#idea-form');
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveProject(projectId);
  });
});

describe('Archived timeline project with ideation phase', () => {
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
          publicationStatus: 'draft',
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: 'phaseTitle',
          startAt: '2018-03-01',
          endAt: '2025-01-01',
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
        });
      })
      .then(() => {
        return cy.apiCreatePhase({
          projectId,
          title: 'phaseTitle',
          startAt: '2025-01-02',
          endAt: '2025-01-25',
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
        });
      })
      .then(() => {
        return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
      })
      .then((idea) => {
        ideaId = idea.body.data.id;
        cy.setAdminLoginCookie();
        cy.visit(`/projects/${projectTitle}`);
      })
      .then(() => {
        return cy.apiEditProject({
          projectId,
          publicationStatus: 'archived',
        });
      });
  });

  it('shows the see-the-ideas button', () => {
    cy.get('#e2e-project-see-ideas-button');
  });

  it('does not show the post-your-idea button', () => {
    cy.contains('Add your idea').should('not.exist');
  });

  it('shows the idea cards', () => {
    cy.get('.e2e-timeline-project-idea-cards');
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card');
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveProject(projectId);
  });
});

describe('timeline project with no active ideation phase', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;

  before(() => {
    return cy
      .apiCreateProject({
        type: 'timeline',
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: randomString(),
        publicationStatus: 'draft',
      })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: 'phaseTitle',
          startAt: '2018-03-01',
          endAt: '2019-01-01',
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
        });
      })
      .then(() => {
        cy.setAdminLoginCookie();
        cy.visit(`/projects/${projectTitle}`);
      });
  });

  it('allows admin users to add an idea via the map for a non-active phase', () => {
    // Select map view
    cy.get('#view-tab-2').click();
    // Click map to open popup
    cy.get('.leaflet-map-pane').click('bottom', { force: true });
    // Add idea button should appear, click it
    cy.get('.leaflet-popup-content').within(() => {
      cy.get('#e2e-cta-button').get('button').click({ force: true });
    });
    // Shold redirect to new idea page with phase id in URL
    cy.url().should('include', `/projects/${projectTitle}/ideas/new`);
    cy.url().should('include', 'phase_id');
    // Confirm that idea form is shown
    cy.get('#idea-form').should('exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Ideation CTA bar', () => {
  let projectId: string;
  let projectSlug: string;
  let postingRestrictedProjectId: string;
  let postingRestrictedProjectSlug: string;
  const projectTitle = randomString();
  const description = randomString();
  let ideaIdOne: string;
  let ideaIdTwo: string;
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);

  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password)
      .then(() => {
        cy.apiLogin(email, password);
      })
      .then(() => {
        cy.apiCreateProject({
          type: 'continuous',
          title: projectTitle,
          descriptionPreview: description,
          description,
          publicationStatus: 'published',
          participationMethod: 'ideation',
          votingMaxTotal: 100,
        })
          .then((project) => {
            projectId = project.body.data.id;
            projectSlug = project.body.data.attributes.slug;
          })
          .then(() => {
            return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
          })
          .then((idea) => {
            ideaIdOne = idea.body.data.id;
          })
          .then(() => {
            return cy.apiCreateProject({
              type: 'continuous',
              title: projectTitle,
              descriptionPreview: description,
              description,
              publicationStatus: 'published',
              participationMethod: 'ideation',
              votingMaxTotal: 100,
              postingEnabled: false,
            });
          })
          .then((restrictedProject) => {
            postingRestrictedProjectId = restrictedProject.body.data.id;
            postingRestrictedProjectSlug =
              restrictedProject.body.data.attributes.slug;
          })
          .then(() => {
            return cy.apiCreateIdea(
              postingRestrictedProjectId,
              ideaTitle,
              ideaContent
            );
          })
          .then((idea) => {
            ideaIdTwo = idea.body.data.id;
          });
      });
  });

  after(() => {
    cy.apiRemoveIdea(ideaIdOne);
    cy.apiRemoveProject(projectId);
    cy.apiRemoveIdea(ideaIdTwo);
    cy.apiRemoveProject(postingRestrictedProjectId);
  });

  it('shows the CTA to the user to submit their idea when the user has not yet participated', () => {
    cy.visit(`/en/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('#e2e-ideation-cta-button').should('exist');
  });

  it('shows the see ideas button to the user if posting is not enabled', () => {
    cy.visit(`/en/projects/${postingRestrictedProjectSlug}`);
    cy.acceptCookies();
    cy.get('#e2e-ideation-see-ideas-button').should('exist');
  });
});
