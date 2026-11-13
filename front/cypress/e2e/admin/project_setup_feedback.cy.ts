import { randomString } from '../../support/commands';

describe('Project setup feedback', () => {
  let projectId: string;

  beforeEach(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'draft',
    }).then(({ body }) => {
      projectId = body.data.id;
    });
    cy.setConsentAndAdminLoginCookies();
  });

  afterEach(() => {
    cy.apiRemoveProject(projectId);
  });

  it('recognizes completed general information and explains topic tags', () => {
    cy.visit(`/admin/projects/${projectId}?project_backoffice_redesign`);
    cy.get('#e2e-setup-card-general').should('contain', 'Ready');
    cy.get('button[id^="e2e-setup-card-"]').then((cards) => {
      expect([...cards].map((card) => card.id)).to.deep.equal([
        'e2e-setup-card-general',
        'e2e-setup-card-homepage-card',
        'e2e-setup-card-area',
        'e2e-setup-card-topics',
        'e2e-setup-card-project-page',
        'e2e-setup-card-methods',
      ]);
    });
    cy.get('#e2e-setup-card-homepage-card').click();
    cy.get('#e2e-setup-card-homepage-card').click().trigger('mouseleave');
    cy.get('body').should(($body) => {
      expect($body.find('[role="tooltip"]').filter(':visible')).to.have.length(
        0
      );
    });

    const tooltips = [
      ['general', 'The project name, and the space and folder it belongs to'],
      [
        'homepage-card',
        'Shown wherever the project is listed: homepage, folders, spaces and pages',
      ],
      [
        'area',
        'Participants can filter projects by area on the homepage. Choose where this project applies.',
      ],
      ['topics', 'Participants can filter projects by topic on the homepage.'],
      ['project-page', 'The page participants see when they open the project'],
      ['methods', 'The ways participants take part, one after the other'],
    ];
    tooltips.forEach(([card, description]) => {
      cy.get(`#e2e-setup-card-${card}`).focus();
      cy.get('[role="tooltip"]')
        .filter(':visible')
        .should('contain', description);
      cy.get(`#e2e-setup-card-${card}`).trigger('keydown', { key: 'Escape' });
      cy.get('body').should(($body) => {
        expect(
          $body.find('[role="tooltip"]').filter(':visible')
        ).to.have.length(0);
      });
    });
    cy.get('#e2e-setup-card-topics').click();
    cy.get('[placeholder="Search tags..."]').should('be.visible');
  });

  it('saves project edits before opening a participation method', () => {
    cy.visit(`/admin/projects/${projectId}?project_backoffice_redesign`);
    cy.get('#e2e-setup-card-homepage-card').click();
    cy.get('#homepage-card-description-en')
      .clear()
      .type('Saved before choosing a method');
    cy.intercept('PATCH', `**/web_api/v1/projects/${projectId}`).as(
      'saveProject'
    );
    cy.get('#e2e-setup-card-methods').click();
    cy.get('[role="dialog"]')
      .contains('Collect input and feedback in public')
      .click();
    cy.wait('@saveProject').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('include', '/phases/new');
    cy.contains('Unsaved changes').should('not.exist');
    cy.visit(`/admin/projects/${projectId}?project_backoffice_redesign`);
    cy.get('#e2e-setup-card-homepage-card').click();
    cy.get('#homepage-card-description-en').should(
      'have.value',
      'Saved before choosing a method'
    );
  });

  it('keeps project edits when saving before navigation fails', () => {
    cy.visit(`/admin/projects/${projectId}?project_backoffice_redesign`);
    cy.get('#e2e-setup-card-homepage-card').click();
    cy.get('#homepage-card-description-en').clear().type('Keep this draft');
    cy.intercept('PATCH', `**/web_api/v1/projects/${projectId}`, {
      statusCode: 422,
      body: { errors: { base: [{ error: 'invalid' }] } },
    }).as('failedSave');
    cy.get('#e2e-setup-card-methods').click();
    cy.get('[role="dialog"]')
      .contains('Collect input and feedback in public')
      .click();
    cy.wait('@failedSave');
    cy.location('pathname').should('not.include', '/phases/new');
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('#homepage-card-description-en').should(
      'have.value',
      'Keep this draft'
    );
    cy.get('[role="alert"]').should('be.visible');
  });

  it('omits event demographics without events and manages attachments in the modal', () => {
    cy.apiCreatePhase({
      projectId,
      title: randomString(),
      startAt: '2026-01-01',
      participationMethod: 'ideation',
    }).then(({ body }) => {
      cy.visit(
        `/admin/projects/${projectId}/phases/${body.data.id}/setup?project_backoffice_redesign`
      );
    });
    cy.contains('button', 'Collect demographic data').click();
    cy.get('[role="dialog"]')
      .should('contain', 'Submitting inputs')
      .and('not.contain', 'Attending an event');
    cy.get('[role="dialog"] .e2e-modal-close-button').click();
    cy.contains('button', 'Attachments').click();
    cy.get('#e2e-file-upload-input').selectFile(
      'cypress/fixtures/example.pdf',
      { action: 'drag-drop' }
    );
    cy.get('[role="dialog"]').contains('example.pdf').should('be.visible');
    cy.get('[role="dialog"]').contains('button', 'Done').click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('button', 'Attachments').should('contain', '1 file').click();
    cy.get('[role="dialog"] [aria-label="Remove example.pdf"]').click();
    cy.get('[role="dialog"] [aria-label="Remove example.pdf"]').should(
      'not.exist'
    );
    cy.get('[role="dialog"]').contains('button', 'Done').click();
    cy.apiCreateEvent({
      projectId,
      title: 'Workshop',
      description: 'Workshop for participants',
      location: 'Town hall',
      startDate: new Date('2026-12-01T10:00:00Z'),
      endDate: new Date('2026-12-01T12:00:00Z'),
    });
    cy.reload();
    cy.contains('button', 'Collect demographic data').click();
    cy.get('[role="dialog"]').should('contain', 'Attending an event');
  });

  it('puts survey demographics in the form builder before the end page', () => {
    cy.apiCreatePhase({
      projectId,
      title: randomString(),
      startAt: '2026-01-01',
      participationMethod: 'native_survey',
      nativeSurveyTitleMultiloc: { en: 'Feedback survey' },
      nativeSurveyButtonMultiloc: { en: 'Take the survey' },
    }).then(({ body }) => {
      const phaseId = body.data.id;
      cy.visit(
        `/admin/projects/${projectId}/phases/${phaseId}/setup?project_backoffice_redesign`
      );
      cy.contains('button', 'Collect demographic data').should('not.exist');
      cy.visit(
        `/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit?project_backoffice_redesign`
      );
      cy.contains('button', 'Demographic questions').click();
      cy.get('[role="dialog"]')
        .should('contain', 'Collect demographic data')
        .and('not.contain', 'Attending an event');
      cy.get('[role="dialog"] .e2e-modal-close-button').click();
      cy.contains('button', 'Demographic questions').should('be.visible');
    });
  });

  it('shares reviewed cards after a fresh login without saving draft settings', () => {
    cy.apiCreatePhase({
      projectId,
      title: 'Saved phase title',
      startAt: '2026-01-01',
      participationMethod: 'ideation',
    }).then(({ body }) => {
      const path = `/admin/projects/${projectId}/phases/${body.data.id}/setup?project_backoffice_redesign`;
      cy.visit(path);
      cy.get('#phase-build-panel-title').clear().type('Unsaved title');
      cy.get('[data-review-card="input_term"]').should('contain', 'To review');
      cy.get('[data-review-card="input_term"]')
        .contains('What should an input be called?')
        .click();
      cy.get('[data-review-card="input_term"]').should('contain', 'Reviewed');
      cy.get('[data-review-card="sorting"]').contains('Sorting').click();
      cy.get('[data-review-card="sorting"]').should('contain', 'Reviewed');
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.setConsentAndAdminLoginCookies();
      cy.reload();
      cy.get('[data-review-card="input_term"]').should('contain', 'Reviewed');
      cy.get('[data-review-card="sorting"]').should('contain', 'Reviewed');
      cy.get('#phase-build-panel-title').should(
        'have.value',
        'Saved phase title'
      );
    });
  });

  it('scrolls to save errors on retries and keeps the last phase open-ended', () => {
    cy.visit(
      `/admin/projects/${projectId}/phases/new?project_backoffice_redesign&participation_method=ideation`
    );
    cy.get('#phase-build-panel-title').type('Open-ended phase');

    const scrollAway = () => {
      cy.get('#phase-build-panel-title')
        .parents()
        .filter(
          (_index, element) =>
            getComputedStyle(element).overflowY === 'auto' &&
            element.scrollHeight > element.clientHeight
        )
        .first()
        .scrollTo('bottom');
    };
    const expectErrorInView = (text: string) => {
      cy.contains('.e2e-error-message', text).should(($error) => {
        const bounds = $error[0].getBoundingClientRect();
        expect(bounds.top).to.be.greaterThan(130);
        expect(bounds.bottom).to.be.lessThan(800);
      });
    };
    for (let attempt = 0; attempt < 2; attempt++) {
      scrollAway();
      cy.contains('button', 'Save changes').click();
      expectErrorInView('Missing start date');
    }

    cy.get('.e2e-date-phase-picker-input').click();
    cy.get('.rdp-today .rdp-day_button').first().click();
    cy.get('.e2e-date-phase-picker-input').click();
    cy.get('#phase-build-panel-title').clear();
    scrollAway();
    cy.intercept('POST', `**/web_api/v1/projects/${projectId}/phases`).as(
      'createOpenPhase'
    );
    cy.contains('button', 'Save changes').click();
    cy.wait('@createOpenPhase').its('response.statusCode').should('eq', 422);
    expectErrorInView('This cannot be empty.');

    cy.get('#phase-build-panel-title').type('Open-ended phase');
    cy.contains('button', 'Save changes').click();
    cy.wait('@createOpenPhase').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);
      expect(response?.body.data.attributes.end_at).to.eq(null);
      cy.location('pathname').should(
        'include',
        `/phases/${response?.body.data.id}/setup`
      );
    });
  });

  it('keeps the legacy setup when the redesign is disabled', () => {
    cy.intercept('GET', '**/web_api/v1/app_configuration**', (request) => {
      request.continue((response) => {
        response.body.data.attributes.settings.project_backoffice_redesign.enabled =
          false;
      });
    });
    cy.apiCreatePhase({
      projectId,
      title: randomString(),
      startAt: '2026-01-01',
      participationMethod: 'ideation',
    }).then(({ body }) => {
      cy.visit(`/admin/projects/${projectId}/phases/${body.data.id}/setup`);
      cy.contains('Edit Phase').should('be.visible');
      cy.get('[data-review-card]').should('not.exist');
      cy.contains('Upload attachments').scrollIntoView().should('be.visible');
      cy.contains('Emails to participants').should('not.exist');
      cy.contains('button', 'Collect demographic data').should('not.exist');
      cy.contains('button', 'Select a file').click();
      cy.get('[role="dialog"]').should('contain', 'Select file');
      cy.get('[role="dialog"]').contains('button', 'Done').should('not.exist');
    });
  });
});
