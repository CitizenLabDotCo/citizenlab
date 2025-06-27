import moment = require('moment');
import { randomString } from '../../../support/commands';

describe('Configure a project-level map', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      return cy
        .apiCreatePhase({
          projectId,
          title: 'phaseTitle',
          startAt: moment().subtract(1, 'month').toString(),
          endAt: moment().add(1, 'month').toString(),
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
        })
        .then((phase) => {
          phaseId = phase.body.data.id;
        });
    });
  });

  it('When no map configuration exists, confirm map still shows in front office', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}/?view=map`);
    cy.visit(`/projects/${projectSlug}/?view=map`);
    cy.get('#e2e-ideas-map').should('exist');
    cy.get('#e2e-ideas-map').scrollIntoView();
    cy.get('#e2e-idea-map-cards').should('exist');
    // Click on the map, and a popup should show
    cy.wait(2000);
    cy.get('#e2e-ideas-map').click('center');
    cy.wait(1000);
    // Add idea button should appear
    cy.get('#e2e-idea-from-map-button').should('exist');
  });

  it('Create a custom map configuration for the project', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/map`);
    const initialZoomValue = cy.get('#e2e-zoom-input').invoke('val');
    // Change map extent
    cy.get('.esri-zoom').dblclick();
    // Save using the map helper options
    cy.get('#e2e-save-current-extent').click();
    // Zoom text input should have changed
    cy.get('#e2e-zoom-input').invoke('val').should('not.eq', initialZoomValue);
  });

  it('Test adding Esri data', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/map`);

    // ESRI WEB MAP UPLOAD
    cy.dataCy('e2e-web-map-upload-btn').click();
    // Test invalid portal ID (error should show)
    cy.get('#e2e-portal-id-input').click().clear().type('invalidID');
    cy.dataCy('e2e-web-map-import-btn').click();
    cy.get('#e2e-web-map-error').should('exist');
    // Test valid portal id
    cy.get('#e2e-portal-id-input')
      .click()
      .clear()
      .type('ce88f9dba8d748a4bf3aa8d6c8027d2e');
    cy.dataCy('e2e-web-map-import-btn').click();
    cy.contains('Lava Flow Hazard Zones').should('exist');

    // ESRI FEATURE LAYER UPLOAD
    cy.dataCy('e2e-feature-layer-upload-btn').click();
    // Test invalid URL (error should show)
    cy.get('#e2e-feature-layer-url-input').click().clear().type('invalidURL');
    cy.dataCy('e2e-feature-layer-import-btn').click();
    cy.get('#e2e-feature-layer-error').should('exist');
    // Test valid URL
    cy.get('#e2e-feature-layer-url-input')
      .click()
      .clear()
      .type(
        'https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/Hawaii_Emergency_Shelters/FeatureServer'
      );
    cy.dataCy('e2e-feature-layer-import-btn').click();
    cy.get('#e2e-feature-layer-error').should('not.exist');
    // Confirm the layer shows up on the map (I.e. Shows on the map legend)
    cy.contains('Hawaii Emergency Shelters').should('exist');
    // Confirm the layer can be removed
    cy.dataCy('e2e-admin-layer-remove-btn').click();
    cy.dataCy('e2e-admin-layer-remove-btn').should('not.exist');
    cy.contains('Hawaii Emergency Shelters').should('not.exist');

    // Change the map extent using the text inputs
    cy.get('#e2e-lat-input').click().clear().type('19.57052687930846');
    cy.get('#e2e-long-input').click().clear().type('-155.43749915024694');
    cy.get('#e2e-zoom-input').click().clear().type('9');
    cy.dataCy('e2e-map-extent-save-btn').click();
    cy.wait(2000);
    cy.get('#e2e-map-config-error').should('not.exist');
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });
});
