import { randomString } from '../../support/commands';

describe('Idea button and tab behaviour in timeline project with multiple ideation phases', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let firstPhaseId: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser()
      .then((user) => {
        return cy.apiCreateProject({
          type: 'timeline',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'published',
          assigneeId: user.body.data.id,
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: 'Ideation phase 1',
          startAt: '2018-03-01',
          endAt: '2025-01-01',
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
        });
      })
      .then((phase) => {
        firstPhaseId = phase.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: 'Budgeting phase 1',
          startAt: '2025-01-02',
          endAt: '2025-01-25',
          participationMethod: 'voting',
          canComment: true,
          canPost: true,
          canReact: true,
          description: 'description',
          votingMaxTotal: 400,
          votingMethod: 'budgeting',
        });
      });
  });

  it('shows the correct "Add an input" button', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.contains('Add an input').should('exist');
    cy.get('#e2e-new-idea').click({ force: true });
    cy.contains('Ideation phase 1').should('exist');
    cy.contains('Budgeting phase 1').should('exist');
  });

  it('shows input manager tab', () => {
    cy.get('#e2e-projects-admin-container').within(() => {
      cy.contains('Input manager').should('exist');
    });
  });

  it('checks that "Add an input" button redirects to correct URL', () => {
    cy.contains('Add an input').should('exist');
    cy.get('#e2e-new-idea').click({ force: true });
    cy.contains('Ideation phase 1').should('exist');
    cy.contains('Budgeting phase 1').should('exist');
    cy.contains('Ideation phase 1').click();

    // Check URL includes phase id
    cy.url().should('include', `/projects/${projectSlug}/ideas/new`);
    cy.url().should('contain', `phase_id=${firstPhaseId}`);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Idea button and tab behaviour in timeline project with one ideation phase', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser()
      .then((user) => {
        return cy.apiCreateProject({
          type: 'timeline',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'published',
          assigneeId: user.body.data.id,
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: 'Ideation phase 1',
          startAt: '2018-03-01',
          endAt: '2025-01-01',
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });
  });

  it('shows the correct "Add an idea" button', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.contains('Add an idea').should('exist');
  });

  it('shows input manager tab', () => {
    cy.get('#e2e-projects-admin-container').within(() => {
      cy.contains('Input manager').should('exist');
    });
  });

  it('checks that "Add an idea" button redirects to correct URL', () => {
    cy.get('#e2e-new-idea').click();

    // Check URL includes phase id
    cy.url().should('include', `/projects/${projectSlug}/ideas/new`);
    cy.url().should('contain', `phase_id=${phaseId}`);
  });
  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Idea button and tab behaviour in timeline project with no ideation phase', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser()
      .then((user) => {
        return cy.apiCreateProject({
          type: 'timeline',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'published',
          assigneeId: user.body.data.id,
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: 'Poll phase 1',
          startAt: '2018-03-01',
          endAt: '2025-01-01',
          participationMethod: 'poll',
          canComment: true,
          canPost: true,
          canReact: true,
        });
      });
  });

  it('shows no "Add an idea" button', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.contains('Add an idea').should('not.exist');
  });

  it('shows no input manager tab', () => {
    cy.get('#e2e-projects-admin-container').within(() => {
      cy.contains('Input manager').should('not.exist');
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Idea button and tab behaviour in continuous project with no ideation phase', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser()
      .then(() => {
        return cy.apiCreateProject({
          type: 'continuous',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'published',
          participationMethod: 'poll',
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
      });
  });

  it('shows no "Add an idea" button', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.contains('Add an idea').should('not.exist');
  });

  it('shows no input manager tab', () => {
    cy.get('#e2e-projects-admin-container').within(() => {
      cy.contains('Input manager').should('not.exist');
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Idea button and tab behaviour in continuous project with ideation phase', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser()
      .then(() => {
        return cy.apiCreateProject({
          type: 'continuous',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'published',
          participationMethod: 'ideation',
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
      });
  });

  it('shows the correct "Add an idea" button', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.contains('Add an idea').should('exist');
  });

  it('shows input manager tab', () => {
    cy.get('#e2e-projects-admin-container').within(() => {
      cy.contains('Input manager').should('exist');
    });
  });

  it('checks that "Add an idea" button redirects to correct URL', () => {
    cy.get('#e2e-new-idea').click();

    // Check that URL does not include phase id
    cy.url().should('include', `/projects/${projectSlug}/ideas/new`);
    cy.url().should('not.contain', 'phase_id');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Idea button and tab behaviour in continuous project with budgeting phase', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser()
      .then((user) => {
        return cy.apiCreateProject({
          type: 'continuous',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'published',
          assigneeId: user.body.data.id,
          participationMethod: 'voting',
          votingMethod: 'budgeting',
          votingMaxTotal: 400,
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
      });
  });

  it('shows the correct "Add an idea" button', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.contains('Add an idea').should('exist');
  });

  it('shows input manager tab', () => {
    cy.get('#e2e-projects-admin-container').within(() => {
      cy.contains('Input manager').should('exist');
    });
  });

  it('checks that "Add an idea" button redirects to correct URL', () => {
    cy.get('#e2e-new-idea').click();

    // Check that URL does not include phase id
    cy.url().should('include', `/projects/${projectSlug}/ideas/new`);
    cy.url().should('not.contain', 'phase_id');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
