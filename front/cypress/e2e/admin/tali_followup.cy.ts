import { randomString } from '../../support/commands';

describe('Tali follow-up designs', () => {
  let projectId: string;
  let phaseId: string;
  let otherPhaseId: string;

  beforeEach(() => {
    cy.setConsentAndAdminLoginCookies();
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      publicationStatus: 'draft',
    }).then(({ body }) => {
      projectId = body.data.id;
    });
  });
  afterEach(() => cy.apiRemoveProject(projectId));

  const ideation = () =>
    cy
      .apiCreatePhase({
        projectId,
        title: 'First method',
        startAt: '2026-01-01',
        endAt: '2026-02-01',
        participationMethod: 'ideation',
      })
      .then(({ body }) => {
        phaseId = body.data.id;
      });
  const visit = (id: string) =>
    cy.visit(
      `/admin/projects/${projectId}/phases/${id}/setup?project_backoffice_redesign`
    );

  it('edits shared tags inside the phase and removes them from project settings', () => {
    ideation();
    cy.apiCreatePhase({
      projectId,
      title: 'Second method',
      startAt: '2026-02-02',
      participationMethod: 'ideation',
    }).then(({ body }) => {
      otherPhaseId = body.data.id;
    });
    cy.then(() => visit(phaseId));
    cy.contains('button', 'Idea tags').click();
    cy.contains('Shared with “Second method”').should('be.visible');
    const tag = `Shared tag ${randomString()}`;
    cy.get('#phase-add-input-tag').type(`${tag}{enter}`);
    cy.contains('button', /^Save$/).click();
    cy.get('button[aria-label="Back to phase setup"]').click();
    cy.then(() => visit(otherPhaseId));
    cy.contains('button', 'Idea tags').click();
    cy.get('[aria-label="Search tags"]').type(tag);
    cy.get('body').should('contain', tag);
    cy.visit(`/admin/projects/${projectId}?project_backoffice_redesign`);
    cy.get('[aria-label="Project settings"]').click();
    cy.get('[role="dialog"]')
      .should('not.contain', 'Perspectives')
      .and('not.contain', 'Inputs');
  });

  it('keeps Perspectives gated when that feature is unavailable', () => {
    ideation();
    cy.intercept('GET', '**/web_api/v1/app_configuration**', (request) => {
      request.continue((response) => {
        response.body.data.attributes.settings.live_auto_input_topics.enabled =
          false;
      });
    });
    cy.then(() => visit(phaseId));
    cy.contains('button', 'Idea tags').click();
    cy.get('body').should('not.contain', 'Perspectives');
    cy.get('#phase-add-input-tag').should('be.visible');
  });

  it('places survey placement under Settings and removes the duplicate preview CTA', () => {
    cy.apiCreatePhase({
      projectId,
      title: 'Survey',
      startAt: '2026-01-01',
      participationMethod: 'native_survey',
      nativeSurveyTitleMultiloc: { en: 'Survey' },
      nativeSurveyButtonMultiloc: { en: 'Take the survey' },
    }).then(({ body }) => {
      phaseId = body.data.id;
      visit(phaseId);
    });
    cy.contains('Survey setup').should('be.visible');
    cy.contains('Survey placement').should(($placement) => {
      const before = $placement[0].compareDocumentPosition(
        Cypress.$('body')
          .find('*')
          .filter((_i, el) => el.textContent === 'Survey options')[0]
      );
      expect(before & Node.DOCUMENT_POSITION_PRECEDING).to.not.eq(0);
    });
    cy.get('#native-survey-button').scrollIntoView().should('be.visible');
    cy.get('body')
      .find('button')
      .filter((_i, el) => el.textContent.trim() === 'Take the survey')
      .should('have.length', 0);
    cy.get('iframe[name="govocal-phase-preview"]').should('exist');
  });

  it('uses the combined communications heading and clear recipient/trigger copy', () => {
    ideation();
    cy.then(() => visit(phaseId));
    cy.contains('button', 'Emails and notifications').click();
    cy.contains(
      'Participants get an email and a notification when any of these happens.'
    ).should('be.visible');
    cy.contains('To participants who follow the idea, when someone comments')
      .scrollIntoView()
      .should('be.visible');
  });
});
