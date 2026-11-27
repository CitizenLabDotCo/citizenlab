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
  let projectSlug: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
    questionTitle = randomString();

    cy.createProjectWithNativeSurveyPhase({ phaseTitle }).then((result) => {
      projectId = result.projectId;
      phaseId = result.phaseId;
      projectSlug = result.projectSlug;
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

    // The limits need no opting in, but the settings panel scrolls, so they
    // sit below the fold.
    cy.dataCy('e2e-pin-count-fields').should('exist').scrollIntoView();

    cy.get('#minimumPinsInput').should('be.visible').type('2');
    // The maximum tracks the minimum as it is typed, so a manager cannot set
    // a ceiling below their own floor.
    cy.get('#maximumPinsInput').should('have.attr', 'min', '2');
    cy.get('#maximumPinsInput').type('4');

    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Reloading proves both limits round-tripped through the API rather than
    // only living in the form state.
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    waitForCustomFormFields();
    cy.contains(questionTitle).click();

    cy.dataCy('e2e-pin-count-fields').should('exist').scrollIntoView();
    cy.get('#minimumPinsInput').should('have.value', '2');
    cy.get('#maximumPinsInput').should('have.value', '4');
  });

  it('saves a question with no pin count limits', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    waitForCustomFormFields();

    addSurveyField('#toolbox_multipoint');
    cy.get('#e2e-title-multiloc').type(questionTitle);

    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Empty limits are sent as null against a field that still reports its
    // limits as enabled, which the API accepts only in that combination.
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    waitForCustomFormFields();
    cy.contains(questionTitle).click();

    cy.dataCy('e2e-pin-count-fields').should('exist').scrollIntoView();
    cy.get('#minimumPinsInput').should('have.value', '');
    cy.get('#maximumPinsInput').should('have.value', '');
  });

  it('adds locations by address and removes one by its own row', () => {
    // Two places far enough apart to be told apart by their coordinates, so a
    // row can be checked against the address it was given.
    const QUAY = { typed: 'Quay', address: '12 Quay Street, Westmere' };
    const PARK = { typed: 'Park', address: '34 Park Lane, Westmere' };
    const PLACES = [
      { ...QUAY, lat: 50.85, lng: 4.35 },
      { ...PARK, lat: 50.86, lng: 4.36 },
    ];

    // The geocoder is a third party. Stubbing it keeps the test about the rows
    // and off the network, and lets each address keep its own coordinates:
    // two pins on one spot would share a row address.
    cy.intercept('GET', '**/web_api/v1/location/autocomplete*', (request) => {
      const input = new URL(request.url).searchParams.get('input');
      const place = PLACES.find(({ typed }) => typed === input);

      request.reply({
        body: {
          data: {
            type: 'autocomplete',
            attributes: { results: place ? [place.address] : [] },
          },
        },
      });
    });

    cy.intercept('GET', '**/web_api/v1/location/geocode*', (request) => {
      const address = new URL(request.url).searchParams.get('address');
      const place = PLACES.find((place) => place.address === address);

      request.reply({
        body: {
          data: {
            type: 'geocode',
            attributes: { location: { lat: place?.lat, lng: place?.lng } },
          },
        },
      });
    });

    // A picked address is kept against its own coordinates, so no row should
    // ever need this. It is stubbed to keep a miss off the real geocoder.
    cy.intercept('GET', '**/web_api/v1/location/reverse_geocode*', {
      body: {
        data: {
          type: 'reverse_geocode',
          attributes: { formatted_address: 'Looked up, not picked' },
        },
      },
    });

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    waitForCustomFormFields();

    addSurveyField('#toolbox_multipoint');
    cy.get('#e2e-title-multiloc').type(questionTitle);
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    cy.visit(`/projects/${projectSlug}/surveys/new/${phaseId}`);
    cy.contains(questionTitle).should('exist');

    // Nothing has been added yet, so the only row is the empty one waiting for
    // the first location.
    cy.dataCy('e2e-pin-address-row').should('have.length', 1);

    // Picking an address fills the row it was picked in and offers the next
    // one, and the row keeps the address as it was picked.
    pickAddress(0, QUAY);
    cy.dataCy('e2e-pin-address-row').should('have.length', 2);
    cy.dataCy('e2e-pin-address-row').eq(0).should('contain', QUAY.address);

    pickAddress(1, PARK);
    cy.dataCy('e2e-pin-address-row').should('have.length', 3);
    cy.dataCy('e2e-pin-address-row').eq(1).should('contain', PARK.address);

    // The trash button takes off the location of its own row, and the one
    // below moves up to take its number.
    cy.dataCy('e2e-pin-address-row').eq(0).find('button').click();
    cy.dataCy('e2e-pin-address-row').should('have.length', 2);
    cy.dataCy('e2e-pin-address-row').eq(0).should('contain', PARK.address);

    // Taking the last one off leaves the empty row behind
    cy.dataCy('e2e-pin-address-row').eq(0).find('button').click();
    cy.dataCy('e2e-pin-address-row').should('have.length', 1);
    cy.dataCy('e2e-pin-address-row')
      .eq(0)
      .should('contain', 'Enter an address');
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

// Types into the address field of one row and takes the suggestion it offers.
// The field only accepts a place it was offered, so the pin lands on whatever
// the geocoder answers for that address.
const pickAddress = (
  row: number,
  { typed, address }: { typed: string; address: string }
) => {
  cy.dataCy('e2e-pin-address-row').eq(row).find('input').first().type(typed);
  // By role, because the address also appears in the hidden live region the
  // suggestions are announced through, which cannot be clicked.
  cy.get('[role="option"]').contains(address).click();
};
