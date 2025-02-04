import { defineMessages } from 'react-intl';

export default defineMessages({
  copyVerb: {
    id: 'app.components.formBuilder.formField.copyVerb',
    defaultMessage: 'Copy',
  },
  delete: {
    id: 'app.components.formBuilder.formField.delete',
    defaultMessage: 'Delete',
  },
  copyNoun: {
    id: 'app.components.formBuilder.formField.copyNoun',
    defaultMessage: 'Copy',
  },
  deleteFieldWithLogicConfirmationQuestion: {
    id: 'app.components.formBuilder.formField.deleteFieldWithLogicConfirmationQuestion',
    defaultMessage:
      'Deleting this page will also delete the logic associated with it. Are you sure you want to delete it?',
  },
  confirmDeleteFieldWithLogicButtonText: {
    id: 'app.components.formBuilder.formField.confirmDeleteFieldWithLogicButtonText',
    defaultMessage: 'Yes, delete page',
  },
  deleteResultsInfo: {
    id: 'app.components.formBuilder.formField.deleteResultsInfo',
    defaultMessage: 'This cannot be undone',
  },
  cancelDeleteButtonText: {
    id: 'app.components.formBuilder.formField.cancelDeleteButtonText',
    defaultMessage: 'Cancel',
  },
  multipleGotoInMultiSelect: {
    id: 'app.components.formBuilder.logicConflicts.multipleGotoInMultiSelect',
    defaultMessage:
      'This page contains a multi-select question where options lead to different pages. If participants select multiple options, the furthest page will be shown. Ensure this behavior aligns with your intended flow.',
  },
  questionVsPageLogic: {
    id: 'app.components.formBuilder.logicConflicts.questionVsPageLogic',
    defaultMessage:
      'This page has logic set at both the page level and question level. Question logic will take precedence over page-level logic. Ensure this behavior aligns with your intended flow.',
  },
  interQuestionConflict: {
    id: 'app.components.formBuilder.logicConflicts.interQuestionConflict',
    defaultMessage:
      'This page contains questions that lead to different pages. If participants answer multiple questions, the furthest page will be shown. Ensure this behavior aligns with your intended flow.',
  },
  multipleGotoInMultiSelectAndQuestionVsPageLogic: {
    id: 'app.components.formBuilder.logicConflicts.multipleGotoInMultiSelectAndQuestionVsPageLogic',
    defaultMessage:
      'This page contains a multi-select question where options lead to different pages and has logic set at both the page and question level. Question logic will take precedence, and the furthest page will be shown. Ensure this behavior aligns with your intended flow.',
  },
  multipleGotoInMultiSelectAndInterQuestionConflict: {
    id: 'app.components.formBuilder.logicConflicts.multipleGotoInMultiSelectAndInterQuestionConflict',
    defaultMessage:
      'This page contains a multi-select question where options lead to different pages and has questions that lead to other pages. The furthest page will be shown if these conditions overlap. Ensure this behavior aligns with your intended flow.',
  },
  questionVsPageLogicAndInterQuestionConflict: {
    id: 'app.components.formBuilder.logicConflicts.questionVsPageLogicAndInterQuestionConflict',
    defaultMessage:
      'This page has logic set at both the page and question levels, and multiple questions direct to different pages. Question logic will take precedence, and the furthest page will be shown. Ensure this behavior aligns with your intended flow.',
  },
  multipleConflictTypes: {
    id: 'app.components.formBuilder.logicConflicts.multipleConflictTypes',
    defaultMessage:
      'This page has multiple logic rules applied: multi-select question logic, page-level logic, and inter-question logic. When these conditions overlap, question logic will take precedence over page logic, and the furthest page will be shown. Review the logic to ensure it aligns with your intended flow.',
  },
  conflictingLogic: {
    id: 'app.components.formBuilder.logicConflicts.conflictingLogic',
    defaultMessage: 'Conflicting logic',
  },
});
