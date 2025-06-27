describe('Submit community monitor survey', () => {
  let communityMonitorProjectId: string;
  let communityMonitorPhaseId: string;

  before(() => {
    cy.setAdminLoginCookie();
    cy.apiGetCommunityMonitorProject().then((project) => {
      communityMonitorProjectId = project.body.data.id;
      cy.getProjectById(communityMonitorProjectId).then((project) => {
        communityMonitorPhaseId =
          project.body.data.relationships.current_phase.data.id;

        cy.apiEditPhase({
          phaseId: communityMonitorPhaseId,
          submission_enabled: true,
          user_fields_in_form: false,
        });
      });
    });
  });

  beforeEach(() => {
    cy.setConsentAndAdminLoginCookies();
    // Confirm access rights are set to Anyone for the community monitor
    cy.visit(`admin/community-monitor/settings/access-rights`);
    cy.get('#e2e-permission-anyone').should('be.visible');
    cy.get('#e2e-permission-anyone').click({ force: true });
    cy.contains('No actions are required to participate').should('be.visible');
  });

  it('can be submitted by an admin user', () => {
    cy.visit(
      `projects/community-monitor/surveys/new?phase_id=${communityMonitorPhaseId}`
    );

    // First default question
    cy.contains('City as a place to live').should('exist');

    // Select first question
    cy.get('#place_to_live-linear-scale-option-1').click();

    cy.dataCy('e2e-next-page').should('be.visible').click({ force: true });
    cy.wait(2000);
    cy.contains('Service delivery').should('be.visible');
    cy.dataCy('e2e-next-page').should('be.visible').click({ force: true });
    cy.wait(2000);
    cy.contains('Governance and trust').should('be.visible');
    cy.wait(4000);

    // save the form
    cy.dataCy('e2e-submit-form').should('be.visible');
    cy.dataCy('e2e-submit-form').click({ force: true });
    cy.wait(2000);

    // Confirm submissions was successful
    cy.dataCy('e2e-after-submission').should('exist');
  });

  it('can be submitted by a logged out user by default', () => {
    cy.clearAllCookies();
    cy.setConsentCookie();

    cy.visit(
      `projects/community-monitor/surveys/new?phase_id=${communityMonitorPhaseId}`
    );

    // First default question
    cy.contains('City as a place to live').should('exist');

    // Select first question
    cy.get('#place_to_live-linear-scale-option-1').click();

    // Go to last page
    cy.dataCy('e2e-next-page').should('be.visible').click({ force: true });
    cy.wait(2000);
    cy.contains('Service delivery').should('be.visible');
    cy.dataCy('e2e-next-page').should('be.visible').click({ force: true });
    cy.wait(2000);
    cy.contains('Governance and trust').should('be.visible');
    cy.wait(4000);

    // save the form
    cy.dataCy('e2e-submit-form').should('be.visible');
    cy.dataCy('e2e-submit-form').click({ force: true });
    cy.wait(2000);

    // Confirm submissions was successful
    cy.dataCy('e2e-after-submission').should('exist');
  });

  it('cannot be submitted by a logged out user if permissions require registration', () => {
    cy.setConsentAndAdminLoginCookies();

    // Change the access rights to email confirmation for the community monitor
    cy.visit(`admin/community-monitor/settings/access-rights`);
    cy.get('#e2e-permission-email-confirmed-users').should('be.visible');
    cy.get('#e2e-permission-email-confirmed-users').click({ force: true });
    cy.contains('Confirm your email').should('be.visible');

    // Go to community monitor survey form as logged out user
    cy.clearAllCookies();
    cy.setConsentCookie();
    cy.visit(
      `projects/community-monitor/surveys/new?phase_id=${communityMonitorPhaseId}`
    );

    // Authentication modal should pop up
    cy.get('#e2e-authentication-modal').should('be.visible');
  });
});

describe('Edit community monitor survey', () => {
  let communityMonitorProjectId: string;
  let communityMonitorPhaseId: string;
  let communityMonitorEditSurveyUrl: string;

  before(() => {
    cy.setAdminLoginCookie();
    cy.apiGetCommunityMonitorProject().then((project) => {
      communityMonitorProjectId = project.body.data.id;
      cy.getProjectById(communityMonitorProjectId).then((project) => {
        communityMonitorPhaseId =
          project.body.data.relationships.current_phase.data.id;
        communityMonitorEditSurveyUrl = `admin/community-monitor/projects/${communityMonitorProjectId}/phases/${communityMonitorPhaseId}/survey/edit`;
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('is initially populated by the default survey questions', () => {
    cy.visit(communityMonitorEditSurveyUrl);
    cy.contains('City as a place to live').should('exist'); // First default question
    cy.contains('Transparency about how municipal tax money is spent').should(
      // Last default question
      'exist'
    );
  });

  it('can add new questions to existing categories', () => {
    cy.visit(communityMonitorEditSurveyUrl);

    // Add a sentiment question
    cy.dataCy('e2e-sentiment');
    cy.wait(2000);
    cy.dataCy('e2e-sentiment').click();

    cy.get('#e2e-title-multiloc').type('New custom question', { force: true });

    cy.intercept('PATCH', '**/custom_fields/update_all').as('updateAll');

    // Save the survey
    cy.get('form').submit();
    cy.wait('@updateAll').then((interception) => {
      console.log({ interception });

      // Get the custom fields from the response
      const customFields = interception.response?.body.data;

      // Get the newly added question
      const newCustomField = customFields[customFields.length - 2]; // Gets last question before the "form_end" page

      // Check that the new question is in the correct category
      expect(newCustomField.attributes).to.have.property(
        'question_category',
        'governance_and_trust'
      );
    });
  });

  it('can add new pages with custom questions (assigned "other" category)', () => {
    cy.visit(communityMonitorEditSurveyUrl);

    // Add a new page
    cy.dataCy('e2e-page');
    cy.wait(2000);
    cy.dataCy('e2e-page').click();

    // Add a sentiment question
    cy.dataCy('e2e-sentiment');
    cy.wait(2000);
    cy.dataCy('e2e-sentiment').click();

    cy.get('#e2e-title-multiloc').type('New custom question', { force: true });

    cy.intercept('PATCH', '**/custom_fields/update_all').as('updateAll');

    // Save the survey
    cy.get('form').submit();
    cy.wait('@updateAll').then((interception) => {
      console.log({ interception });

      // Get the custom fields from the response
      const customFields = interception.response?.body.data;

      // Get the newly added question
      const newCustomField = customFields[customFields.length - 2]; // Gets last question before the "form_end" page

      // Check that the new question is in the correct category
      expect(newCustomField.attributes).to.have.property(
        'question_category',
        'other'
      );
    });
  });
});
