import { defineMessages } from 'react-intl';

export default defineMessages({
  xComments: {
    id: 'app.containers.IdeaCard.xComments',
    defaultMessage:
      '{commentsCount, plural, =0 {no comments} one {1 comment} other {# comments}}',
  },
  a11y_ideaTitle: {
    id: 'app.containers.IdeaCard.a11y_ideaTitle',
    defaultMessage: 'Idea: ',
  },
  a11y_optionTitle: {
    id: 'app.containers.IdeaCard.a11y_optionTitle',
    defaultMessage: 'Option: ',
  },
  a11y_projectTitle: {
    id: 'app.containers.IdeaCard.a11y_projectTitle',
    defaultMessage: 'Project: ',
  },
  a11y_questionTitle: {
    id: 'app.containers.IdeaCard.a11y_questionTitle',
    defaultMessage: 'Question: ',
  },
  a11y_issueTitle: {
    id: 'app.containers.IdeaCard.a11y_issueTitle',
    defaultMessage: 'Issue: ',
  },
  a11y_contributionTitle: {
    id: 'app.containers.IdeaCard.a11y_contributionTitle',
    defaultMessage: 'Contribution: ',
  },
});
