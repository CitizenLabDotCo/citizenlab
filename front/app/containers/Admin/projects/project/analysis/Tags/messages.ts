import { defineMessages } from 'react-intl';

export default defineMessages({
  addTag: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.addTag',
    defaultMessage: 'Add tag',
  },
  deleteTagConfirmation: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.deleteTagConfirmation',
    defaultMessage: 'Are you sure you want to delete this tag?',
  },
  deleteTag: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.deleteTag',
    defaultMessage: 'Delete tag',
  },
  editTag: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.editTag',
    defaultMessage: 'Edit tag',
  },
  renameTagModalTitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.renameTagModalTitle',
    defaultMessage: 'Rename tag',
  },
  renameTagModalNameLabel: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.renameTagModalNameLabel',
    defaultMessage: 'Name',
  },
  renameTagModalSave: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.renameTagModalSave',
    defaultMessage: 'Save',
  },
  renameTagModalCancel: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.renameTagModalCancel',
    defaultMessage: 'Cancel',
  },
  emptyNameError: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.emptyNameError',
    defaultMessage: 'Add name',
  },
  allTags: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.allTags',
    defaultMessage: 'All tags',
  },
  renameTag: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.renameTag',
    defaultMessage: 'Rename tag',
  },
  addInputToTag: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.addInputToTag',
    defaultMessage: 'Add selected inputs to tag',
  },
  autoTag: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.autoTag',
    defaultMessage: 'Auto-tag',
  },
  allInputs: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.allInputs',
    defaultMessage: 'All inputs',
  },
  inputsWithoutTags: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.inputsWithoutTags',
    defaultMessage: 'Inputs without tags',
  },
  noTags: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.noTags',
    defaultMessage:
      'Use tags to subdivide and filter the inputs, in order to make more accurate or targeted summaries.',
  },
  autoTagTitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.autoTagTitle',
    defaultMessage: 'Auto-tag',
  },
  autoTagDescription: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.autoTagDescription',
    defaultMessage:
      'Auto-tags are automatically derived by the computer. You can change or remove them at all times.',
  },
  whatToTag: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.whatToTag',
    defaultMessage: 'What inputs do you want to tag?',
  },
  allInput: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.allInput',
    defaultMessage: 'All inputs',
  },
  useCurrentFilters: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.useCurrentFilters',
    defaultMessage: 'Use current filters',
  },
  noActiveFilters: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.noActiveFilters',
    defaultMessage: 'No active filters',
  },
  howToTag: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.howToTag',
    defaultMessage: 'How do you want to tag?',
  },
  tagDetection: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.tagDetection',
    defaultMessage: 'Tag detection',
  },
  fullyAutomatedTitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.fullyAutomatedTitle',
    defaultMessage: 'Tags: Fully automated',
  },
  fullyAutomatedTooltip: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.fullyAutomatedTooltip',
    defaultMessage:
      'Works well when your projects covers a broad range of tags. Good place to start.',
  },
  fullyAutomatedDescription: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.fullyAutomatedDescription',
    defaultMessage:
      'The computer automatically detects tags and assigns them to your inputs.',
  },
  classificationByLabelTitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.classificationByLabelTitle',
    defaultMessage: 'Tags: By label',
  },
  classificationByLabelTooltip: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.classificationByLabelTooltip',
    defaultMessage:
      'This works well when you have a pre-defined set of tags or when your project has a limited scope in terms of tags.',
  },
  classificationByLabelDescription: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.classificationByLabelDescription',
    defaultMessage: 'You create the tags, the computer assigns the inputs',
  },
  classificationByExampleTitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.classificationByExampleTitle',
    defaultMessage: 'Tags: By example',
  },
  classificationByExampleTooltip: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.classificationByExampleTooltip',
    defaultMessage:
      'Similar to "Tags: by label" but with increased accuracy as you’re training the system with good examples.',
  },
  classificationByExampleDescription: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.classificationByExampleDescription',
    defaultMessage:
      'You create the tags and manually assign a few inputs as an example, the computer assigns the rest',
  },
  platformTagsTitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.platformTags',
    defaultMessage: 'Tags: Platform tags',
  },
  platformTagsDescription: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.platformTagsDescription',
    defaultMessage:
      'Assign the existing platform tags that the author picked when posting',
  },
  other: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.other',
    defaultMessage: 'Other',
  },
  sentimentTagTitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.sentimentTagTitle',
    defaultMessage: 'Sentiment',
  },
  sentimentTagDescription: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.sentimentTagDescription',
    defaultMessage:
      'Assign a positive or negative sentiment to each input, derived from the text',
  },
  controversialTagTitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.controversialTagTitle',
    defaultMessage: 'Controversial',
  },
  controversialTagDescription: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.controversialTagDescription',
    defaultMessage: 'Detect inputs with a significant dislikes/likes ratio',
  },
  languageTagTitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.languageTagTitle',
    defaultMessage: 'Language',
  },
  languageTagDescription: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.languageTagDescription',
    defaultMessage: 'Detect the language of each input',
  },
  fewShotTitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.fewShotTitle',
    defaultMessage: 'Tags: By example',
  },
  fewShotSubtitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.fewShotSubtitle',
    defaultMessage:
      'Select maximum 9 tags you would like the inputs to be distributed between.',
  },
  fewShotSubtitle2: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.fewShotSubtitle2',
    defaultMessage:
      'The classification is based on the inputs currently assigned to the tags. The computer will try to follow your example.',
  },
  byLabelTitle: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.byLabelTitle',
    defaultMessage: 'Tags: By label',
  },
  byLabelSubtitle1: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.byLabelSubtitle1',
    defaultMessage:
      'Select maximum 9 tags you would like the inputs to be distributed between. Inputs already associated with these tags will not be classified again.',
  },
  byLabelSubtitle2: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.byLabelSubtitle2',
    defaultMessage:
      'The classification is solely based on the name of the tag. Pick relevant keywords for the best results.',
  },
  launch: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.launch',
    defaultMessage: 'Launch',
  },
  autoAssignQuestion: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.autoAssignQuestion',
    defaultMessage: 'Do you want to automatically assign inputs to your tag?',
  },
  autoAssignYes: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.autoAssignYes',
    defaultMessage: 'Yes, auto-tag',
  },
  autoAssignNo: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.autoAssignNo',
    defaultMessage: "No, I'll do it",
  },
  autoAssignStep2AutoText1: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.autoAssignStep2AutoText1',
    defaultMessage:
      'There are <b>different methods</b> to automatically assign inputs to tags.',
  },
  autoAssignStep2AutoText2: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.autoAssignStep2AutoText2',
    defaultMessage:
      'Use <b>the auto-tag button</b> to launch your preferred method.',
  },
  autoAssignStep2ManualText1: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.autoAssignStep2ManualText1',
    defaultMessage:
      'Click on a tag to assign it to the currently selected input.',
  },
  dontShowAgain: {
    id: 'app.containers.AdminPage.projects.project.analysis.Tags.dontShowAgain',
    defaultMessage: "Don't show this again",
  },
});
