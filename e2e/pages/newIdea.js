const newIdeaCommands = {
  postIdea(title, content) {
    return this

    // Select project
    .waitForElementVisible('.e2e-project-card.e2e-open-project')
    .click('.e2e-project-card.e2e-open-project')
    .click('.e2e-submit-project-select-form')
    .waitForElementVisible('@form')

    // Fill in the form
    .setValue('@title', title)
    .setValue('@content', content)
    .click('@submit')
    .waitForElementVisible('#e2e-ideas-list');
  },
};

module.exports = {
  url: `${process.env.ROOT_URL}/ideas/new`,
  elements: {
    form: { selector: '#e2e-new-idea-form' },
    title: { selector: '#title' },
    content: { selector: '.public-DraftEditor-content' },
    submit: { selector: '.e2e-submit-idea-form' },
  },
  commands: [newIdeaCommands],
};
