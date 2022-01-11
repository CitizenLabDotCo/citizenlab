import { defineMessages } from 'react-intl';

export default defineMessages({
  folderUrl: {
    id: 'app.components.admin.SlugInput.folderUrl',
    defaultMessage: 'Folder URL',
  },
  folderUrlSlugLabel: {
    id: 'app.components.admin.SlugInput.urlSlugLabel',
    defaultMessage: 'Folder slug',
  },
  folderUrlSlugTooltip: {
    id: 'app.components.admin.SlugInput.urlSlugTooltip',
    defaultMessage:
      "You can specify the last part of your folder page's URL (called the slug). For example, the current folders's URL is {currentURL}, where {currentSlug} is the slug.",
  },
  folderUrlSlugBrokenLinkWarning: {
    id: 'app.components.admin.SlugInput.urlSlugBrokenLinkWarning',
    defaultMessage:
      'If you change the folder URL, links to the project page using the old URL will no longer work.',
  },
  folderResultingURL: {
    id: 'app.components.admin.SlugInput.resultingURL',
    defaultMessage: 'Resulting folder URL',
  },
  projectUrl: {
    id: 'app.components.admin.SlugInput.projectUrl',
    defaultMessage: 'Project URL',
  },
  projectUrlSlugLabel: {
    id: 'app.components.admin.SlugInput.urlSlugLabel',
    defaultMessage: 'Project slug',
  },
  projectUrlSlugTooltip: {
    id: 'app.components.admin.SlugInput.urlSlugTooltip',
    defaultMessage:
      "You can specify the last part of your project page's URL (called the slug). For example, the current project's URL is {currentURL}, where {currentSlug} is the slug.",
  },
  projectUrlSlugBrokenLinkWarning: {
    id: 'app.components.admin.SlugInput.urlSlugBrokenLinkWarning',
    defaultMessage:
      'If you change the project URL, links to the project page using the old URL will no longer work.',
  },
  projectResultingURL: {
    id: 'app.components.admin.SlugInput.resultingURL',
    defaultMessage: 'Resulting project URL',
  },
  regexError: {
    id: 'app.components.admin.SlugInput.regexError',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are forbidden.',
  },
});
