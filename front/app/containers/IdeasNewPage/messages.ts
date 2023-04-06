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
  submitSurvey: {
    id: 'app.components.form.ErrorDisplay.submitSurvey',
    defaultMessage: 'Submit survey',
  },
  or: {
    id: 'app.containers.IdeasNewPage.or',
    defaultMessage: 'Or',
  },
  goBack: {
    id: 'app.containers.IdeasNewPage.goBack',
    defaultMessage: 'Go back',
  },
  editSurvey: {
    id: 'app.containers.IdeasNewPage.editSurvey',
    defaultMessage: 'Edit survey',
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

  api_error_title_multiloc_blank: {
    id: 'app.containers.IdeasNewPage.api_error_idea_title_multiloc_blank',
    defaultMessage: 'Please provide a title',
  },
  api_error_description_multiloc_blank: {
    id: 'app.containers.IdeasNewPage.api_error_question_description_multiloc_blank',
    defaultMessage: 'Please provide a description',
  },
  api_error_includes_banned_words: {
    id: 'app.containers.IdeasNewPage.api_error_includes_banned_words',
    defaultMessage:
      'You may have used one or more words that are considered profanity by {guidelinesLink}. Please alter your text to remove any profanities that might be present.',
  },

  api_error_idea_title_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_idea_title_multiloc_too_long',
    defaultMessage: 'The idea title must be less than 80 characters long',
  },
  api_error_idea_title_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_idea_title_multiloc_too_short',
    defaultMessage: 'The idea title must be at least 10 characters long',
  },
  api_error_idea_description_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_idea_description_multiloc_too_long',
    defaultMessage: 'The idea description must be less than 80 characters long',
  },
  api_error_idea_description_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_idea_description_multiloc_too_short',
    defaultMessage: 'The idea description must be at least 30 characters long',
  },

  api_error_contribution_title_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_contribution_title_multiloc_too_long',
    defaultMessage:
      'The contribution title must be less than 80 characters long',
  },
  api_error_contribution_title_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_contribution_title_multiloc_too_short',
    defaultMessage:
      'The contribution title must be at least 10 characters long',
  },
  api_error_contribution_description_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_contribution_description_multiloc_too_long',
    defaultMessage:
      'The contribution description must be less than 80 characters long',
  },
  api_error_contribution_description_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_contribution_description_multiloc_too_short',
    defaultMessage:
      'The contribution description must be at least 30 characters long',
  },

  api_error_question_title_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_question_title_multiloc_too_long',
    defaultMessage: 'The question title must be less than 80 characters long',
  },
  api_error_question_title_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_question_title_multiloc_too_short',
    defaultMessage: 'The question title must be at least 10 characters long',
  },
  api_error_question_description_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_question_description_multiloc_too_long',
    defaultMessage:
      'The question description must be less than 80 characters long',
  },
  api_error_question_description_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_question_description_multiloc_too_short',
    defaultMessage:
      'The question description must be at least 30 characters long',
  },

  api_error_project_title_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_project_title_multiloc_too_long',
    defaultMessage: 'The project title must be less than 80 characters long',
  },
  api_error_project_title_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_project_title_multiloc_too_short',
    defaultMessage: 'The project title must be at least 10 characters long',
  },
  api_error_project_description_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_project_description_multiloc_too_long',
    defaultMessage:
      'The project description must be less than 80 characters long',
  },
  api_error_project_description_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_project_description_multiloc_too_short',
    defaultMessage:
      'The project description must be at least 30 characters long',
  },

  api_error_issue_title_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_issue_title_multiloc_too_long',
    defaultMessage: 'The issue title must be less than 80 characters long',
  },
  api_error_issue_title_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_issue_title_multiloc_too_short',
    defaultMessage: 'The issue title must be at least 10 characters long',
  },
  api_error_issue_description_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_issue_description_multiloc_too_long',
    defaultMessage:
      'The issue description must be less than 80 characters long',
  },
  api_error_issue_description_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_issue_description_multiloc_too_short',
    defaultMessage: 'The issue description must be at least 30 characters long',
  },

  api_error_option_title_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_option_title_multiloc_too_long',
    defaultMessage: 'The option title must be less than 80 characters long',
  },
  api_error_option_title_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_option_title_multiloc_too_short',
    defaultMessage: 'The option title must be at least 10 characters long',
  },
  api_error_option_description_multiloc_too_long: {
    id: 'app.containers.IdeasNewPage.api_error_option_description_multiloc_too_long',
    defaultMessage:
      'The option description must be less than 80 characters long',
  },
  api_error_option_description_multiloc_too_short: {
    id: 'app.containers.IdeasNewPage.api_error_option_description_multiloc_too_short',
    defaultMessage:
      'The option description must be at least 30 characters long',
  },

  ajv_error_title_multiloc_required: {
    id: 'app.containers.IdeasNewPage.ajv_error_title_multiloc_required',
    defaultMessage: 'Please provide a title',
  },
  ajv_error_body_multiloc_required: {
    id: 'app.containers.IdeasNewPage.ajv_error_idea_body_multiloc_required',
    defaultMessage: 'Please provide a description',
  },
  ajv_error_topic_ids_minItems: {
    id: 'app.containers.IdeasNewPage.ajv_error_option_topic_ids_minItems',
    defaultMessage: 'Please select at least one tag',
  },
  ajv_error_proposed_budget_required: {
    id: 'app.containers.IdeasNewPage.ajv_error_proposed_budget_required',
    defaultMessage: 'Please enter a number',
  },
  ajv_error_proposed_budget_type: {
    id: 'app.containers.IdeasNewPage.ajv_error_proposed_bugdet_type',
    defaultMessage: 'Please enter a number',
  },

  ajv_error_idea_title_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_idea_title_multiloc_maxLength1',
    defaultMessage: 'The idea title must be less than {limit} characters long',
  },
  ajv_error_idea_title_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_idea_title_multiloc_minLength',
    defaultMessage: 'The idea title must be more than {limit} characters long',
  },
  ajv_error_idea_body_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_idea_body_multiloc_maxLength',
    defaultMessage:
      'The idea description must be less than {limit} characters long',
  },
  ajv_error_idea_body_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_idea_body_multiloc_minLength',
    defaultMessage:
      'The idea description must be more than {limit} characters long',
  },

  ajv_error_contribution_title_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_contribution_title_multiloc_maxLength',
    defaultMessage:
      'The contribution title must be less than {limit} characters long',
  },
  ajv_error_contribution_title_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_contribution_title_multiloc_minLength1',
    defaultMessage:
      'The contribution title must be more than {limit} characters long',
  },
  ajv_error_contribution_body_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_contribution_body_multiloc_maxLength',
    defaultMessage:
      'The contribution description must be less than {limit} characters long',
  },
  ajv_error_contribution_body_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_contribution_body_multiloc_minLength',
    defaultMessage:
      'The contribution description must be more than {limit} characters long',
  },

  ajv_error_question_title_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_question_title_multiloc_maxLength',
    defaultMessage:
      'The question title must be less than {limit} characters long',
  },
  ajv_error_question_title_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_question_title_multiloc_minLength1',
    defaultMessage:
      'The question title must be more than {limit} characters long',
  },
  ajv_error_question_body_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_question_body_multiloc_maxLength',
    defaultMessage:
      'The question description must be less than {limit} characters long',
  },
  ajv_error_question_body_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_question_body_multiloc_minLength',
    defaultMessage:
      'The question description must be more than {limit} characters long',
  },

  ajv_error_project_title_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_project_title_multiloc_maxLength',
    defaultMessage:
      'The project title must be less than {limit} characters long',
  },
  ajv_error_project_title_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_project_title_multiloc_minLength1',
    defaultMessage:
      'The project title must be more than {limit} characters long',
  },
  ajv_error_project_body_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_project_body_multiloc_maxLength',
    defaultMessage:
      'The project description must be less than {limit} characters long',
  },
  ajv_error_project_body_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_project_body_multiloc_minLength',
    defaultMessage:
      'The project description must be more than {limit} characters long',
  },

  ajv_error_issue_title_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_issue_title_multiloc_maxLength',
    defaultMessage: 'The issue title must be less than {limit} characters long',
  },
  ajv_error_issue_title_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_issue_title_multiloc_minLength2',
    defaultMessage:
      'The comment title must be more than {limit} characters long',
  },
  ajv_error_issue_body_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_issue_body_multiloc_maxLength',
    defaultMessage:
      'The issue description must be less than {limit} characters long',
  },
  ajv_error_issue_body_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_issue_body_multiloc_minLength',
    defaultMessage:
      'The issue description must be more than {limit} characters long',
  },

  ajv_error_option_title_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_option_title_multiloc_maxLength',
    defaultMessage:
      'The option title must be less than {limit} characters long',
  },
  ajv_error_option_title_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_option_title_multiloc_minLength1',
    defaultMessage:
      'The option title must be more than {limit} characters long',
  },
  ajv_error_option_body_multiloc_maxLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_option_body_multiloc_maxLength',
    defaultMessage:
      'The option description must be less than {limit} characters long',
  },
  ajv_error_option_body_multiloc_minLength: {
    id: 'app.containers.IdeasNewPage.ajv_error_option_body_multiloc_minLength',
    defaultMessage:
      'The issue description must be more than {limit} characters long',
  },
  leaveSurveyConfirmationQuestion: {
    id: 'app.containers.IdeasNewPage.leaveSurveyConfirmationQuestion',
    defaultMessage: 'Are you sure you want to leave this survey?',
  },
  leaveSurveyText: {
    id: 'app.containers.IdeasNewPage.leaveSurveyText',
    defaultMessage: "Your answers won't be saved.",
  },
  confirmLeaveSurveyButtonText: {
    id: 'app.containers.IdeasNewPage.confirmLeaveSurveyButtonText',
    defaultMessage: 'Yes, I want to leave the survey',
  },
  cancelLeaveSurveyButtonText: {
    id: 'app.containers.IdeasNewPage.cancelLeaveSurveyButtonText',
    defaultMessage: 'Cancel',
  },
});
