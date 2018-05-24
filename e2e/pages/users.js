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
    // From here the command is pretty hacky. It should select Role > is admin by...
    // Clicking the fist Select element in the rules fild section
    .click('.e2e-rules-field-section .Select')
    // Clicking the 3rd option -> breaks if admin is not the 3rd option (language change, field option change...)...
    // -> also breaks if react-select changes its id pattern
    .click("#react-select-2--option-3");
    // Press tab to go to next field
    this.api.keys(this.api.Keys.TAB)
    // Press enter to display the options
    .keys(this.api.Keys.ENTER)
    // Press enter to select the first one which should be "is admin"
    .keys(this.api.Keys.ENTER);
    // note : when in a page, you need the api keyword to use keys and pause and execute
    // but when chaining after a api keyword, the @ doesn't work anymore
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
    lastGroupUserCount: { selector: '.e2e-groups-list li:last-child span:last-child' },
    groupNameField: { selector: '#group-title-field' },
    addConditionButton: { selector: '.e2e-add-condition-button' },
    submit: { selector: '.e2e-submit-wrapper-button button' },
  },
  commands: [commands],
};
