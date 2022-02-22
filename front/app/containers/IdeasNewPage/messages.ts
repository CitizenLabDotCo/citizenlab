import { defineMessages } from 'react-intl';

export default defineMessages({
  ideaFormTitle: {
    id: 'app.containers.IdeasNewPage.ideaFormTitle',
    defaultMessage: 'Add new idea',
  },
  optionFormTitle: {
    id: 'app.containers.IdeasNewPage.optionFormTitle',
    defaultMessage: 'Add new option',
  },
  contributionFormTitle: {
    id: 'app.containers.IdeasNewPage.contributionFormTitle',
    defaultMessage: 'Add new contribution',
  },
  projectFormTitle: {
    id: 'app.containers.IdeasNewPage.projectFormTitle',
    defaultMessage: 'Add new project',
  },
  questionFormTitle: {
    id: 'app.containers.IdeasNewPage.questionFormTitle',
    defaultMessage: 'Add new question',
  },
  issueFormTitle: {
    id: 'app.containers.IdeasNewPage.issueFormTitle',
    defaultMessage: 'Add new issue',
  },
  submitNewIdea: {
    id: 'app.containers.IdeasNewPage.submitNewIdea',
    defaultMessage: 'Submit',
  },
  submitApiError: {
    id: 'app.containers.IdeasNewPage.submitApiError',
    defaultMessage:
      'There was an issue submitting the form. Please check for any errors and try again.',
  },
  or: {
    id: 'app.containers.IdeasNewPage.or',
    defaultMessage: 'Or',
  },
  goBack: {
    id: 'app.containers.IdeasNewPage.goBack',
    defaultMessage: 'Go back',
  },
  shareViaMessenger: {
    id: 'app.containers.IdeasNewPage.shareViaMessenger',
    defaultMessage: 'Share via Messenger',
  },
  shareOnTwitter: {
    id: 'app.containers.IdeasNewPage.shareOnTwitter',
    defaultMessage: 'Share on Twitter',
  },
  fileUploadError: {
    id: 'app.containers.IdeasNewPage.fileUploadError',
    defaultMessage:
      'A file failed to upload. Please check the file size and format and try again.',
  },
  ideaNewMetaTitle: {
    id: 'app.containers.IdeasNewPage.ideaNewMetaTitle',
    defaultMessage: 'Add new idea | {projectName}',
  },
  optionMetaTitle: {
    id: 'app.containers.IdeasNewPage.optionMetaTitle',
    defaultMessage: 'Add new option | {projectName}',
  },
  projectMetaTitle: {
    id: 'app.containers.IdeasNewPage.projectMetaTitle',
    defaultMessage: 'Add new project | {projectName}',
  },
  questionMetaTitle: {
    id: 'app.containers.IdeasNewPage.questionMetaTitle',
    defaultMessage: 'Add new question | {projectName}',
  },
  issueMetaTitle: {
    id: 'app.containers.IdeasNewPage.issueMetaTitle',
    defaultMessage: 'Add new issue | {projectName}',
  },
  contributionMetaTitle: {
    id: 'app.containers.IdeasNewPage.contributionMetaTitle',
    defaultMessage: 'Add new contribution | {projectName}',
  },
  ideaNewMetaDescription: {
    id: 'app.containers.IdeasNewPage.ideaNewMetaDescription',
    defaultMessage:
      "Post a submission and join the conversation at {orgName}'s participation platform.",
  },

  api_error_idea_title_blank: {
    id: 'app.containers.IdeasNewPage.api_error_idea_title_multiloc_blank',
    defaultMessage: 'Please provide a title',
  },
  api_error_idea_title_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_idea_title_multiloc_too_long',
    defaultMessage: 'The idea title must be less than 80 characters long',
  },
  api_error_idea_title_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_idea_title_multiloc_too_short',
    defaultMessage: 'The idea title must be at least 10 characters long',
  },
  api_error_idea_description_blank: {
    id: 'app.containers.IdeasNewPage.api_error_idea_description_multiloc_blank',
    defaultMessage: 'Please provide a description',
  },
  api_error_idea_description_multiloc_too_long: {
    id:
      'app.containers.IdeasNewPage.api_error_idea_description_multiloc_too_long',
    defaultMessage: 'The idea description must be less than 80 characters long',
  },
  api_error_idea_description_multiloc_too_short: {
    id:
      'app.containers.IdeasNewPage.api_error_idea_description_multiloc_too_short',
    defaultMessage: 'The idea description must be at least 30 characters long',
  },
  api_error_contribution_title_blank: {
    id:
      'app.containers.IdeasNewPage.api_error_contribution_title_multiloc_blank',
    defaultMessage: 'Please provide a title',
  },
  api_error_contribution_title_multiloc_too_long: {
    id:
      'app.containers.IdeasNewPage.api_error_contribution_title_multiloc_too_long',
    defaultMessage:
      'The contribution title must be less than 80 characters long',
  },
  api_error_contribution_title_multiloc_too_short: {
    id:
      'app.containers.IdeasNewPage.api_error_contribution_title_multiloc_too_short',
    defaultMessage:
      'The contribution title must be at least 10 characters long',
  },
  api_error_includes_banned_words: {
    id: 'app.containers.IdeasNewPage.api_error_includes_banned_words',
    defaultMessage:
      'You may have used one or more words that are considered profanity by {guidelinesLink}. Please alter your text to remove any profanities that might be present.',
  },
});
