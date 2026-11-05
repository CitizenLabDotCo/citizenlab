export const fillOutTitleAndBody = (
  cy: any,
  { title, body }: { title: string; body: string }
) => {
  // add a title and description
  cy.get('#title_multiloc ').click().type(title, { delay: 0 });

  cy.dataCy('e2e-next-page').should('be.visible').click();

  cy.get('#body_multiloc .ql-editor').type(body);

  // Go to the next page of the idea form
  cy.dataCy('e2e-next-page').should('be.visible').click();
};
