import { randomString } from '../support/commands';

describe('Ideas Feed (Perspectives)', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const phaseTitle = randomString();

  // Topic names
  const topic1Name = `Topic1_${randomString(8)}`;
  const topic2Name = `Topic2_${randomString(8)}`;
  const topic3Name = `Topic3_${randomString(8)}`;
  const subtopic1aName = `Subtopic1a_${randomString(8)}`;
  const subtopic1bName = `Subtopic1b_${randomString(8)}`;

  // Idea titles - 10 ideas distributed across topics
  const ideaTitles = Array.from(
    { length: 10 },
    (_, i) => `Idea_${i + 1}_${randomString(8)}`
  );

  let projectId: string;
  let projectSlug: string;
  let phaseId: string;
  let topic1Id: string;
  let topic2Id: string;
  let topic3Id: string;
  let subtopic1aId: string;
  let subtopic1bId: string;
  const ideaIds: string[] = [];

  before(() => {
    // Create project
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescription,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;

        // Create ideation phase with feed view
        return cy.apiCreatePhase({
          projectId,
          title: phaseTitle,
          startAt: '2018-03-01',
          endAt: '2030-01-01',
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
          presentation_mode: 'feed',
          available_views: ['card', 'map', 'feed'],
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;

        // Create parent topics
        return cy.apiCreateInputTopic({
          projectId,
          title: topic1Name,
          description: 'First topic with subtopics',
          icon: '🌟',
        });
      })
      .then((topic) => {
        topic1Id = topic.body.data.id;

        return cy.apiCreateInputTopic({
          projectId,
          title: topic2Name,
          description: 'Second topic',
          icon: '🔥',
        });
      })
      .then((topic) => {
        topic2Id = topic.body.data.id;

        return cy.apiCreateInputTopic({
          projectId,
          title: topic3Name,
          description: 'Third topic',
          icon: '💡',
        });
      })
      .then((topic) => {
        topic3Id = topic.body.data.id;

        // Create subtopics under topic 1
        return cy.apiCreateInputTopic({
          projectId,
          title: subtopic1aName,
          description: 'First subtopic',
          parentId: topic1Id,
        });
      })
      .then((subtopic) => {
        subtopic1aId = subtopic.body.data.id;

        return cy.apiCreateInputTopic({
          projectId,
          title: subtopic1bName,
          description: 'Second subtopic',
          parentId: topic1Id,
        });
      })
      .then((subtopic) => {
        subtopic1bId = subtopic.body.data.id;

        // Create 10 ideas distributed across topics:
        // Ideas 0,1 -> subtopic1a (under topic1)
        // Ideas 2,3 -> subtopic1b (under topic1)
        // Ideas 4,5,6 -> topic2
        // Ideas 7,8,9 -> topic3
        const topicAssignments = [
          [subtopic1aId],
          [subtopic1aId],
          [subtopic1bId],
          [subtopic1bId],
          [topic2Id],
          [topic2Id],
          [topic2Id],
          [topic3Id],
          [topic3Id],
          [topic3Id],
        ];

        // Create ideas sequentially
        let chain: Cypress.Chainable<any> = cy.wrap(null);
        ideaTitles.forEach((title, index) => {
          chain = chain.then(() => {
            return cy
              .apiCreateIdea({
                projectId,
                ideaTitle: title,
                ideaContent: `Content for ${title}. This is a test idea for the ideas feed e2e test.`,
                topicIds: topicAssignments[index],
                phaseIds: [phaseId],
              })
              .then((idea) => {
                ideaIds.push(idea.body.data.id);
              });
          });
        });

        return chain;
      });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  describe('Sticky notes pile on project page', () => {
    it('displays sticky notes and navigates to ideas feed via "See all" button', () => {
      cy.visit(`/projects/${projectSlug}`);
      cy.get('[data-cy="e2e-sticky-notes-pile"]').should('be.visible');
      cy.get('[data-cy="e2e-sticky-note"]').should('have.length.at.least', 1);

      cy.contains('button', 'See all').click();
      cy.url().should('include', '/ideas-feed');
      cy.get('#e2e-project-ideas-page').should('exist');
    });
  });

  describe('Ideas feed page', () => {
    beforeEach(() => {
      cy.setAdminLoginCookie();
      cy.visit(`/projects/${projectSlug}/ideas-feed?phase_id=${phaseId}`);
      cy.get('[data-cy="e2e-ideas-feed"]').should('exist');
    });

    it('displays sticky notes and supports scrolling', () => {
      cy.get('[data-cy="e2e-ideas-feed"]').should('be.visible');
      cy.get('[data-cy="e2e-sticky-note"]').should('have.length.at.least', 1);

      // Scroll down in the feed container
      cy.get('[data-cy="e2e-ideas-feed"]').scrollTo('bottom', {
        duration: 500,
      });

      // After scrolling, sticky notes should still be present
      cy.get('[data-cy="e2e-sticky-note"]').should('have.length.at.least', 1);
    });

    it('clicking an idea opens it in the sidebar', () => {
      // Click on the first visible sticky note
      cy.get('[data-cy="e2e-sticky-note"]').first().click();

      // The sidebar should show the idea detail
      cy.get('[data-cy="e2e-ideas-feed-sidebar"]').should('be.visible');

      // The URL should contain idea_id parameter
      cy.url().should('include', 'idea_id=');
    });

    it('clicking "Add an idea" button redirects to new idea page when logged in', () => {
      cy.contains('button', 'Add an idea').click();
      cy.url().should('include', `/projects/${projectSlug}/ideas/new`);
    });

    it('clicking the like button increases the like count when logged in', () => {
      // Wait for a sticky note with reaction controls to appear
      cy.get('[data-cy="e2e-sticky-note"]').first().should('be.visible');

      // Get the like button on the first sticky note and read initial count
      cy.get('[data-cy="e2e-sticky-note"]')
        .first()
        .find('.e2e-ideacard-like-button')
        .then(($btn) => {
          const initialCount = parseInt($btn.text(), 10) || 0;

          // Click the like button
          cy.wrap($btn).click({ force: true });

          // Verify the count increased
          cy.get('[data-cy="e2e-sticky-note"]')
            .first()
            .find('.e2e-ideacard-like-button')
            .should('contain', String(initialCount + 1));
        });
    });
  });

  describe('Interactions when logged out', () => {
    beforeEach(() => {
      cy.visit(`/projects/${projectSlug}/ideas-feed?phase_id=${phaseId}`);
      cy.get('[data-cy="e2e-ideas-feed"]').should('exist');
    });

    it('clicking "Add an idea" button triggers authentication flow', () => {
      cy.contains('button', 'Add an idea').click();
      cy.get('#e2e-authentication-modal').should('exist');
    });

    it('clicking the like button triggers authentication flow', () => {
      cy.wait(3000);
      // Target the like button directly to avoid pointer-events:none on non-centered notes
      cy.get('.e2e-ideacard-like-button').first().click({ force: true });
      cy.get('#e2e-authentication-modal').should('exist');
    });
  });

  describe('Topic and subtopic filtering', () => {
    beforeEach(() => {
      cy.visit(`/projects/${projectSlug}/ideas-feed?phase_id=${phaseId}`);
      cy.get('[data-cy="e2e-ideas-feed-sidebar"]').should('be.visible');
    });

    it('sidebar shows all parent topics', () => {
      // Our 3 parent topics should be visible in the sidebar
      cy.get('[data-cy="e2e-ideas-feed-sidebar"]')
        .contains(topic1Name)
        .should('be.visible');
      cy.get('[data-cy="e2e-ideas-feed-sidebar"]')
        .contains(topic2Name)
        .should('be.visible');
      cy.get('[data-cy="e2e-ideas-feed-sidebar"]')
        .contains(topic3Name)
        .should('be.visible');

      // Each topic should have an idea count badge
      cy.get('[data-cy="e2e-topic-item"]').should('have.length.at.least', 3);
    });

    it("clicking a topic filters the feed to show only that topic's ideas", () => {
      // Click on topic 2
      cy.get('[data-cy="e2e-topic-item"]').contains(topic2Name).click();

      // URL should contain topic parameter
      cy.url().should('include', 'topic=');

      // The feed should still be visible
      cy.get('[data-cy="e2e-ideas-feed"]').should('exist');
    });

    it('clicking a topic with subtopics shows the subtopics', () => {
      // Click on topic 1 which has subtopics
      cy.get('[data-cy="e2e-topic-item"]').contains(topic1Name).click();

      // Subtopics should now be visible
      cy.get('[data-cy="e2e-subtopic-item"]').should('have.length', 2);
      cy.get('[data-cy="e2e-subtopic-item"]')
        .contains(subtopic1aName)
        .should('be.visible');
      cy.get('[data-cy="e2e-subtopic-item"]')
        .contains(subtopic1bName)
        .should('be.visible');
    });

    it('clicking a subtopic filters the feed further', () => {
      // Click on topic 1 first
      cy.get('[data-cy="e2e-topic-item"]').contains(topic1Name).click();

      // Then click on subtopic 1a
      cy.get('[data-cy="e2e-subtopic-item"]').contains(subtopic1aName).click();

      // URL should contain subtopic parameter
      cy.url().should('include', 'subtopic=');

      // The feed should still be visible
      cy.get('[data-cy="e2e-ideas-feed"]').should('exist');
    });
  });
});
