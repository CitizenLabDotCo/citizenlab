import { randomString } from '../support/commands';

describe('Project overview page', () => {
  const projectTitleOne = randomString(12);
  const projectTitleTwo = randomString(12);
  const projectTitleThree = randomString(12);
  const projectTitleFour = randomString(12);
  const folderTitle = randomString(12);

  // body content
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitleOne,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    });
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitleTwo,
      descriptionPreview: projectDescriptionPreview,
      description: projectTitleThree,
      publicationStatus: 'published',
    });
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitleThree,
      descriptionPreview: projectDescriptionPreview,
      description: projectTitleTwo,
      publicationStatus: 'published',
    });
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitleFour,
      descriptionPreview: projectDescriptionPreview,
      description: projectTitleTwo,
      publicationStatus: 'archived',
    });
    cy.apiCreateFolder({
      type: 'continuous',
      title: folderTitle,
      descriptionPreview: randomString(30),
      description: randomString(),
      publicationStatus: 'published',
    });
  });

  it('shows 6 projects by default and loads more when the show more button is pressed', () => {
    cy.intercept('GET', '**/admin_publications**').as('getAdminPublications')
    
    cy.visit('/projects/');

    cy.get('#e2e-projects-container');
    cy.wait('@getAdminPublications').then(interception => {
      console.log(interception);
    });
    cy.get('.e2e-projects-list');

    cy.acceptCookies();
    cy.wait(500);

   

    const initialCards = cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    );

    initialCards.should('have.length', 6);

    cy.get('.e2e-project-cards-show-more-button').click();
    cy.wait(50);
    cy.get('.e2e-project-cards-show-more-button').should(
      'not.have.class',
      'loading'
    );

    const cardsAfterShowMore = cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    );

    cardsAfterShowMore.should('have.length.at.least', 7);
  });

  it('shows the filtered projects based on the search input', () => {
    cy.intercept('GET', '**/admin_publications**').as('getAdminPublications')

    cy.visit('/projects/');

    cy.get('#e2e-projects-container');
    cy.get('.e2e-projects-list');

    cy.acceptCookies();

    cy.get('#search-input').type(projectTitleOne);

    cy.wait('@getAdminPublications').then(interception => {
      console.log(interception);
    });

    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 1);

    cy.get('#search-input').clear().type(projectTitleTwo);

    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 2);

    cy.get('#project-cards-tab-archived').click();

    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 1);

    cy.get('#project-cards-tab-all').click();

    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 3);

    cy.get('#search-input').clear().type(folderTitle);

    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 1);
  });
});
