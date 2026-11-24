import { randomString } from '../../support/commands';
import { addSurveyField, waitForCustomFormFields } from './utils';

// Scattered pins around Brussels. Two of them is the smallest set that still
// proves the pins stay independent rather than being joined into a shape.
const PINS = [
  [4.35, 50.85],
  [4.36, 50.86],
];

// Nested arrays do not survive Rails strong parameters, so an answer travels
// as WKT and the API turns it back into GeoJSON. This mirrors what the form
// sends through convertGeojsonToWKT.
const PINS_WKT = `MULTIPOINT (${PINS.map(([lng, lat]) => `${lng} ${lat}`).join(
  ', '
)})`;

describe('Survey Builder - Multipoint question', () => {
  const phaseTitle = randomString();
  let questionTitle = randomString();
  let projectId: string;
  let phaseId: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
    questionTitle = randomString();

    cy.createProjectWithNativeSurveyPhase({ phaseTitle }).then((result) => {
      projectId = result.projectId;
      phaseId = result.phaseId;
    });
  });

  afterEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('saves and restores the pin count limits', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    waitForCustomFormFields();

    addSurveyField('#toolbox_multipoint');
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // The limits are opt-in, so they stay out of the panel until asked for.
    cy.dataCy('e2e-pin-count-fields').should('not.exist');
    cy.dataCy('e2e-pin-count-toggle').find('input').click({ force: true });
    // The settings panel scrolls, so the limits open below the fold.
    cy.dataCy('e2e-pin-count-fields').should('exist').scrollIntoView();

    cy.get('#minimumPinsInput').should('be.visible').type('2');
    // The maximum tracks the minimum as it is typed, so a manager cannot set
    // a ceiling below their own floor.
    cy.get('#maximumPinsInput').should('have.attr', 'min', '2');
    cy.get('#maximumPinsInput').type('4');

    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Reloading proves the three settings round-tripped through the API
    // rather than only living in the form state.
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    waitForCustomFormFields();
    cy.contains(questionTitle).click();

    cy.dataCy('e2e-pin-count-fields').should('exist').scrollIntoView();
    cy.get('#minimumPinsInput').should('have.value', '2');
    cy.get('#maximumPinsInput').should('have.value', '4');
  });

  it('plots the submitted pins on the results map', () => {
    let questionKey: string;

    cy.apiCreateSurveyQuestions(phaseId, ['page', 'multipoint'])
      .then(() => cy.apiGetSurveyFields(phaseId))
      .then((response) => {
        questionKey = response.body.data[1].attributes.key;

        return cy.apiCreateSurveyResponse({
          phase_id: phaseId,
          fields: { [questionKey]: PINS_WKT },
        });
      })
      .then((response) => {
        // The serializer merges each answer straight into `attributes` under
        // its own key, so there is no `custom_field_values` wrapper to read.
        // An answer the API quietly drops would leave the map empty, and the
        // assertions below would then pass for the wrong reason.
        expect(response.body.data.attributes[questionKey]).to.deep.equal({
          type: 'MultiPoint',
          coordinates: PINS,
        });
      });

    // The question blocks arrive with the survey results, well after the
    // engagement dashboard above them has rendered.
    cy.intercept('**/phases/**/survey_results**').as('surveyResults');
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/insights`);
    cy.wait('@surveyResults', { timeout: 60000 });

    cy.dataCy('e2e-question_multipoint').should('exist');
    cy.dataCy('e2e-multipoint-results-map').should('exist');
  });
});
