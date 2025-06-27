import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Admin: project input manager', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('navigates to the project tags when the user clicks "Edit tags" in the tags tab', () => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
    }).then((project) => {
      const projectId = project.body.data.id;

      cy.apiCreatePhase({
        projectId,
        title: 'phase 1',
        startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
        endAt: moment().subtract(3, 'month').format('DD/MM/YYYY'),
        participationMethod: 'ideation',
      }).then((phase) => {
        const phaseId = phase.body.data.id;

        cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/ideas`);
        cy.dataCy('e2e-admin-post-manager-filter-sidebar-topics').click();
        cy.dataCy('e2e-post-manager-topic-filters-edit-tags').click();

        cy.location('pathname').should(
          'eq',
          `/en/admin/projects/${projectId}/settings/tags`
        );
      });
    });
  });
});
