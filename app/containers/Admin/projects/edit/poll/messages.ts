import {
  defineMessages
} from 'react-intl';

export default defineMessages({
  titlePollTab: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.titlePollTab',
    defaultMessage: 'Polls settings and results',
  },
  subtitlePollTab: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.subtitlePollTab',
    defaultMessage: 'Here, you can set up the polls within this project, and export their results.',
  },
  deleteQuestion: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.deleteQuestion',
    defaultMessage: 'Delete',
  },
  editOptions: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.editOptions',
    defaultMessage: 'Manage options',
  },
  noOptions: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.noOptions',
    defaultMessage: 'No options',
  },
  noOptionsTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.noOptionsTooltip',
    defaultMessage: 'The poll will not be answerable as it is, all questions must have options',
  },
  wrongMax: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.wrongMax',
    defaultMessage: 'Wrong maximum',
  },
  maxOverTheMaxTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.maxOverTheMaxTooltip',
    defaultMessage: 'The maximum number of choices is greater than the number of options',
  },
  maxUnderTheMinTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.maxUnderTheMinTooltip',
    defaultMessage: 'A multiple answer question should allow at least two answers.',
  },
  oneOption: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.oneOption',
    defaultMessage: 'Only one option',
  },
  oneOptionsTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.oneOptionsTooltip',
    defaultMessage: 'Poll respondents have only one choice',
  },
  addQuestion: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.addQuestion',
    defaultMessage: 'Add a question',
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
  editOptionDone: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.editOptionDone',
    defaultMessage: 'Done',
  },
  deleteOption: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.deleteOption',
    defaultMessage: 'Delete',
  },
  editOption: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.editOption',
    defaultMessage: 'Edit',
  },
  addOption: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.addOption',
    defaultMessage: 'Add an option',
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
  saveQuestionSettings: {
    id: 'app.containers.AdminPage.ProjectEdit.PollTab.saveQuestionSettings',
    defaultMessage: 'Save number of choices',
  },
});
