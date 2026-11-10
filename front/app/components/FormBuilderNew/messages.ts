import { defineMessages } from 'react-intl';

export default defineMessages({
  addPage: {
    id: 'app.components.FormBuilderNew.addPage',
    defaultMessage: 'Add page',
  },
  addQuestion: {
    id: 'app.components.FormBuilderNew.addQuestion',
    defaultMessage: 'Add question',
  },
  readOnlyPage: {
    id: 'app.components.FormBuilderNew.readOnlyPage',
    defaultMessage: 'Not editable here',
  },
  pages: {
    id: 'app.components.FormBuilderNew.pages',
    defaultMessage: 'Pages',
  },
  pageNumber: {
    id: 'app.components.FormBuilderNew.pageNumber',
    defaultMessage: 'Page {number}',
  },
  questionCount: {
    id: 'app.components.FormBuilderNew.questionCount',
    defaultMessage:
      '{count, plural, =0 {No questions} one {# question} other {# questions}}',
  },
  untitledPage: {
    id: 'app.components.FormBuilderNew.untitledPage',
    defaultMessage: 'Untitled page',
  },
  untitledQuestion: {
    id: 'app.components.FormBuilderNew.untitledQuestion',
    defaultMessage: 'Untitled question',
  },
  emptyPage: {
    id: 'app.components.FormBuilderNew.emptyPage3',
    defaultMessage: 'This page has no questions yet. Click here to add one.',
  },
  pageMissingTitleAndDescription: {
    id: 'app.components.FormBuilderNew.pageMissingTitleAndDescription',
    defaultMessage:
      'This page has no title or description yet. Click here to add them.',
  },
  pageMissingTitle: {
    id: 'app.components.FormBuilderNew.pageMissingTitle',
    defaultMessage: 'This page has no title yet. Click here to add one.',
  },
  pageMissingDescription: {
    id: 'app.components.FormBuilderNew.pageMissingDescription',
    defaultMessage: 'This page has no description yet. Click here to add one.',
  },
  insertQuestionOn: {
    id: 'app.components.FormBuilderNew.insertQuestionOn',
    defaultMessage: 'Insert question on',
  },
  insertQuestionPosition: {
    id: 'app.components.FormBuilderNew.insertQuestionPosition',
    defaultMessage: 'Position',
  },
  atTopOfPage: {
    id: 'app.components.FormBuilderNew.atTopOfPage',
    defaultMessage: 'At the top of the page',
  },
  afterQuestion: {
    id: 'app.components.FormBuilderNew.afterQuestion',
    defaultMessage: 'After "{title}"',
  },
  questions: {
    id: 'app.components.FormBuilderNew.questions',
    defaultMessage: 'Questions',
  },
  mapping: {
    id: 'app.components.FormBuilderNew.mapping',
    defaultMessage: 'Mapping',
  },
  deletePageTitle: {
    id: 'app.components.FormBuilderNew.deletePageTitle',
    defaultMessage: 'Delete {pageLabel}?',
  },
  deletePageIntro: {
    id: 'app.components.FormBuilderNew.deletePageIntro',
    defaultMessage:
      'This page has {count, plural, one {# question} other {# questions}}. What should happen to {count, plural, one {it} other {them}}?',
  },
  deletePageOnly: {
    id: 'app.components.FormBuilderNew.deletePageOnly',
    defaultMessage: 'Delete page only',
  },
  deletePageOnlyDescription: {
    id: 'app.components.FormBuilderNew.deletePageOnlyDescription',
    defaultMessage:
      '{count, plural, one {The question moves} other {The questions move}} to {pageLabel}.',
  },
  deletePageAndQuestions: {
    id: 'app.components.FormBuilderNew.deletePageAndQuestions',
    defaultMessage: 'Delete page and questions',
  },
  deletePageAndQuestionsDescription: {
    id: 'app.components.FormBuilderNew.deletePageAndQuestionsDescription',
    defaultMessage:
      '{count, plural, one {The question is} other {All # questions are}} deleted too.',
  },
  cancel: {
    id: 'app.components.FormBuilderNew.cancel',
    defaultMessage: 'Cancel',
  },
  pageActions: {
    id: 'app.components.FormBuilderNew.pageActions',
    defaultMessage: 'Page actions',
  },
  blockedFormEndDelete: {
    id: 'app.components.FormBuilderNew.blockedFormEndDelete',
    defaultMessage: "The ending page can't be deleted.",
  },
  blockedFormEndDuplicate: {
    id: 'app.components.FormBuilderNew.blockedFormEndDuplicate',
    defaultMessage: "The ending page can't be duplicated.",
  },
  blockedDemographics: {
    id: 'app.components.FormBuilderNew.blockedDemographics',
    defaultMessage:
      'The demographics page is managed in the access rights settings of this phase.',
  },
  blockedOnlyPage: {
    id: 'app.components.FormBuilderNew.blockedOnlyPage',
    defaultMessage:
      "A survey needs at least one page, so this one can't be deleted.",
  },
  blockedLocked: {
    id: 'app.components.FormBuilderNew.blockedLocked',
    defaultMessage: "This page can't be deleted.",
  },
  blockedMapQuestions: {
    id: 'app.components.FormBuilderNew.blockedMapQuestions',
    defaultMessage: "Pages with map questions can't be duplicated yet.",
  },
  duplicate: {
    id: 'app.components.FormBuilderNew.duplicate',
    defaultMessage: 'Duplicate',
  },
  delete: {
    id: 'app.components.FormBuilderNew.delete',
    defaultMessage: 'Delete',
  },
  dragToMove: {
    id: 'app.components.FormBuilderNew.dragToMove',
    defaultMessage: 'Drag to move',
  },
  save: {
    id: 'app.components.FormBuilderNew.save',
    defaultMessage: 'Save',
  },
  viewSurvey: {
    id: 'app.components.FormBuilderNew.viewSurvey',
    defaultMessage: 'View survey',
  },
  goBack: {
    id: 'app.components.FormBuilderNew.goBack',
    defaultMessage: 'Go back',
  },
  openAssistant: {
    id: 'app.components.FormBuilderNew.openAssistant',
    defaultMessage: 'Open AI assistant',
  },
  closePanel: {
    id: 'app.components.FormBuilderNew.closePanel',
    defaultMessage: 'Close panel',
  },
  questionFailedToRender: {
    id: 'app.components.FormBuilderNew.questionFailedToRender',
    defaultMessage: 'This question cannot be previewed yet.',
  },
});
