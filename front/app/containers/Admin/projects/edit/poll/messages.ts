import { defineMessages } from 'react-intl';

export default defineMessages({
  titlePollTab: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.titlePollTab',
    defaultMessage: 'Polls settings and results',
  },
  pollTabSubtitle: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.pollTabSubtitle',
    defaultMessage:
      'Here you can create poll questions, set the answer choices for participants to choose from for each question, decide whether you want participants to only be able to select one answer choice (single choice) or multiple answer choices (multiple choice), and export the poll results. You can create multiple poll questions within one poll.',
  },
  deleteQuestion: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.deleteQuestion',
    defaultMessage: 'Delete',
  },
  editPollAnswersButtonLabel: {
    id:
      'app.containers.AdminPage.ProjectEdit.PollTab.editPollAnswersButtonLabel',
    defaultMessage: 'Answer choices',
  },
  noOptions: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.noOptions',
    defaultMessage: 'No options',
  },
  noOptionsTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.noOptionsTooltip',
    defaultMessage:
      'The poll will not be answerable as it is, all questions must have options',
  },
  wrongMax: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.wrongMax',
    defaultMessage: 'Wrong maximum',
  },
  maxOverTheMaxTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.maxOverTheMaxTooltip',
    defaultMessage:
      'The maximum number of choices is greater than the number of options',
  },
  maxUnderTheMinTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.maxUnderTheMinTooltip',
    defaultMessage:
      'A multiple answer question should allow at least two answers.',
  },
  oneOption: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.oneOption',
    defaultMessage: 'Only one option',
  },
  oneOptionsTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.oneOptionsTooltip',
    defaultMessage: 'Poll respondents have only one choice',
  },
  addPollQuestion: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.addPollQuestion',
    defaultMessage: 'Add a poll question',
  },
  cancelFormQuestion: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.cancelFormQuestion',
    defaultMessage: 'Cancel',
  },
  saveQuestion: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.saveQuestion',
    defaultMessage: 'Save',
  },
  optionsFormHeader: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.optionsFormHeader',
    defaultMessage: 'Manage options for: {questionTitle}',
  },
  editOptionSave: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.editOptionSave',
    defaultMessage: 'Save',
  },
  deleteOption: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.deleteOption',
    defaultMessage: 'Delete',
  },
  editOption: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.editOption',
    defaultMessage: 'Edit',
  },
  addAnswerChoice: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.addAnswerChoice',
    defaultMessage: 'Add an answer choice',
  },
  saveOption: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.saveOption',
    defaultMessage: 'Save',
  },
  cancelOption: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.cancelOption',
    defaultMessage: 'Cancel',
  },
  exportPollResults: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.exportPollResults',
    defaultMessage: 'Export poll results',
  },
  singleOption: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.singleOption',
    defaultMessage: 'Single choice',
  },
  multipleOption: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.multipleOption',
    defaultMessage: 'Multiple choice',
  },
  applyQuestionSettings: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.applyQuestionSettings',
    defaultMessage: 'Apply',
  },
});
