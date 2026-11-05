import { randomEmail, randomString } from '../../support/commands';

// Behaviour tests for the smart-group "Email / is one of" rule, which takes a
// pasted list of addresses instead of a single value.
//
// Coverage:
//  - a pasted list (commas and newlines mixed) matches exactly the users whose
//    address is on it, ignoring casing and addresses nobody uses;
//  - entries that are not email addresses are reported back to the manager;
//  - switching to the opposite predicate keeps the list, which would otherwise
//    be retyped for no reason.
//
// The matching users are created through the API so their addresses are known
// and stable, rather than relying on the seeded e2e template.
describe('Smart group "Email is one of" rule', () => {
  const memberEmail = randomEmail();
  const otherMemberEmail = randomEmail();
  const nonMemberEmail = randomEmail();
  const unusedEmail = randomEmail();

  const userIds: string[] = [];
  let groupId: string | undefined;

  const signUp = (email: string) =>
    cy
      .apiSignup(randomString(), randomString(), email, randomString(12))
      .then((response) => {
        userIds.push(response.body.data.id);
      });

  before(() => {
    signUp(memberEmail);
    signUp(otherMemberEmail);
    signUp(nonMemberEmail);
  });

  after(() => {
    if (groupId) cy.apiRemoveSmartGroup(groupId);
    userIds.forEach((userId) => cy.apiRemoveUser(userId));
  });

  // Opens the create-smart-group modal on the email list rule, ready for a
  // list to be pasted into the value textarea.
  const openEmailListRule = () => {
    cy.setAdminLoginCookie();
    cy.visit('/en/admin/users/groups');

    cy.get('.e2e-create-group-button').click();
    cy.get('.e2e-create-rules-group-button').click();

    cy.get('.e2e-rules-field-section').find('select').eq(0).select('Email');
    cy.get('.e2e-rules-field-section').find('select').eq(1).select('is one of');
  };

  it('reports entries that are not email addresses', () => {
    openEmailListRule();

    cy.get('.e2e-rules-field-section')
      .find('textarea')
      .type(`${memberEmail}, not-an-address`);

    cy.get('.e2e-rules-field-section').should(
      'contain.text',
      '1 entry is not a valid email address'
    );
  });

  it('keeps the list when switching to "is not one of"', () => {
    openEmailListRule();

    cy.get('.e2e-rules-field-section')
      .find('textarea')
      .type(`${memberEmail}{enter}${otherMemberEmail}`, { delay: 0 });

    cy.get('.e2e-rules-field-section')
      .find('select')
      .eq(1)
      .select('is not one of');

    cy.get('.e2e-rules-field-section')
      .find('textarea')
      .should('have.value', `${memberEmail}\n${otherMemberEmail}`);
  });

  it('adds exactly the users whose address is on the pasted list', () => {
    const groupName = randomString(12);

    cy.intercept('POST', '**/web_api/v1/groups').as('createGroup');

    openEmailListRule();

    cy.get('#group-title-field').type(groupName, { delay: 0 });
    // Mixed separators and casing: a pasted list is rarely tidy. `unusedEmail`
    // belongs to nobody, so it must not affect the count.
    cy.get('.e2e-rules-field-section')
      .find('textarea')
      .type(
        `${memberEmail}, ${unusedEmail}{enter}${otherMemberEmail.toUpperCase()}`,
        { delay: 0 }
      );

    cy.contains('button', 'Save group').click();

    cy.wait('@createGroup').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      groupId = interception.response?.body.data.id;

      cy.get(`a[href*="${groupId}"]`)
        .find('.e2e-group-user-count')
        .should('have.text', '2');

      cy.visit(`/en/admin/users/groups/${groupId}`);
      cy.get('#e2e-users-container').should('contain.text', memberEmail);
      cy.get('#e2e-users-container').should('contain.text', otherMemberEmail);
      cy.get('#e2e-users-container').should('not.contain.text', nonMemberEmail);
    });
  });
});
