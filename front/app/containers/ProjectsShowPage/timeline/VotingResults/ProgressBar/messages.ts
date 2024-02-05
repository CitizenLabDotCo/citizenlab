import { defineMessages } from 'react-intl';

export default defineMessages({
  xPicks: {
    id: 'app.containers.ProjectsShowPage.timeline.VotingResults.ProgressBar.xPicks1',
    defaultMessage:
      '{baskets, plural, one {picked 1 time} other {picked # times}}',
  },
  budgetingTooltip: {
    id: 'app.containers.ProjectsShowPage.timeline.VotingResults.ProgressBars.budgetingTooltip1',
    defaultMessage: 'The percentage of participants who picked this option.',
  },
  votingTooltip: {
    id: 'app.containers.ProjectsShowPage.timeline.VotingResults.ProgressBars.votingTooltip',
    defaultMessage: 'The percentage of total votes this option received.',
  },
});
