import {
  pickTodayInPhaseDatePicker,
  randomString,
} from '../../support/commands';

// The card id sits on a wrapper; its header button is the first button inside.
const setupCard = (card: string) =>
  cy.get(`#e2e-setup-card-${card} button`).first();

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
    cy.get('div[id^="e2e-setup-card-"]').then((cards) => {
      expect([...cards].map((card) => card.id)).to.deep.equal([
        'e2e-setup-card-general',
        'e2e-setup-card-homepage-card',
        'e2e-setup-card-area',
        'e2e-setup-card-topics',
        'e2e-setup-card-project-page',
        'e2e-setup-card-methods',
      ]);
    });
    setupCard('homepage-card').click();
    setupCard('homepage-card').click().trigger('pointerout', {
      eventConstructor: 'PointerEvent',
      pointerType: 'mouse',
    });
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
        'Participants can find projects by area on the projects page and on pages that list projects by area. Choose where this project applies.',
      ],
      ['topics', 'Participants can filter projects by topic on the homepage.'],
      ['project-page', 'The page participants see when they open the project'],
      ['methods', 'The ways participants take part, one after the other'],
    ];
    tooltips.forEach(([card, description]) => {
      // The tooltip opens after a hover delay, and closes when the pointer leaves.
      setupCard(card).trigger('pointerover', {
        eventConstructor: 'PointerEvent',
        pointerType: 'mouse',
      });
      cy.get('[role="tooltip"]')
        .filter(':visible')
        .should('contain', description);
      setupCard(card).trigger('pointerout', {
        eventConstructor: 'PointerEvent',
        pointerType: 'mouse',
      });
      cy.get('body').should(($body) => {
        expect(
          $body.find('[role="tooltip"]').filter(':visible')
        ).to.have.length(0);
      });
    });
    setupCard('topics').click();
    cy.get('[placeholder="Search tags"]').should('be.visible');
  });

  it('keeps unsaved details when switching phase tabs', () => {
    cy.visit(
      `/admin/projects/${projectId}/phases/new?project_backoffice_redesign&participation_method=ideation`
    );

    cy.get('#phase-build-panel-title').type('Unsaved phase title');
    cy.contains('[role="tab"]', /^Manage$/).click();
    cy.contains('Ideas will appear here').should('be.visible');
    cy.contains('[role="tab"]', /^Insights$/).click();
    cy.contains('Insights will appear here').should('be.visible');
    cy.contains('[role="tab"]', /^Build$/).click();
    cy.get('#phase-build-panel-title').should(
      'have.value',
      'Unsaved phase title'
    );
    cy.location('pathname').should('include', '/phases/new');
  });

  it('validates and autosaves the map position, even after retrying a failed save', () => {
    cy.apiCreatePhase({
      projectId,
      title: 'Map setup',
      startAt: '2026-01-01',
      participationMethod: 'ideation',
    }).then(({ body }) => {
      const path = `/admin/projects/${projectId}/phases/${body.data.id}/setup?project_backoffice_redesign&map_config=true`;
      let failNext = true;
      cy.intercept('PATCH', '**/web_api/v1/map_configs/*', (request) => {
        if (failNext) {
          failNext = false;
          request.reply({ statusCode: 503, body: {} });
        }
      }).as('updateMap');
      cy.visit(path.replace('&map_config=true', ''));
      cy.get('[data-review-card="views"]')
        .contains('button', 'Available views')
        .click();
      cy.contains('Displays ideas as pins').should('be.visible');
      cy.contains('a', 'Idea form').should('be.visible');
      cy.contains('button', 'Configure map').click();
      cy.contains('h2', 'Configure map').should('be.visible');

      const latitude = () => cy.get('input[aria-label="Default latitude"]');
      const zoom = () => cy.get('input[aria-label="Map zoom level"]');
      cy.contains('button', /^Save$/).should('not.exist');

      latitude().clear().type('12.5north');
      cy.contains('Enter valid coordinates').should('be.visible');
      cy.get('@updateMap.all').should('have.length', 0);
      zoom().clear().type('8.5');
      latitude().clear().type('12.5');
      cy.contains('Enter valid coordinates').should('be.visible');
      cy.get('@updateMap.all').should('have.length', 0);

      zoom().clear().type('8');
      cy.wait('@updateMap').its('response.statusCode').should('eq', 503);
      cy.contains('The map position could not be saved.').should('be.visible');
      cy.contains('button', 'Try again').click();
      cy.wait('@updateMap').its('response.statusCode').should('eq', 200);
      cy.contains('[role="status"]', /^Saved$/).should('be.visible');

      cy.visit(path);
      cy.contains('h2', 'Edit map').should('be.visible');
      latitude().should('have.value', '12.5');
      zoom().should('have.value', '8');
    });
  });

  it('opens the editor when the project preview is clicked', () => {
    cy.visit(
      `/admin/projects/${projectId}/project-page?project_backoffice_redesign`
    );

    cy.dataCy('e2e-project-page-preview')
      .find('iframe')
      .should('have.attr', 'tabindex', '-1')
      .and('have.css', 'pointer-events', 'none');
    cy.dataCy('e2e-edit-page-content').click(25, 25);
    cy.location('pathname').should(
      'include',
      `/admin/project-page-builder/projects/${projectId}`
    );
  });

  it('saves project edits before opening a participation method', () => {
    cy.visit(`/admin/projects/${projectId}?project_backoffice_redesign`);
    setupCard('homepage-card').click();
    cy.get('#homepage-card-description')
      .clear()
      .type('Saved before choosing a method');
    cy.intercept('PATCH', `**/web_api/v1/projects/${projectId}`).as(
      'saveProject'
    );
    setupCard('methods').click();
    cy.get('[role="dialog"]')
      .contains(/^Ideation$/)
      .click();
    cy.wait('@saveProject').its('response.statusCode').should('eq', 200);
    cy.location('pathname').should('include', '/phases/new');
    cy.contains('Unsaved changes').should('not.exist');
    cy.visit(`/admin/projects/${projectId}?project_backoffice_redesign`);
    setupCard('homepage-card').click();
    cy.get('#homepage-card-description').should(
      'have.value',
      'Saved before choosing a method'
    );
  });

  it('keeps project edits when saving before navigation fails', () => {
    cy.visit(`/admin/projects/${projectId}?project_backoffice_redesign`);
    setupCard('homepage-card').click();
    cy.get('#homepage-card-description').clear().type('Keep this draft');
    cy.intercept('PATCH', `**/web_api/v1/projects/${projectId}`, {
      statusCode: 422,
      body: { errors: { base: [{ error: 'invalid' }] } },
    }).as('failedSave');
    setupCard('methods').click();
    cy.get('[role="dialog"]')
      .contains(/^Ideation$/)
      .click();
    cy.wait('@failedSave');
    cy.location('pathname').should('not.include', '/phases/new');
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('#homepage-card-description').should(
      'have.value',
      'Keep this draft'
    );
    cy.get('[role="alert"]').should('be.visible');
  });

  it('asks before leaving unsaved phase edits for a new participation method', () => {
    cy.apiCreatePhase({
      projectId,
      title: randomString(),
      startAt: '2026-01-01',
      participationMethod: 'ideation',
    }).then(({ body }) => {
      const phaseId = body.data.id;
      cy.intercept('PATCH', `**/web_api/v1/phases/${phaseId}`).as('savePhase');
      cy.visit(
        `/admin/projects/${projectId}/phases/${phaseId}/setup?project_backoffice_redesign`
      );
      cy.get('#phase-build-panel-title').clear().type('Unsaved title');
      cy.get('[aria-label="New phase"]').click();
      cy.get('[role="dialog"]')
        .contains(/^Ideation$/)
        .click();
      cy.contains('You have unsaved changes').should('be.visible');
      cy.get('@savePhase.all').should('have.length', 0);
      cy.location('pathname').should('include', `/phases/${phaseId}/setup`);
      cy.contains('[role="dialog"] button', 'Save changes').click();
      cy.wait('@savePhase').its('response.statusCode').should('eq', 200);
      cy.location('pathname').should('include', '/phases/new');
    });
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
    cy.get('[role="dialog"] [data-cy="e2e-modal-close-button"]').click();
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
      cy.get('[role="dialog"] [data-cy="e2e-modal-close-button"]').click();
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
      cy.press(Cypress.Keyboard.Keys.ESC);
      cy.get('[data-review-card="input_term"]').should('contain', 'Reviewed');
      cy.get('[data-review-card="sorting"]').contains('Sorting').click();
      cy.press(Cypress.Keyboard.Keys.ESC);
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
      // The same errors the page scrolls to after a save.
      cy.contains('[slot="errorMessage"], .e2e-error-message', text).should(
        ($error) => {
          const bounds = $error[0].getBoundingClientRect();
          expect(bounds.top).to.be.greaterThan(130);
          expect(bounds.bottom).to.be.lessThan(800);
        }
      );
    };
    for (let attempt = 0; attempt < 2; attempt++) {
      scrollAway();
      cy.contains('button', /^Save$/).click();
      expectErrorInView('Missing start date');
    }

    pickTodayInPhaseDatePicker();
    cy.get('#phase-build-panel-title').clear();
    scrollAway();
    cy.intercept('POST', `**/web_api/v1/projects/${projectId}/phases`).as(
      'createOpenPhase'
    );
    cy.contains('button', /^Save$/).click();
    cy.wait('@createOpenPhase').its('response.statusCode').should('eq', 422);
    expectErrorInView('This cannot be empty.');

    cy.get('#phase-build-panel-title').type('Open-ended phase');
    cy.contains('button', /^Save$/).click();
    cy.wait('@createOpenPhase').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);
      expect(response?.body.data.attributes.end_at).to.eq(null);
      cy.location('pathname').should(
        'include',
        `/phases/${response?.body.data.id}/setup`
      );
    });
  });

  it('keeps a new phase open until its tags are saved too', () => {
    const draftPath = `/admin/projects/${projectId}/phases/new`;
    cy.intercept('POST', `**/web_api/v1/projects/${projectId}/phases`).as(
      'createPhase'
    );
    // Delayed, so the tags fail after the phase is created.
    cy.intercept(
      {
        method: 'POST',
        url: `**/web_api/v1/projects/${projectId}/input_topics`,
        times: 1,
      },
      {
        statusCode: 422,
        body: { errors: { base: [{ error: 'invalid' }] } },
        delay: 1500,
      }
    ).as('failedTag');
    cy.visit(
      `${draftPath}?project_backoffice_redesign&participation_method=ideation`
    );
    pickTodayInPhaseDatePicker();
    cy.get('#phase-build-panel-title').type('Phase with tags');
    cy.contains('button', 'Idea tags').click();
    cy.get('#phase-add-input-tag').type('Unsaved tag{enter}');
    cy.contains('button', /^Save$/).click();
    cy.wait('@createPhase').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);
      cy.wait('@failedTag');
      cy.location('pathname').should('include', draftPath);
      cy.contains('The tags could not be saved').should('be.visible');
      cy.contains('Unsaved tag').scrollIntoView().should('be.visible');

      cy.contains('button', /^Save$/).click();
      cy.location('pathname').should(
        'include',
        `/phases/${response?.body.data.id}/setup`
      );
      cy.get('@createPhase.all').should('have.length', 1);
    });
  });

  it('keeps a card reviewed after the first save of a phase partly failed', () => {
    cy.intercept('POST', `**/web_api/v1/projects/${projectId}/phases`).as(
      'createPhase'
    );
    cy.intercept(
      { method: 'POST', url: '**/web_api/v1/file_attachments', times: 1 },
      { statusCode: 422, body: { errors: { base: [{ error: 'invalid' }] } } }
    ).as('failedAttachment');
    cy.visit(
      `/admin/projects/${projectId}/phases/new?project_backoffice_redesign&participation_method=ideation`
    );
    pickTodayInPhaseDatePicker();
    cy.get('#phase-build-panel-title').type('Phase with attachment');
    cy.contains('button', 'Attachments').click();
    cy.get('#e2e-file-upload-input').selectFile(
      'cypress/fixtures/example.pdf',
      { action: 'drag-drop' }
    );
    cy.get('[role="dialog"]').contains('example.pdf').should('be.visible');
    cy.get('[role="dialog"]').contains('button', 'Done').click();
    cy.contains('button', /^Save$/).click();
    cy.wait('@createPhase').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);
      cy.wait('@failedAttachment');
      cy.location('pathname').should('include', '/phases/new');

      cy.get('[data-review-card="input_term"]')
        .contains('What should an input be called?')
        .click();
      cy.press(Cypress.Keyboard.Keys.ESC);
      cy.get('[data-review-card="input_term"]').should('contain', 'Reviewed');
      cy.contains('button', /^Save$/).click();
      cy.location('pathname').should(
        'include',
        `/phases/${response?.body.data.id}/setup`
      );
      cy.get('[data-review-card="input_term"]').should('contain', 'Reviewed');
      cy.get('@createPhase.all').should('have.length', 1);
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
      cy.contains('Emails and notifications').should('not.exist');
      cy.contains('button', 'Collect demographic data').should('not.exist');
      cy.contains('button', 'Select a file').click();
      cy.get('[role="dialog"]').should('contain', 'Select file');
      cy.get('[role="dialog"]').contains('button', 'Done').should('not.exist');
    });
  });
});
