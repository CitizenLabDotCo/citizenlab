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

      // shows the link to the project page with correct href
      cy.get('#e2e-go-back-link');

      // shows the idea Title
      cy.get('#e2e-idea-title');

      // shows the idea Image
      cy.get('#e2e-idea-image');

      // shows the idea body
      cy.get('#e2e-idea-description');

      // shows a link to author profile
      cy.get('.e2e-idea-author .e2e-author-link')
        .should('have.attr', 'href')
        .and('include', '/en/profile/casey-luettgen');

      // shows the comments content correctly
      cy.get('.e2e-comments-container').contains(
        "Great idea, we stand behind you! I'll come riding a bicycle"
      );
      cy.get('.e2e-comments-container').contains('No no no no no');

      // has the More Options menu and opens it
      cy.get('#e2e-idea-more-actions').click();
      cy.get('.e2e-more-actions-list');
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
          cy.get('#e2e-idea-show');
          cy.get('#e2e-idea-show-page-content');
        });
    });

    it('has a correct initial idea status', () => {
      cy.get('#e2e-idea-status-badge');
      cy.get('#e2e-idea-status-badge').contains('proposed');
    });

    after(() => {
      cy.apiRemoveIdea(ideaId);
      cy.apiRemoveProject(projectId);
    });
  });

  describe('Idea sharing modal', () => {
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
        });
    });

    it.skip('shows idea sharing modal if new idea', () => {
      cy.visit(
        `/ideas/${ideaTitle}?new_idea_id=7df35672-5b1b-442a-8e0a-8933e8dc47f2`
      );
      cy.get('#e2e-modal-container').should('exist');
      cy.get('.e2e-modal-close-button').click();
      cy.get('#e2e-modal-container').should('not.exist');
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
          cy.visit(`/ideas/${ideaTitle}`);
          cy.get('#e2e-idea-show');
          cy.get('#e2e-idea-show-page-content');
        });
    });

    it('displays the location on the idea page and the map pops up', () => {
      cy.get('#e2e-map-popup:visible').click();
      cy.get('.e2e-leafletmap');
    });

    after(() => {
      cy.apiRemoveIdea(ideaId);
      cy.apiRemoveProject(projectId);
    });
  });
});

describe('Idea location', () => {
  let projectId: string = null as any;
  let ideaNoLocationPointId: string = null as any;
  let ideaWithLocationPointId: string = null as any;
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();
  const ideaNoLocationPointTitle = randomString();
  const ideaWithLocationPointTitle = randomString();
  const ideaContent = randomString();
  const locationDescription = '43 Dummy Address';
  const locationGeojson = {
    type: 'Point',
    coordinates: [4.436279683196275, 50.87327010998867],
  };

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
          ideaNoLocationPointTitle,
          ideaContent,
          undefined,
          locationDescription
        );
      })
      .then((idea) => {
        ideaNoLocationPointId = idea.body.data.id;
        return cy.apiCreateIdea(
          projectId,
          ideaWithLocationPointTitle,
          ideaContent,
          locationGeojson,
          locationDescription
        );
      })
      .then((idea) => {
        ideaWithLocationPointId = idea.body.data.id;
      });
  });

  it('has a correct location if missing location_point attribute', () => {
    // Shows only the text location description if location_point missing
    cy.visit(`/ideas/${ideaNoLocationPointTitle}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-show-page-content');
    cy.get('#e2e-map-popup').should('not.exist');
    cy.get('#e2e-address-text-only').should('exist');
  });

  it('has a correct location if contains location_point attribute', () => {
    // Shows the clickable location link when there is a location_point
    cy.visit(`/ideas/${ideaWithLocationPointTitle}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-show-page-content');
    cy.get('#e2e-map-popup').should('exist');
    cy.get('#e2e-address-text-only').should('not.exist');
  });

  after(() => {
    cy.apiRemoveIdea(ideaNoLocationPointId);
    cy.apiRemoveIdea(ideaWithLocationPointId);
    cy.apiRemoveProject(projectId);
  });
});
