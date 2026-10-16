import { randomEmail, randomString } from '../../../support/commands';
import {
  createModeratorForSpace,
  createSpace,
  removeSpace,
} from '../../../support/spaces';

type Setting = { allowed: boolean; enabled: boolean };

describe('Projects hierarchy', () => {
  const spaceTitle = randomString(12);
  const folderTitle = randomString(12);
  // Named so they sort A, B, M by title.
  const liveTitle = `A ${randomString(10)}`;
  const draftTitle = `B ${randomString(10)}`;
  const movedTitle = `M ${randomString(10)}`;
  const managerEmail = randomEmail();
  const managerPassword = 'democracy2.0';

  let spaceId: string;
  let folderId: string;
  const projectIds: string[] = [];
  let redesignBefore: Setting | undefined;
  let spacesBefore: Setting | undefined;

  const setFlags = (redesign: Setting, spaces: Setting) =>
    cy.apiUpdateAppConfiguration({
      settings: { project_backoffice_redesign: redesign, spaces },
    });

  const visitFolder = (view = 'grid') => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects?folder_id=${folderId}&view_mode=${view}`);
  };

  const cards = () => cy.get('[data-cy="projects-hierarchy-card"]');
  const rows = () => cy.get('[data-cy="projects-hierarchy-row"]');
  const menuItem = (label: string) => cy.contains('[role="menuitem"]', label);

  // Cypress presses a button the moment it moves onto it. The button's tooltip
  // opens on that hover and, for that moment, sits over the button, so the
  // press lands on the tooltip. Hovering in a step of its own gives the
  // tooltip the time to move beside the button.
  const clickWithTooltip = (
    button: () => Cypress.Chainable<JQuery<HTMLElement>>
  ) => {
    button().trigger('mouseenter');
    button().click();
  };

  before(() => {
    cy.apiGetAppConfiguration().then((config) => {
      const { settings } = config.body.data.attributes;
      redesignBefore = settings.project_backoffice_redesign;
      spacesBefore = settings.spaces;
    });
    setFlags(
      { allowed: true, enabled: true },
      { allowed: true, enabled: true }
    );

    createSpace({ title: spaceTitle }).then((space) => {
      spaceId = space.body.data.id;

      cy.apiCreateFolder({ title: folderTitle, spaceId }).then((folder) => {
        folderId = folder.body.data.id;

        [
          { title: liveTitle, publicationStatus: 'published' as const },
          { title: draftTitle, publicationStatus: 'draft' as const },
          { title: movedTitle, publicationStatus: 'published' as const },
        ].forEach((project) => {
          cy.apiCreateProject({ ...project, folderId }).then((response) => {
            projectIds.push(response.body.data.id);
          });
        });

        createModeratorForSpace({
          firstName: 'Space',
          lastName: 'Manager',
          email: managerEmail,
          password: managerPassword,
          spaceId,
        });
      });
    });
  });

  after(() => {
    projectIds.forEach((id) => cy.apiRemoveProject(id));
    cy.apiRemoveFolder(folderId);
    removeSpace(spaceId);
    setFlags(
      redesignBefore ?? { allowed: false, enabled: false },
      spacesBefore ?? { allowed: false, enabled: false }
    );
  });

  it('opens a space and a folder, and goes back through the breadcrumbs', () => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects');

    cy.contains('[data-cy="projects-hierarchy-tile"] a', spaceTitle).click();
    cy.get('[data-cy="projects-hierarchy-breadcrumbs"] h2').should(
      'have.text',
      spaceTitle
    );

    cy.contains('[data-cy="projects-hierarchy-tile"] a', folderTitle).click();
    cy.get('[data-cy="projects-hierarchy-breadcrumbs"] h2').should(
      'have.text',
      folderTitle
    );
    cards().should('have.length', 3);

    cy.contains(
      '[data-cy="projects-hierarchy-breadcrumbs"] a',
      spaceTitle
    ).click();
    cy.get('[data-cy="projects-hierarchy-breadcrumbs"] h2').should(
      'have.text',
      spaceTitle
    );

    cy.contains(
      '[data-cy="projects-hierarchy-breadcrumbs"] a',
      'Projects'
    ).click();
    cy.get('[data-cy="projects-hierarchy-breadcrumbs"]').should('not.exist');
    cy.contains('[data-cy="projects-hierarchy-tile"] a', spaceTitle).should(
      'exist'
    );
  });

  it('switches between grid, list and calendar', () => {
    visitFolder();
    cards().should('have.length', 3);

    clickWithTooltip(() => cy.dataCy('projects-hierarchy-view-list'));
    rows().should('have.length', 3);
    cy.dataCy('projects-hierarchy-grid').should('not.exist');

    clickWithTooltip(() => cy.dataCy('projects-hierarchy-view-calendar'));
    cy.dataCy('projects-hierarchy-view-calendar').should(
      'have.attr',
      'aria-pressed',
      'true'
    );
    cy.dataCy('projects-hierarchy-list').should('not.exist');
    cy.dataCy('projects-hierarchy-grid').should('not.exist');
  });

  it('filters by status, and clears the filter', () => {
    visitFolder();
    cards().should('have.length', 3);

    clickWithTooltip(() => cy.dataCy('projects-hierarchy-filter-button'));
    menuItem('Status').click();
    cy.contains('[role="menuitemcheckbox"]', 'Draft').click();

    cy.dataCy('projects-hierarchy-filter-chips').should('contain', 'Draft');
    cards().should('have.length', 1).and('contain', draftTitle);

    cy.contains(
      '[data-cy="projects-hierarchy-filter-chips"] button',
      'Clear'
    ).click();
    cy.dataCy('projects-hierarchy-filter-chips').should('not.exist');
    cards().should('have.length', 3);
  });

  it('adds a column, and sorts the projects by title', () => {
    visitFolder('list');
    rows().should('have.length', 3);

    clickWithTooltip(() => cy.dataCy('projects-hierarchy-add-columns'));
    cy.contains('[role="menuitemcheckbox"]', 'Start').click();
    cy.get('body').type('{esc}');
    cy.contains('th', 'Start').should('exist');

    clickWithTooltip(() => cy.contains('th button', 'Project'));
    rows().first().should('contain', liveTitle);
    rows().last().should('contain', movedTitle);

    clickWithTooltip(() => cy.contains('th button', 'Project'));
    rows().first().should('contain', movedTitle);
    rows().last().should('contain', liveTitle);
  });

  it('moves a project out of its folder, and back with Undo', () => {
    visitFolder();
    cards().should('have.length', 3);

    clickWithTooltip(() =>
      cy
        .contains('[data-cy="projects-hierarchy-card"]', movedTitle)
        .find('[data-cy="projects-hierarchy-more-actions"]')
    );
    menuItem('Move to').click();
    menuItem(spaceTitle).click();

    cy.contains(`Moved to ${spaceTitle}`).should('exist');
    cards().should('have.length', 2).and('not.contain', movedTitle);

    cy.contains('button', 'Undo').click();
    cards().should('have.length', 3).and('contain', movedTitle);
  });

  it('lands a space manager inside their space', () => {
    cy.setLoginCookie(managerEmail, managerPassword);
    cy.visit('/admin/projects');

    cy.get('[data-cy="projects-hierarchy-breadcrumbs"] h2').should(
      'have.text',
      spaceTitle
    );
    cy.get('[data-cy="projects-hierarchy-breadcrumbs"] a').should('not.exist');
    cy.contains('[data-cy="projects-hierarchy-tile"] a', folderTitle).should(
      'exist'
    );
  });
});
