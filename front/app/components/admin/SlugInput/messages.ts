import { defineMessages } from 'react-intl';

export default defineMessages({
  projectUrl: {
    id: 'app.containers.AdminPage.ProjectEdit.projectUrl',
    defaultMessage: 'Project URL',
  },
  urlSlugLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.urlSlugLabel',
    defaultMessage: 'Project slug',
  },
  urlSlugTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.urlSlugTooltip',
    defaultMessage:
      "You can specify the last part of your project page's URL (called the slug). For example, the current project's URL is {currentProjectURL}, where {currentProjectSlug} is the slug.",
  },
  urlSlugBrokenLinkWarning: {
    id: 'app.containers.AdminPage.ProjectEdit.urlSlugBrokenLinkWarning',
    defaultMessage:
      'If you change the project URL, links to the project page using the old URL will no longer work.',
  },
  regexError: {
    id: 'app.containers.AdminPage.ProjectEdit.regexError',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are forbidden.',
  },
  resultingURL: {
    id: 'app.containers.AdminPage.ProjectEdit.resultingURL',
    defaultMessage: 'Resulting project URL',
  },
});
