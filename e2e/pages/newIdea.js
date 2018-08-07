const newIdeaCommands = {
  postIdea(title, content) {
    this

    // Select project
    .waitForElementVisible('.e2e-project-card.e2e-open-project')
    .click('.e2e-project-card.e2e-open-project');
    this.api.execute('window.scrollTo(0,document.body.scrollHeight);')
    .click('.e2e-submit-project-select-form');
    this.waitForElementPresent('@form')

    // Fill in the form
    .setValue('@title', title)
    .setValue('@content', content);
    this.api.execute('window.scrollTo(0,document.body.scrollHeight);');
    return this.click('@submit').click('.e2e-submit-idea-form-mobile');
  },
};

module.exports = {
  url: `http://${process.env.ROOT_URL}/ideas/new`,
  elements: {
    form: { selector: '#e2e-new-idea-form' },
    title: { selector: '#title' },
    content: { selector: '.ql-editor' },
    submit: { selector: '.e2e-submit-idea-form' },
  },
  commands: [newIdeaCommands],
};
