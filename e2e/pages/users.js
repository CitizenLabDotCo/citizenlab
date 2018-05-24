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
};

module.exports = {
  url: `http://${process.env.ROOT_URL}/admin/users`,
  elements: {
    createGroupButton: { selector: '.e2e-create-group-button' },
    createNormalGroupButton: { selector: '.e2e-create-normal-group-button' },
    createRulesGroupButton: { selector: '.e2e-create-rules-group-button' },
    groupsList: { selector: '.e2e-groups-list' },
    groupNameField: { selector: '#group-title' },
    submit: { selector: 'form .e2e-submit-wrapper-button button' },
  },
  commands: [commands],
};
