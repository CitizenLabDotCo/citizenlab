import { defineMessages } from 'react-intl';

export default defineMessages({
  commentDeleted: {
    id: 'app.containers.Admin.projects.project.participantEmail.commentDeleted',
    defaultMessage: 'To the comment author, when their comment is deleted',
  },
  followedComment: {
    id: 'app.containers.Admin.projects.project.participantEmail.followedComment2',
    defaultMessage: `{inputTerm, select,
      idea {To participants who follow the idea, when someone comments}
      option {To participants who follow the option, when someone comments}
      project {To participants who follow the project, when someone comments}
      question {To participants who follow the question, when someone comments}
      issue {To participants who follow the issue, when someone comments}
      contribution {To participants who follow the contribution, when someone comments}
      proposal {To participants who follow the proposal, when someone comments}
      initiative {To participants who follow the initiative, when someone comments}
      petition {To participants who follow the petition, when someone comments}
      comment {To participants who follow the comment, when someone comments}
      response {To participants who follow the response, when someone comments}
      suggestion {To participants who follow the suggestion, when someone comments}
      topic {To participants who follow the topic, when someone comments}
      post {To participants who follow the post, when someone comments}
      story {To participants who follow the story, when someone comments}
      observation {To participants who follow the observation, when someone comments}
      other {To participants who follow the input, when someone comments}
    }`,
  },
  commentReply: {
    id: 'app.containers.Admin.projects.project.participantEmail.commentReply',
    defaultMessage: 'To the comment author, when someone replies',
  },
  inputPublished: {
    id: 'app.containers.Admin.projects.project.participantEmail.inputPublished2',
    defaultMessage: `{inputTerm, select,
      idea {To the author, when their idea is published}
      option {To the author, when their option is published}
      project {To the author, when their project is published}
      question {To the author, when their question is published}
      issue {To the author, when their issue is published}
      contribution {To the author, when their contribution is published}
      proposal {To the author, when their proposal is published}
      initiative {To the author, when their initiative is published}
      petition {To the author, when their petition is published}
      comment {To the author, when their comment is published}
      response {To the author, when their response is published}
      suggestion {To the author, when their suggestion is published}
      topic {To the author, when their topic is published}
      post {To the author, when their post is published}
      story {To the author, when their story is published}
      observation {To the author, when their observation is published}
      other {To the author, when their input is published}
    }`,
  },
  updateMention: {
    id: 'app.containers.Admin.projects.project.participantEmail.updateMention',
    defaultMessage: 'To a participant, when they are mentioned in an update',
  },
  officialFeedback: {
    id: 'app.containers.Admin.projects.project.participantEmail.officialFeedback2',
    defaultMessage: `{inputTerm, select,
      idea {To participants who follow the idea, when it receives official feedback}
      option {To participants who follow the option, when it receives official feedback}
      project {To participants who follow the project, when it receives official feedback}
      question {To participants who follow the question, when it receives official feedback}
      issue {To participants who follow the issue, when it receives official feedback}
      contribution {To participants who follow the contribution, when it receives official feedback}
      proposal {To participants who follow the proposal, when it receives official feedback}
      initiative {To participants who follow the initiative, when it receives official feedback}
      petition {To participants who follow the petition, when it receives official feedback}
      comment {To participants who follow the comment, when it receives official feedback}
      response {To participants who follow the response, when it receives official feedback}
      suggestion {To participants who follow the suggestion, when it receives official feedback}
      topic {To participants who follow the topic, when it receives official feedback}
      post {To participants who follow the post, when it receives official feedback}
      story {To participants who follow the story, when it receives official feedback}
      observation {To participants who follow the observation, when it receives official feedback}
      other {To participants who follow the input, when it receives official feedback}
    }`,
  },
  phaseStarted: {
    id: 'app.containers.Admin.projects.project.participantEmail.phaseStarted',
    defaultMessage:
      'To participants who follow the project or took part, when a phase starts',
  },
  statusChanged: {
    id: 'app.containers.Admin.projects.project.participantEmail.statusChanged2',
    defaultMessage: `{inputTerm, select,
      idea {To participants who follow the idea, when its status changes}
      option {To participants who follow the option, when its status changes}
      project {To participants who follow the project, when its status changes}
      question {To participants who follow the question, when its status changes}
      issue {To participants who follow the issue, when its status changes}
      contribution {To participants who follow the contribution, when its status changes}
      proposal {To participants who follow the proposal, when its status changes}
      initiative {To participants who follow the initiative, when its status changes}
      petition {To participants who follow the petition, when its status changes}
      comment {To participants who follow the comment, when its status changes}
      response {To participants who follow the response, when its status changes}
      suggestion {To participants who follow the suggestion, when its status changes}
      topic {To participants who follow the topic, when its status changes}
      post {To participants who follow the post, when its status changes}
      story {To participants who follow the story, when its status changes}
      observation {To participants who follow the observation, when its status changes}
      other {To participants who follow the input, when its status changes}
    }`,
  },
  screening: {
    id: 'app.containers.Admin.projects.project.participantEmail.screening2',
    defaultMessage: `{inputTerm, select,
      idea {To the author, when their idea is waiting for screening}
      option {To the author, when their option is waiting for screening}
      project {To the author, when their project is waiting for screening}
      question {To the author, when their question is waiting for screening}
      issue {To the author, when their issue is waiting for screening}
      contribution {To the author, when their contribution is waiting for screening}
      proposal {To the author, when their proposal is waiting for screening}
      initiative {To the author, when their initiative is waiting for screening}
      petition {To the author, when their petition is waiting for screening}
      comment {To the author, when their comment is waiting for screening}
      response {To the author, when their response is waiting for screening}
      suggestion {To the author, when their suggestion is waiting for screening}
      topic {To the author, when their topic is waiting for screening}
      post {To the author, when their post is waiting for screening}
      story {To the author, when their story is waiting for screening}
      observation {To the author, when their observation is waiting for screening}
      other {To the author, when their input is waiting for screening}
    }`,
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
