import { defineMessages } from 'react-intl';

export default defineMessages({
  averageRank: {
    id: 'app.containers.Admin.projects.project.survey.formResults.averageRank',
    defaultMessage: '<b>#{averageRank}</b> average',
  },
  rank: {
    id: 'app.containers.Admin.projects.project.survey.formResults.rank',
    defaultMessage: '#{rank}',
  },
  viewDetails: {
    id: 'app.containers.Admin.projects.project.survey.formResults.viewDetails',
    defaultMessage: 'View details',
  },
  hideDetails: {
    id: 'app.containers.Admin.projects.project.survey.formResults.hideDetails',
    defaultMessage: 'Hide details',
  },
  xChoices: {
    id: 'app.containers.Admin.projects.project.survey.formResults.xChoices',
    defaultMessage:
      '{numberChoices, plural, no {{numberChoices} choices} one {{numberChoices} choice} other {{numberChoices} choices}}',
  },
});
