import { defineMessages } from 'react-intl';

export default defineMessages({
  participantsGraphLabel: {
    id: 'app.containers.Admin.projects.project.participantsGraphLabel',
    defaultMessage: 'Participants',
  },
  participantsGraphLastPeriod: {
    id: 'app.containers.Admin.projects.project.participantsGraphLastPeriod',
    defaultMessage: '<b>+{count}</b> last 7 days',
  },
  participantsGraphScale: {
    id: 'app.containers.Admin.projects.project.participantsGraphScale',
    defaultMessage: 'Weekly, since {date}',
  },
  participantsEmpty: {
    id: 'app.containers.Admin.projects.project.participantsEmpty',
    defaultMessage: 'Numbers appear here once participants take part',
  },
});
