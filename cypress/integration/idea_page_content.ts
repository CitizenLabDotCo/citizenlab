import { randomString } from '../support/commands';

describe('Idea Page', () => {
  describe('Various Idea Page Components', () => {
    before(() => {
      cy.setAdminLoginCookie();
      cy.visit('/ideas/controversial-idea');
      cy.get('#e2e-idea-show');
    });

    it('shows the correct content', () => {
      // shows the page container
      cy.get('#e2e-idea-show');

      // shows the page content container
      cy.get('#e2e-idea-show-page-content');

      // shows the home page link with correct href
      cy.get('#e2e-home-page-link')
        .should('have.attr', 'href')
        .and('include', '/en-GB/');

      // shows the link to the project page with correct href
      cy.get('#e2e-idea-other-link')
        .should('have.attr', 'href')
        .and('include', '/en-GB/projects/an-idea-bring-it-to-your-council');

      // shows the idea Title
      cy.get('#e2e-idea-title');

      // shows the idea Image
      cy.get('#e2e-idea-image');

      // shows the idea body
      cy.get('#e2e-idea-description');

      // shows a link to author profile
      cy.get('.e2e-idea-author .e2e-author-link')
        .should('have.attr', 'href')
        .and('include', '/en-GB/profile/casey-luettgen');

      // shows the comments content correctly
      cy.get('.e2e-comments-container').contains(
        "Great idea, we stand behind you! I'll come riding a bicycle"
      );
      cy.get('.e2e-comments-container').contains('No no no no no');

      // shows the idea content footer'
      cy.get('#e2e-idea-content-footer');

      // has the More Options menu and opens it
      cy.get('#e2e-idea-more-actions').click();
      cy.get('.e2e-more-actions-list');
    });
  });

  describe('Idea Map', () => {
    let projectId: string = null as any;
    let ideaId: string = null as any;
    const projectTitle = randomString();
    const projectDescriptionPreview = randomString();
    const projectDescription = randomString();
    const ideaTitle = randomString();
    const ideaContent = randomString();
    const locationGeoJSON = {
      type: 'Point',
      coordinates: [4.351710300000036, 50.8503396],
    };
    const locationDescription = 'Brussel, België';

    before(() => {
      cy.apiCreateProject({
        type: 'continuous',
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        participationMethod: 'ideation',
      })
        .then((project) => {
          projectId = project.body.data.id;
          return cy.apiCreateIdea(
            projectId,
            ideaTitle,
            ideaContent,
            locationGeoJSON,
            locationDescription
          );
        })
        .then((idea) => {
          ideaId = idea.body.data.id;
          cy.visit(`/ideas/${ideaTitle}`);
          cy.get('#e2e-idea-show-page-content');
          cy.wait(1000);
        });
    });

    it('shows the idea map component', () => {
      cy.get('#e2e-map-toggle').click();
      cy.get('#e2e-map');
    });

    after(() => {
      cy.apiRemoveIdea(ideaId);
      cy.apiRemoveProject(projectId);
    });
  });

  describe('Idea Status', () => {
    let projectId: string = null as any;
    let ideaId: string = null as any;
    const projectTitle = randomString();
    const projectDescriptionPreview = randomString();
    const projectDescription = randomString();
    const ideaTitle = randomString();
    const ideaContent = randomString();

    before(() => {
      cy.apiCreateProject({
        type: 'continuous',
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        participationMethod: 'ideation',
      })
        .then((project) => {
          projectId = project.body.data.id;
          return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
        })
        .then((idea) => {
          ideaId = idea.body.data.id;
          cy.visit(`/ideas/${ideaTitle}`);
          cy.get('#e2e-idea-show-page-content');
          cy.wait(1000);
        });
    });

    it('has a correct initial idea status', () => {
      cy.get('#e2e-idea-status-badge').contains('proposed');
    });

    after(() => {
      cy.apiRemoveIdea(ideaId);
      cy.apiRemoveProject(projectId);
    });
  });

  describe('Idea with location inside of a project with location enabled', () => {
    const projectTitle = randomString();
    let projectId: string;
    const ideaTitle = randomString();
    const ideaContent = randomString();
    const locationGeoJSON = {
      type: 'Point',
      coordinates: [4.351710300000036, 50.8503396],
    };
    const locationDescription = 'Brussel, België';
    let ideaId: string;

    before(() => {
      const projectDescriptionPreview = randomString();
      const projectDescription = randomString();

      cy.apiCreateProject({
        type: 'continuous',
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        participationMethod: 'ideation',
      })
        .then((project) => {
          projectId = project.body.data.id;
          return cy.apiCreateIdea(
            projectId,
            ideaTitle,
            ideaContent,
            locationGeoJSON,
            locationDescription
          );
        })
        .then((idea) => {
          ideaId = idea.body.data.id;
        });
    });

    it('displays the location dropdown on the idea page', () => {
      cy.visit(`/ideas/${ideaTitle}`);
      cy.get('#e2e-idea-show-page-content');
      cy.get('#e2e-map-toggle').should('exist');
    });

    after(() => {
      cy.apiRemoveIdea(ideaId);
      cy.apiRemoveProject(projectId);
    });
  });
});
