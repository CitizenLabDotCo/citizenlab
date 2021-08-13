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
  let projectSlug: string;
  let eventId: string;

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
        projectSlug = project.body.data.attributes.slug;

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
          startDate: new Date('2022-04-04'),
          endDate: new Date('2022-05-05'),
        });
      })
      .then((event) => {
        eventId = event.body.data.id;
      });
  });

  it('does not have event in viewport without parameter', () => {
    cy.visit(`/projects/${projectSlug}`);
    cy.wait(8000);

    cy.get(`#${eventId}`).notIntersectsViewport();
  });

  it('does have event in viewport with parameter', () => {
    cy.visit(`/projects/${projectSlug}?scrollToEventId=${eventId}`);
    cy.wait(8000);

    cy.get(`#${eventId}`).intersectsViewport();
  });
});
