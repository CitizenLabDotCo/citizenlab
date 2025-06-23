import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.components.admin.commonGroundInputManager.title',
    defaultMessage: 'Title',
  },
  noInputs: {
    id: 'app.components.admin.PostManager.noInputs',
    defaultMessage: 'No inputs yet',
  },
  inputImportProgress: {
    id: 'app.components.admin.PostManager.inputImportProgress',
    defaultMessage:
      '{importedCount} out of {totalCount} {totalCount, plural, one {input has} other {inputs have}} been imported. The import is still in progress, please check back later.',
  },
  noInputsDescription: {
    id: 'app.components.admin.PostManager.noInputsDescription',
    defaultMessage:
      'You add your own input or start from a past participation project.',
  },
  createInput: {
    id: 'app.components.admin.PostManager.createInput',
    defaultMessage: 'Create input',
  },
  startFromPastInputs: {
    id: 'app.components.admin.PostManager.startFromPastInputs',
    defaultMessage: 'Start from past inputs',
  },
  createInputsDescription: {
    id: 'app.components.admin.PostManager.createInputsDescription',
    defaultMessage: 'Create a new set of inputs from a past project',
  },
  selectAProject: {
    id: 'app.components.admin.PostManager.selectAProject',
    defaultMessage: 'Select a project',
  },
  selectAPhase: {
    id: 'app.components.admin.PostManager.selectAPhase',
    defaultMessage: 'Select a phase',
  },
  cancel: {
    id: 'app.components.admin.PostManager.cancel',
    defaultMessage: 'Cancel',
  },
  importInputs: {
    id: 'app.components.admin.PostManager.importInputs',
    defaultMessage: 'Import inputs',
  },
  noProject: {
    id: 'app.components.admin.PostManager.noProject',
    defaultMessage: 'No project',
  },
  noOfInputsToImport: {
    id: 'app.components.admin.PostManager.noOfInputsToImport',
    defaultMessage:
      '{count, plural, =0 {0 inputs} one {1 input} other {# inputs}} will be imported from the selected project and phase. The import will run in the background, and the inputs will appear in the input manager once it is complete.',
  },
});
