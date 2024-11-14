import { defineMessages } from 'react-intl';

export default defineMessages({
  numberOfPicks: {
    id: 'app.containers.ProjectsShowPage.timeline.VotingResults.ProgressBar.numberOfPicks',
    defaultMessage: '{baskets, plural, one {1 pick} other {# picks}}',
  },
  numberManualVoters: {
    id: 'app.containers.ProjectsShowPage.timeline.VotingResults.ProgressBar.numberManualVoters2',
    defaultMessage:
      '{manualVoters, plural, one {(incl. 1 offline)} other {(incl. # offline)}}',
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
