import { defineMessages } from 'react-intl';

export default defineMessages({
  konveioDocumentAnnotationEmbedUrl: {
    id: 'app.containers.AdminPage.ProjectEdit.konveioDocumentAnnotationEmbedUrl',
    defaultMessage: 'Embed Konveio URL',
  },
  konveioSupport: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.konveioSupport',
    defaultMessage:
      'Provide the link to your Konveio document here. Read our {supportArticleLink} for more information on setting up Konveio.',
  },
  konveioSupportPageURL2: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.konveioSupportPageURL2',
    defaultMessage:
      'https://support.govocal.com/en/articles/527582-embedding-konveio-pdf-documents-for-collecting-feedback',
  },
  konveioSupportArticle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.konveioSupportArticle',
    defaultMessage: 'support article',
  },
  participantActionsGroup: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.participantActionsGroup',
    defaultMessage: 'Participant actions',
  },
  moderationGroup: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.moderationGroup',
    defaultMessage: 'Moderation',
  },
  votingAction: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.votingAction',
    defaultMessage: 'Voting',
  },
  votingDisplayGroup: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.votingDisplayGroup',
    defaultMessage: 'Filtering and results',
  },
  takingPollAction: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.takingPollAction',
    defaultMessage: 'Taking the poll',
  },
  takingSurveyAction: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.takingSurveyAction',
    defaultMessage: 'Taking the survey',
  },
  volunteeringAction2: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.volunteeringAction2',
    defaultMessage: 'Signing up for a cause',
  },
  proposalRequirementsGroup: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.proposalRequirementsGroup',
    defaultMessage: 'Proposal requirements',
  },
  participantActionsSummary2: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.participantActionsSummary2',
    defaultMessage:
      '{action, select, submit {Submit} comment {Comment} vote {Vote} add_statements {Add statements} other {React}}{others, plural, =0 {} other { +#}}',
  },
  proposalRequirementsSummary: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.proposalRequirementsSummary',
    defaultMessage:
      '{votes, plural, one {# vote} other {# votes}} in {days, plural, one {# day} other {# days}}',
  },
  proposalRequirementsNote: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.proposalRequirementsNote',
    defaultMessage:
      'Proposals that reach the minimum within the time limit get an official response; the rest expire.',
  },
  howIdeasAreShown: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.howIdeasAreShown',
    defaultMessage: 'How ideas are shown',
  },
  howProposalsAreShown: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.howProposalsAreShown',
    defaultMessage: 'How proposals are shown',
  },
  responsesOpen: {
    id: 'app.containers.Admin.projects.phaseSetup.responsesOpen',
    defaultMessage: 'Open',
  },
  responsesPaused: {
    id: 'app.containers.Admin.projects.phaseSetup.responsesPaused',
    defaultMessage: 'Paused',
  },
  acceptNewResponses: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.acceptNewResponses',
    defaultMessage: 'Accept new responses',
  },
  pauseExternalResponses: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.pauseExternalResponses',
    defaultMessage:
      'When off, participants cannot open the survey from this platform. The survey provider controls responses through direct links.',
  },
  pausePollResponses: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.pausePollResponses',
    defaultMessage: 'When off, participants can no longer submit the poll.',
  },
  acceptNewResponsesDescription: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.acceptNewResponsesDescription',
    defaultMessage: 'When off, participants can no longer submit the survey.',
  },
  settingsGroup: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.settingsGroup',
    defaultMessage: 'Settings',
  },
});
