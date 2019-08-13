import { defineMessages } from 'react-intl';

export default defineMessages({
  idea: {
    id: 'app.containers.IdeasShow.idea',
    defaultMessage: 'Idea',
  },
  loadVotesError: {
    id: 'app.containers.IdeasShow.loadVotesError',
    defaultMessage: 'Voting is not currently available',
  },
  imageAltText: {
    id: 'app.containers.IdeasShow.imageAltText',
    defaultMessage: 'Main image for the idea {ideaTitle}',
  },
  Map: {
    id: 'app.containers.IdeasShow.Map',
    defaultMessage: 'Map',
  },
  ideaVoteSubmitError: {
    id: 'app.containers.IdeasShow.ideaVoteSubmitError',
    defaultMessage: 'Voting failed',
  },
  voteOnThisIdea: {
    id: 'app.containers.IdeasShow.voteOnThisIdea',
    defaultMessage: 'Vote on this idea',
  },
  loadingIdea: {
    id: 'app.containers.IdeasShow.loadingIdea',
    defaultMessage: 'Loading idea...',
  },
  oneSecond: {
    id: 'app.containers.IdeasShow.oneSecond',
    defaultMessage: 'Just one second...',
  },
  ideaNotFound: {
    id: 'app.containers.IdeasShow.ideaNotFound',
    defaultMessage: 'Ups... it seems that this idea has be removed or forgotten!',
  },
  deleteReason_other: {
    id: 'app.containers.IdeasShow.deleteReason_other',
    defaultMessage: 'Other reason (please specify)',
  },
  metaTitle: {
    id: 'app.containers.IdeasShow.metaTitle',
    defaultMessage: 'Idea • {ideaTitle}',
  },
  metaOgTitle: {
    id: 'app.containers.IdeasShow.metaOgTitle',
    defaultMessage: 'Support this idea: {ideaTitle}',
  },
  ideaOgDescription: {
    id: 'app.containers.IdeasShow.ideaOgDescription',
    defaultMessage: 'What do you think of this idea? Join the discussion and vote to make your voice heard.',
  },
  shareTitle: {
    id: 'app.containers.IdeasShow.shareTitle',
    defaultMessage: 'Congratulations, your idea was successfully posted!',
  },
  shareSubtitle: {
    id: 'app.containers.IdeasShow.shareSubtitle',
    defaultMessage: 'Share your idea to reach more people, receive more votes and have more impact.',
  },
  twitterMessage: {
    id: 'app.containers.IdeasShow.twitterMessage',
    defaultMessage: 'Vote for {ideaTitle} on',
  },
  emailSharingSubject: {
    id: 'app.containers.IdeasShow.emailSharingSubject',
    defaultMessage: 'Support my idea: {ideaTitle}.',
  },
  emailSharingBody: {
    id: 'app.containers.IdeasShow.emailSharingBody',
    defaultMessage: 'What do you think of this idea? Vote on it and share the discussion at {ideaUrl} to make your voice heard!',
  },
  byAuthorName: {
    id: 'app.containers.IdeasShow.byAuthorName',
    defaultMessage: 'by {authorName}',
  },
  deletedUser: {
    id: 'app.containers.IdeasShow.deletedUser',
    defaultMessage: 'deleted user',
  },
  author: {
    id: 'app.containers.IdeasShow.author',
    defaultMessage: '{authorNameComponent}',
  },
  shareCTA: {
    id: 'app.containers.IdeasShow.shareCTA',
    defaultMessage: 'Share this idea',
  },
  currentStatus: {
    id: 'app.containers.IdeasShow.currentStatus',
    defaultMessage: 'Current status',
  },
  login: {
    id: 'app.components.IdeasShow.login',
    defaultMessage: 'Login',
  },
  register: {
    id: 'app.components.IdeasShow.register',
    defaultMessage: 'Create an account',
  },
  moreOptions: {
    id: 'app.components.IdeasShow.moreOptions',
    defaultMessage: 'More options',
  },
  reportAsSpam: {
    id: 'app.components.IdeasShow.reportAsSpam',
    defaultMessage: 'Report as spam',
  },
  spamModalLabelIdea: {
    id: 'app.components.IdeasShow.spamModalLabelIdea',
    defaultMessage: 'Report idea as spam: select reason',
  },
  editIdea: {
    id: 'app.components.IdeasShow.editIdea',
    defaultMessage: 'Edit idea',
  },
  deleteIdea: {
    id: 'app.components.IdeasShow.deleteIdea',
    defaultMessage: 'Delete idea',
  },
  deleteIdeaConfirmation: {
    id: 'app.components.IdeasShow.deleteIdeaConfirmation',
    defaultMessage: 'Are you sure you want to delete this idea?',
  },
  lastUpdated: {
    id: 'app.components.IdeasShow.lastUpdated',
    defaultMessage: 'Last modified {modificationTime}',
  },
  lastChangesTitle: {
    id: 'app.components.IdeasShow.lastChangesTitle',
    defaultMessage: 'Last changes to this idea',
  },
  changeLogEntry: {
    id: 'app.components.IdeasShow.changeLogEntry',
    defaultMessage: `{changeType, select,
      changed_status {{userName} has updated the status of this idea}
      published {{userName} created this idea}
      changed_title {{userName} updated the title of this idea}
      changed_body {{userName} updated the description of this idea}
    }`,
  },
  goBack: {
    id: 'app.components.IdeasShow.goBack',
    defaultMessage: 'Go back',
  },
  send: {
    id: 'app.components.IdeasShow.send',
    defaultMessage: 'Send',
  },
  projectAttachments: {
    id: 'app.components.IdeasShow.projectAttachments',
    defaultMessage: 'Attachments',
  },
  skipSharing: {
    id: 'app.components.IdeasShow.skipSharing',
    defaultMessage: "Skip it, I'll do it later",
  },
  modalShareLabel: {
    id: 'app.components.IdeasShow.modalShareLabel',
    defaultMessage: 'Your idea was posted, share it now to reach more votes!',
  },
  similarIdeas: {
    id: 'app.components.IdeasShow.similarIdeas',
    defaultMessage: 'Similar ideas',
  },
  reportAsSpamModalTitle: {
    id: 'app.containers.IdeasShow.reportAsSpamModalTitle',
    defaultMessage: 'Why do you want to report this as spam?',
  },
  ideaPostedBy: {
    id: 'app.components.IdeasShow.ideaPostedBy',
    defaultMessage: 'Idea posted by {userName}',
  },
  linkToHomePage: {
    id: 'app.components.IdeasShow.linkToHomePage',
    defaultMessage: 'Link to home page'
  },
  createdTimeAgo: {
    id: 'app.components.IdeasShow.createdTimeAgo',
    defaultMessage: 'Created {timeAgo}'
  }
});
