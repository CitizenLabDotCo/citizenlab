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
