import moment = require('moment');
import { randomString } from '../support/commands';

describe('Project and folder cards on front page', () => {
  const publishedProjectTitle = randomString();
  const publishedProjectDescriptionPreview = randomString(30);
  let publishedProjectId: string;

  const archivedProjectTitle = randomString();
  const archivedProjectDescriptionPreview = randomString(30);
  let archivedProjectId: string;

  before(() => {
    cy.apiCreateProject({
      title: publishedProjectTitle,
      descriptionPreview: publishedProjectDescriptionPreview,
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      publishedProjectId = project.body.data.id;
    });

    cy.apiCreateProject({
      title: archivedProjectTitle,
      descriptionPreview: archivedProjectDescriptionPreview,
      description: randomString(),
      publicationStatus: 'archived',
    }).then((project) => {
      archivedProjectId = project.body.data.id;
    });
  });

  beforeEach(() => {
    cy.goToLandingPage();
    cy.acceptCookies();
  });

  it('shows published project but not archived project if tab === Active', () => {
    cy.get('#project-cards-tab-published').should('exist');
    cy.get('.e2e-project-card').first().contains(publishedProjectTitle);

    cy.get('#e2e-projects-container').should(
      'contain.text',
      publishedProjectTitle
    );

    cy.get('#e2e-projects-container').should(
      'not.contain.text',
      archivedProjectTitle
    );
  });

  it.skip('shows archived project but not published project if tab === Archived', () => {
    cy.get('#project-cards-tab-archived').click();

    cy.get('.e2e-project-card').first().contains(archivedProjectTitle);

    cy.get('#e2e-projects-container').should(
      'not.contain.text',
      publishedProjectTitle
    );

    cy.get('#e2e-projects-container').should(
      'contain.text',
      archivedProjectTitle
    );
  });

  it('shows both published and archived project if tab === All', () => {
    cy.get('#project-cards-tab-all').click();

    cy.get('#e2e-projects-container').should(
      'contain.text',
      publishedProjectTitle
    );

    cy.get('#e2e-projects-container').should(
      'contain.text',
      archivedProjectTitle
    );
  });

  after(() => {
    cy.apiRemoveProject(publishedProjectId);
    cy.apiRemoveProject(archivedProjectId);
  });
});

describe('Native survey project card', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      cy.apiCreatePhase({
        projectId,
        title: 'surveyPhaseTitle',
        startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
        endAt: moment().add(1, 'month').format('DD/MM/YYYY'),
        participationMethod: 'native_survey',
        nativeSurveyButtonMultiloc: { en: 'Take the survey' },
        nativeSurveyTitleMultiloc: { en: 'Survey' },
        canPost: true,
        canComment: true,
        canReact: true,
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/`);
    cy.acceptCookies();
  });

  it('Correct CTA button on card is shown', () => {
    const cardCTA = cy
      .get('.e2e-project-card')
      .first()
      .contains('Take the survey');
    cardCTA.should('exist');
    cardCTA.click({ force: true });
    cy.url().should('include', `/projects/${projectSlug}`);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
