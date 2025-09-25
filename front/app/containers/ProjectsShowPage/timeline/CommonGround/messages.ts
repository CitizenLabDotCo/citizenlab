import { defineMessages } from 'react-intl';

export default defineMessages({
  statementsTabLabel: {
    id: 'app.components.CommonGroundTabs.statementsTabLabel',
    defaultMessage: 'Statements',
  },
  resultsTabLabel: {
    id: 'app.components.CommonGroundTabs.resultsTabLabel',
    defaultMessage: 'Results',
  },
  agreeLabel: {
    id: 'app.components.CommonGroundStatements.agreeLabel',
    defaultMessage: 'Agree',
  },
  unsureLabel: {
    id: 'app.components.CommonGroundStatements.unsureLabel',
    defaultMessage: 'Unsure',
  },
  disagreeLabel: {
    id: 'app.components.CommonGroundStatements.disagreeLabel',
    defaultMessage: 'Disagree',
  },
  noMoreStatements: {
    id: 'app.components.CommonGroundStatements.noMoreStatements',
    defaultMessage: 'There are no statements to respond to right now',
  },
  noResults: {
    id: 'app.components.CommonGroundStatements.noResults',
    defaultMessage:
      'There are no results to show yet. Please make sure you have participated in the Common Ground phase and check back here after.',
  },
  participants: {
    id: 'app.components.CommonGroundResults.participantsLabel1',
    defaultMessage: 'participants',
  },
  participant: {
    id: 'app.components.CommonGroundResults.participantLabel',
    defaultMessage: 'participant',
  },
  statements: {
    id: 'app.components.CommonGroundResults.statementsLabel1',
    defaultMessage: 'statements',
  },
  statement: {
    id: 'app.components.CommonGroundResults.statementLabel',
    defaultMessage: 'statement',
  },
  votes: {
    id: 'app.components.CommonGroundResults.votesLabel1',
    defaultMessage: 'votes',
  },
  vote: {
    id: 'app.components.CommonGroundResults.votesLabe',
    defaultMessage: 'vote',
  },
  highestConsensusTitle: {
    id: 'app.components.CommonGroundResults.highestConsensusTitle',
    defaultMessage: 'Highest consensus',
  },
  closeCallsTitle: {
    id: 'app.components.CommonGroundResults.closeCallsTitle',
    defaultMessage: 'Close calls',
  },
  highestConsensusDescription: {
    id: 'app.components.CommonGroundResults.highestConsensusDescription',
    defaultMessage:
      'Statements with clear agreement - the majority of those who voted either agree or disagree chose the same position.',
  },
  closeCallsDescription: {
    id: 'app.components.CommonGroundResults.closeCallsDescription',
    defaultMessage:
      'These statements sparked the most disagreement, with votes for agree or disagree closest to a 50/50 split.',
  },
});
