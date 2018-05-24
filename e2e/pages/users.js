const commands = {
  newNormalGroup(title) {
    this
    .waitForElementVisible('@createGroupButton')
    .click('@createGroupButton')
    .waitForElementVisible('@createNormalGroupButton')
    .click('@createNormalGroupButton')
    .waitForElementVisible('@groupNameField')
    .fillMultiloc('@groupNameField', title)
    .click('@submit')
    .waitForElementNotPresent('@submit');
  },
  newRulesGroup(title) {
    this
    .waitForElementVisible('@createGroupButton')
    .click('@createGroupButton')
    .waitForElementVisible('@createRulesGroupButton')
    .click('@createRulesGroupButton')
    .waitForElementVisible('@groupNameField')
    .fillMultiloc('@groupNameField', title)
    .click('@addConditionButton')
    // From here the test is pretty hacky. It selects Role > is admin
    .click('.e2e-rules-field-section .Select')
    .click("#react-select-2--option-3");
    this.api.keys(this.api.Keys.TAB)
    .keys(this.api.Keys.ENTER)
    .keys(this.api.Keys.ENTER);
    // note : in a page, you need the api keyword to use keys and pause and execute
    // but when chaining after a api keyword, the @ don't work anymore
    this
    .click('@submit')
    .waitForElementNotPresent('@submit');
  },
};

module.exports = {
  url: `http://${process.env.ROOT_URL}/admin/users`,
  elements: {
    createGroupButton: { selector: '.e2e-create-group-button' },
    createNormalGroupButton: { selector: '.e2e-create-normal-group-button' },
    createRulesGroupButton: { selector: '.e2e-create-rules-group-button' },
    groupsList: { selector: '.e2e-groups-list' },
    groupNameField: { selector: '#group-title-field' },
    addConditionButton: { selector: '.e2e-add-condition-button' },
    submit: { selector: '.e2e-submit-wrapper-button button' },
  },
  commands: [commands],
};
