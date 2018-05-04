const newIdeaCommands = {
  postIdea(title, content) {
    this

    // Select project
    .waitForElementVisible('.e2e-project-card.e2e-open-project')
    .click('.e2e-project-card.e2e-open-project');
    this.api.execute('window.scrollTo(0,document.body.scrollHeight);');
    this.click('.e2e-submit-project-select-form')
    .waitForElementVisible('@form')

    // Fill in the form
    .setValue('@title', title)
    .setValue('@content', content);

    return this.click('.e2e-submit-form').waitForElementNotPresent('@form');
  },
};

module.exports = {
  url: `http://${process.env.ROOT_URL}/ideas/new`,
  elements: {
    form: { selector: '#e2e-new-idea-form' },
    title: { selector: '#title' },
    content: { selector: '.public-DraftEditor-content' },
    submit: { selector: '.e2e-submit-idea-form' },
  },
  commands: [newIdeaCommands],
};
