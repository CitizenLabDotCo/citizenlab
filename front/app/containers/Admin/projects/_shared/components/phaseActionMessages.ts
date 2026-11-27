import { defineMessages } from 'react-intl';

// {inputs} is the plural of what participants post in the phase ("ideas", "statements").
export default defineMessages({
  statements: {
    id: 'app.containers.Admin.projects.phaseActions.statements',
    defaultMessage: 'statements',
  },
  submittingInputs: {
    id: 'app.containers.Admin.projects.phaseActions.submittingInputs',
    defaultMessage: 'Submitting {inputs}',
  },
  commentingOnInputs: {
    id: 'app.containers.Admin.projects.phaseActions.commentingOnInputs',
    defaultMessage: 'Commenting on {inputs}',
  },
  reactingToInputs: {
    id: 'app.containers.Admin.projects.phaseActions.reactingToInputs',
    defaultMessage: 'Reacting to {inputs}',
  },
  votingOnInputs: {
    id: 'app.containers.Admin.projects.phaseActions.votingOnInputs',
    defaultMessage: 'Voting on {inputs}',
  },
  whoCanSubmitInputs: {
    id: 'app.containers.Admin.projects.phaseActions.whoCanSubmitInputs',
    defaultMessage: 'Who can submit {inputs}?',
  },
  whoCanCommentOnInputs: {
    id: 'app.containers.Admin.projects.phaseActions.whoCanCommentOnInputs',
    defaultMessage: 'Who can comment on {inputs}?',
  },
  whoCanReactToInputs: {
    id: 'app.containers.Admin.projects.phaseActions.whoCanReactToInputs',
    defaultMessage: 'Who can react to {inputs}?',
  },
  whoCanVoteOnInputs: {
    id: 'app.containers.Admin.projects.phaseActions.whoCanVoteOnInputs',
    defaultMessage: 'Who can vote on {inputs}?',
  },
});
