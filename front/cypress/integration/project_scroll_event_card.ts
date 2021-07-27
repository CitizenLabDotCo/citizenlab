import { randomString, randomEmail } from '../support/commands';

describe('?scrollEventId parameter on project page', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);
  let projectId: string;
  let ideaId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password)
      .then(() => {
        cy.apiLogin(email, password);
      })
      .then(() => {
        return cy.apiCreateProject({
          type: 'timeline',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'published',
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase(
          projectId,
          'phaseTitle',
          '2018-03-01',
          '2025-01-01',
          'ideation',
          true,
          true,
          true
        );
      })
      .then(() => {
        return cy.apiCreatePhase(
          projectId,
          'phaseTitle',
          '2025-01-02',
          '2025-01-25',
          'ideation',
          true,
          true,
          true
        );
      })
      .then(() => {
        return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
      })
      .then(() => {
        return cy.apiCreateEvent({
          projectId,
          title: 'Some event',
          location: 'Some location',
          description: 'This is some event',
          startDate: new Date(),
          endDate: new Date(),
        });
      });
  });
});
