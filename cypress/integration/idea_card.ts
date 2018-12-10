describe('Idea card component', () => {
  beforeEach(() => {
    cy.visit('projects/an-idea-bring-it-to-your-council/ideas');
  });

  describe('Continuous project', () => {

    describe('The idea is upvoted', () => {
      it('reduces the upvotes count by 1 when the upvote button is clicked again', () => {
        // click upvote button of first idea card
        cy.get('#e2e-ideas-list')
        .find('.e2e-idea-card')
        .first()
        .find('.e2e-vote-controls')
        .find('.e2e-ideacard-upvote-button')
        .click();
      });

      it('reduces the upvotes count and increases the downvote by 1 count when the downvote button is clicked', () => {
      });
    });

    describe('The idea is downvoted', () => {
      it('reduces the downvotes count by 1 when the downvote button is clicked again', () => {
      });

      it('reduces the downvotes count and increases the upvote by 1 count when the upvote button is clicked', () => {
      });
    });

    describe('A comment is posted', () => {
      it('increases the comments count by 1 when a parent comment is posted', () => {
      });

      it('decreases the comments count by 1 when a parent comment is deleted', () => {
      });

      it('increases the comments count by 1 when a child comment is posted', () => {
      });

      it('decreases the comments count by 1 when a child comment is deleted', () => {
      });
    });
  });

});
