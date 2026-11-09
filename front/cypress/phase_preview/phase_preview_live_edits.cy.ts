import { randomString } from '../support/commands';

describe('Phase preview live edits', () => {
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;
  let surveyPhaseId: string;
  const editedTitle = `Updated ${randomString()}`;

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;

        return cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: '2020-01-01',
          participationMethod: 'poll',
          allow_anonymous_participation: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;

        return cy.apiAddPoll(
          phaseId,
          [{ title: 'Choose an option', type: 'multiple_options' }],
          [['First option', 'Second option']]
        );
      })
      .then(() =>
        cy.apiCreatePhase({
          projectId,
          title: 'Future survey',
          startAt: '2090-01-01',
          participationMethod: 'native_survey',
          nativeSurveyTitleMultiloc: { en: 'Future survey' },
          nativeSurveyButtonMultiloc: { en: 'Answer future survey' },
        })
      )
      .then((phase) => {
        surveyPhaseId = phase.body.data.id;
        return cy.apiCreateSurveyQuestions(surveyPhaseId, ['page', 'text']);
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('keeps the same document and selected answer when the title changes', () => {
    cy.setAdminLoginCookie();
    cy.intercept('POST', '**/poll_responses', () => {
      throw new Error('Preview must not send poll responses to the server');
    });
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/setup?project_backoffice_redesign`
    );

    cy.get('[data-cy="e2e-phase-preview"] iframe', { timeout: 60000 })
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then((body) => {
        const previewDocument = body.ownerDocument;

        cy.wrap(body).find('.e2e-poll-option').first().click();
        cy.get('#phase-build-panel-title').clear().type(editedTitle);
        cy.wrap(body).contains('h3', editedTitle).should('be.visible');

        cy.get('[data-cy="e2e-phase-preview"] iframe', { timeout: 60000 })
          .its('0.contentDocument')
          .should('equal', previewDocument);
        cy.wrap(body)
          .find('.e2e-poll-option input:checked')
          .should('have.length', 1);
        cy.wrap(body)
          .find('.e2e-send-poll button')
          .should('have.attr', 'aria-disabled', 'false')
          .click();
        cy.wrap(body).find('.e2e-form-completed').should('be.visible');
      });
  });

  it('shows an unsaved visual phase without creating it or enabling participation', () => {
    cy.setAdminLoginCookie();
    cy.intercept('POST', `**/projects/${projectId}/phases`, () => {
      throw new Error('Visual preview must not create a phase');
    });
    cy.visit(
      `admin/projects/${projectId}/phases/new?participation_method=ideation&project_backoffice_redesign`
    );
    cy.get('#phase-build-panel-title').type('Unsaved preview title');
    cy.get('[data-cy="e2e-phase-preview"] iframe', { timeout: 60000 })
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then((body) => {
        cy.wrap(body)
          .contains('h3', 'Unsaved preview title')
          .should('be.visible');
        cy.wrap(body)
          .find('[data-cy="e2e-phase-preview-skeleton"]')
          .should('be.visible');
        cy.wrap(body).contains('Dates to be announced').should('not.exist');
        cy.wrap(body)
          .find('#e2e-ideation-see-ideas-button')
          .find('button')
          .should('be.disabled');
      });
    cy.contains('Save this phase to preview its participation form.').should(
      'be.visible'
    );
  });

  it('shows a grey fixed footer without changing the public participation bar', () => {
    cy.setAdminLoginCookie();
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/setup?project_backoffice_redesign`
    );
    cy.get('[data-cy="e2e-phase-preview"] iframe', { timeout: 60000 })
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then((body) => {
        cy.wrap(body)
          .find('[data-cy="e2e-phase-preview-footer"]')
          .should('be.visible')
          .then((footer) => {
            const view = body.ownerDocument.defaultView;
            expect(view).not.to.be.null;
            expect(
              footer[0].parentElement?.getBoundingClientRect().bottom
            ).to.be.closeTo(view?.innerHeight ?? 0, 1);
          });
      });
    cy.visit(`/en/projects/${projectSlug}`);
    cy.get('[data-cy="e2e-phase-preview-footer"]').should('not.exist');
  });

  it('targets the selected future survey instead of the active poll', () => {
    cy.setAdminLoginCookie();
    cy.visit(
      `admin/projects/${projectId}/phases/${surveyPhaseId}/setup?project_backoffice_redesign`
    );
    cy.get('[role="group"][aria-label="Preview phase state"]')
      .contains('button', 'Open')
      .click();
    cy.get('[data-cy="e2e-phase-preview"] iframe', { timeout: 60000 })
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then((body) => {
        cy.wrap(body)
          .contains('button', 'Answer future survey')
          .should('be.visible');
        cy.wrap(body).contains('1 question').should('be.visible');
        cy.wrap(body).contains('About 1 minute').should('be.visible');
        cy.wrap(body).find('#e2e-participation-cta-poll').should('not.exist');
      });
  });

  it('shows the Spotlight survey cover and keeps its completion local', () => {
    cy.setAdminLoginCookie();
    cy.apiCreatePhase({
      projectId,
      title: 'Spotlight cover',
      startAt: '2091-01-01',
      participationMethod: 'native_survey',
      placementType: 'standalone',
      allow_anonymous_participation: true,
      nativeSurveyTitleMultiloc: { en: 'Spotlight form' },
      nativeSurveyButtonMultiloc: { en: 'Take the Spotlight survey' },
    }).then(({ body }) => {
      const spotlightId = body.data.id;
      cy.apiCreateSurveyQuestions(spotlightId, ['page', 'text']);
      cy.intercept('POST', `**/phases/${spotlightId}/inputs`, () => {
        throw new Error('Preview must not submit a survey to the server');
      });
      cy.visit(
        `admin/projects/${projectId}/phases/${spotlightId}/setup?project_backoffice_redesign`
      );

      const phone = () =>
        cy
          .get('[data-cy="e2e-phase-preview"] iframe', { timeout: 60000 })
          .its('0.contentDocument.body')
          .should('not.be.empty')
          .then((body) => cy.wrap(body));
      phone().contains('Spotlight cover').should('be.visible');
      phone().contains('1 question').should('be.visible');
      phone().contains('Starts in').should('be.visible');
      phone().contains('Take the Spotlight survey').should('not.exist');

      cy.get('[role="group"][aria-label="Preview phase state"]')
        .contains('button', 'Open')
        .click();
      phone().contains('button', 'Take the Spotlight survey').click();
      phone().contains('Question: text').should('be.visible');
      phone().contains('button', 'Submit').click();
      phone()
        .contains('Thank you for sharing your input!')
        .should('be.visible');
      phone().contains('Submission identifier').should('not.exist');
      phone().contains('Send this code to my email').should('not.exist');
    });
  });

  it('switches lifecycle locally without reloading the phone or losing answers', () => {
    cy.setAdminLoginCookie();
    cy.intercept('PATCH', `**/phases/${phaseId}`, () => {
      throw new Error('Lifecycle preview must not change the real phase');
    });
    cy.intercept('POST', '**/poll_responses', () => {
      throw new Error('Preview responses must remain local');
    });
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/setup?project_backoffice_redesign`
    );
    cy.get('[data-cy="e2e-phase-preview"] iframe', { timeout: 60000 })
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then((body) => {
        const previewDocument = body.ownerDocument;
        cy.wrap(body).find('.e2e-poll-option').first().click();
        cy.get('[role="group"][aria-label="Preview phase state"]')
          .contains('button', 'Before')
          .click();
        cy.wrap(body)
          .contains('This phase has not started yet')
          .should('be.visible');
        cy.get('[role="group"][aria-label="Preview phase state"]')
          .contains('button', 'Ended')
          .click();
        cy.wrap(body).contains('Phase ended').should('be.visible');
        cy.get('[role="group"][aria-label="Preview phase state"]')
          .contains('button', 'Open')
          .click();
        cy.wrap(body)
          .find('.e2e-poll-option input:checked')
          .should('have.length', 1);
        cy.get('[data-cy="e2e-phase-preview"] iframe', { timeout: 60000 })
          .its('0.contentDocument')
          .should('equal', previewDocument);
        cy.wrap(body)
          .find('.e2e-send-poll button')
          .should('have.attr', 'aria-disabled', 'false')
          .click();
        cy.wrap(body).find('.e2e-form-completed').should('be.visible');
      });
  });

  (['survey', 'document_annotation'] as const).forEach((method) => {
    it(`shows a safe placeholder for ${method} without loading a provider`, () => {
      cy.setAdminLoginCookie();
      cy.apiCreatePhase({
        projectId,
        title: `Preview ${method}`,
        startAt: method === 'survey' ? '2092-01-01' : '2094-01-01',
        participationMethod: method,
        surveyUrl:
          method === 'survey'
            ? 'https://docs.google.com/forms/d/e/preview/viewform?embedded=true'
            : undefined,
        surveyService: method === 'survey' ? 'google_forms' : undefined,
        documentAnnotationUrl:
          method === 'document_annotation'
            ? 'https://example.konveio.com/preview'
            : undefined,
      }).then((phase) => {
        cy.visit(
          `admin/projects/${projectId}/phases/${phase.body.data.id}/setup?project_backoffice_redesign`
        );
        cy.get('[role="group"][aria-label="Preview phase state"]')
          .contains('button', 'Open')
          .click();
        cy.get('[data-cy="e2e-phase-preview"] iframe', { timeout: 60000 })
          .its('0.contentDocument.body')
          .should('not.be.empty')
          .then((body) => {
            cy.wrap(body)
              .find('[data-cy="e2e-phase-preview-skeleton"]')
              .should('be.visible');
            cy.wrap(body).find('iframe').should('not.exist');
          });
      });
    });
  });

  it('refreshes voting option permissions when opening the phase and retains local votes', () => {
    cy.setAdminLoginCookie();
    cy.apiCreatePhase({
      projectId,
      title: 'Voting lifecycle preview',
      startAt: '2096-01-01',
      participationMethod: 'voting',
      votingMethod: 'multiple_voting',
      votingMaxTotal: 10,
      votingMinTotal: 1,
      votingMaxVotesPerIdea: 5,
    }).then((phase) => {
      const votingPhaseId = phase.body.data.id;
      cy.apiCreateIdea({
        phaseId: votingPhaseId,
        ideaTitle: 'Preview voting option',
        ideaContent: 'A fresh option for the isolated preview.',
      });
      cy.intercept('PUT', '**/baskets/ideas/**', () => {
        throw new Error('Preview votes must not reach the server');
      });
      cy.visit(
        `admin/projects/${projectId}/phases/${votingPhaseId}/setup?project_backoffice_redesign`
      );
      cy.get('[data-cy="e2e-phase-preview"] iframe', { timeout: 60000 })
        .its('0.contentDocument.body')
        .should('not.be.empty')
        .then((body) => {
          cy.wrap(body)
            .contains('This phase has not started yet')
            .should('be.visible');
          cy.wrap(body).contains('Preview voting option').should('exist');
          cy.get('[role="group"][aria-label="Preview phase state"]')
            .contains('button', 'Open')
            .click();
          cy.wrap(body)
            .find('.e2e-multiple-votes-button button')
            .should('have.attr', 'aria-disabled', 'false')
            .click();
          cy.wrap(body).find('.e2e-vote-plus').should('be.visible');
          cy.get('[role="group"][aria-label="Preview phase state"]')
            .contains('button', 'Ended')
            .click();
          cy.wrap(body).contains('Phase ended').should('be.visible');
          cy.get('[role="group"][aria-label="Preview phase state"]')
            .contains('button', 'Open')
            .click();
          cy.wrap(body).find('.e2e-vote-plus').should('be.visible');
        });
    });
  });
});
