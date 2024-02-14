import { defineMessages } from 'react-intl';

export default defineMessages({
  numberOfVotes: {
    id: 'app.containers.admin.ReportBuilder.SingleIdeaWidget.numberOfVotes',
    defaultMessage:
      '{numberOfVotes} {numberOfVotes, plural, =0 {{votesTerm}} one {{voteTerm}} other {{votesTerm}}}',
  },
  vote: {
    id: 'app.containers.admin.ReportBuilder.SingleIdeaWidget.vote',
    defaultMessage: 'vote',
  },
  votes: {
    id: 'app.containers.admin.ReportBuilder.SingleIdeaWidget.votes',
    defaultMessage: 'votes',
  },
});
