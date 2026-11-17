import { defineMessages } from 'react-intl';

export default defineMessages({
  commentDeleted: {
    id: 'app.containers.Admin.projects.project.participantEmail.commentDeleted',
    defaultMessage: 'To the comment author, when their comment is deleted',
  },
  followedComment: {
    id: 'app.containers.Admin.projects.project.participantEmail.followedComment',
    defaultMessage:
      'To participants who follow the {term}, when someone comments',
  },
  commentReply: {
    id: 'app.containers.Admin.projects.project.participantEmail.commentReply',
    defaultMessage: 'To the comment author, when someone replies',
  },
  inputPublished: {
    id: 'app.containers.Admin.projects.project.participantEmail.inputPublished',
    defaultMessage: 'To the author, when their {term} is published',
  },
  updateMention: {
    id: 'app.containers.Admin.projects.project.participantEmail.updateMention',
    defaultMessage: 'To a participant, when they are mentioned in an update',
  },
  officialFeedback: {
    id: 'app.containers.Admin.projects.project.participantEmail.officialFeedback',
    defaultMessage:
      'To participants who follow the {term}, when it receives official feedback',
  },
  phaseStarted: {
    id: 'app.containers.Admin.projects.project.participantEmail.phaseStarted',
    defaultMessage:
      'To participants who follow the project or took part, when a phase starts',
  },
  statusChanged: {
    id: 'app.containers.Admin.projects.project.participantEmail.statusChanged',
    defaultMessage:
      'To participants who follow the {term}, when its status changes',
  },
  screening: {
    id: 'app.containers.Admin.projects.project.participantEmail.screening',
    defaultMessage: 'To the author, when their {term} is waiting for screening',
  },
  cosponsorAccepted: {
    id: 'app.containers.Admin.projects.project.participantEmail.cosponsorAccepted',
    defaultMessage:
      'To the proposal author, when someone accepts their invitation to co-sponsor',
  },
  cosponsorInvitation: {
    id: 'app.containers.Admin.projects.project.participantEmail.cosponsorInvitation',
    defaultMessage:
      'To a participant, when they are invited to co-sponsor a proposal',
  },
  unfinishedVote: {
    id: 'app.containers.Admin.projects.project.participantEmail.unfinishedVote',
    defaultMessage:
      'To participants who have not submitted their votes, 1 day after they last voted',
  },
  voteSubmitted: {
    id: 'app.containers.Admin.projects.project.participantEmail.voteSubmitted',
    defaultMessage: 'To the voter, when their votes are submitted',
  },
  lastChance: {
    id: 'app.containers.Admin.projects.project.participantEmail.lastChance',
    defaultMessage:
      'To participants who engaged with the project but have not voted, 2 days before voting closes',
  },
  votingStarted: {
    id: 'app.containers.Admin.projects.project.participantEmail.votingStarted',
    defaultMessage:
      'To participants who engaged with the project, when a phase starts',
  },
  votingResults: {
    id: 'app.containers.Admin.projects.project.participantEmail.votingResults',
    defaultMessage:
      'To participants who engaged with the project, when the voting phase ends',
  },
  unfinishedSurvey: {
    id: 'app.containers.Admin.projects.project.participantEmail.unfinishedSurvey',
    defaultMessage:
      'To participants who started the survey but did not submit it, 1 day after they last saved it',
  },
  surveySubmitted: {
    id: 'app.containers.Admin.projects.project.participantEmail.surveySubmitted',
    defaultMessage: 'To the respondent, when their survey is submitted',
  },
});
