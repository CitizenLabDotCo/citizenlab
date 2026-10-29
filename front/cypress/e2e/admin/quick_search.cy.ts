import { addMonths, format, subMonths } from 'date-fns';

import { randomString } from '../../support/commands';

describe('Admin quick search', () => {
  const projectTitle = randomString();
  const phaseTitle = randomString();
  let projectId: string;
  let phaseId: string;

  before(() => {
    cy.apiCreateProject({ title: projectTitle })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: phaseTitle,
          startAt: format(subMonths(new Date(), 1), 'dd/MM/yyyy'),
          endAt: format(addMonths(new Date(), 1), 'dd/MM/yyyy'),
          participationMethod: 'information',
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('finds a phase by its project and phase titles and opens it', () => {
    cy.visit('/admin/dashboard/overview');
    cy.dataCy('e2e-quick-search-button').click();

    cy.dataCy('e2e-quick-search-input')
      .find('input')
      .type(`${projectTitle} ${phaseTitle}`);
    cy.dataCy('e2e-quick-search-results').should('contain', phaseTitle);
    cy.dataCy('e2e-quick-search-input').find('input').type('{enter}');

    cy.location('pathname').should(
      'include',
      `/admin/projects/${projectId}/phases/${phaseId}`
    );
  });

  it('opens with the keyboard shortcut and shows recently visited pages', () => {
    cy.visit('/admin/settings/branding');
    cy.get('#e2e-settings-container');
    cy.visit('/admin/dashboard/overview');
    cy.get('#e2e-dashboard-container');

    cy.get('body').type('{ctrl}k');

    cy.dataCy('e2e-quick-search-results').should('contain', 'Branding');
  });
});
