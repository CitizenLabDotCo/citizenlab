const newIdeaCommands = {
  postIdea(title, content) {
    return this
    .waitForElementVisible('@form')
    .setValue('@title', title)
    .setValue('@content', content)
    .click('@submit')
    .waitForElementVisible('#e2e-ideas-list');
  },
};

module.exports = {
  url: 'localhost:3000/ideas/new',
  elements: {
    form: { selector: '#e2e-new-idea-form' },
    title: { selector: '#title' },
    content: { selector: '.public-DraftEditor-content' },
    submit: { selector: '.e2e-submit-idea-form' },
  },
  commands: [newIdeaCommands],
};
