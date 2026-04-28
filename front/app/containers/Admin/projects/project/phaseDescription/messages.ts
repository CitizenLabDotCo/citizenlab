import { defineMessages } from 'react-intl';

export default defineMessages({
  draftDescriptionPublishedBadge: {
    id: 'app.containers.AdminPage.ProjectTimeline.draftDescriptionPublishedBadge',
    defaultMessage: 'PUBLISHED',
  },
  draftDescriptionDraftBadge: {
    id: 'app.containers.AdminPage.ProjectTimeline.draftDescriptionDraftBadge',
    defaultMessage: 'DRAFT',
  },
  draftDescriptionDiscardChanges: {
    id: 'app.containers.AdminPage.ProjectTimeline.draftDescriptionDiscardChanges',
    defaultMessage: 'Discard changes',
  },
  draftDescriptionPublish: {
    id: 'app.containers.AdminPage.ProjectTimeline.draftDescriptionPublish',
    defaultMessage: 'Publish',
  },
  draftDescriptionPublishedTooltip: {
    id: 'app.containers.AdminPage.ProjectTimeline.draftDescriptionPublishedTooltip1',
    defaultMessage:
      'This is the currently published description visible to participants. Click to edit.',
  },
  draftDescriptionDraftTooltip: {
    id: 'app.containers.AdminPage.ProjectTimeline.draftDescriptionDraftTooltip',
    defaultMessage:
      'You are editing a draft. Publish to make it visible to participants, or discard to revert.',
  },
  descriptionLabel: {
    id: 'app.containers.AdminPage.ProjectTimeline.descriptionLabel',
    defaultMessage: 'Description',
  },
  draftDescriptionSaving: {
    id: 'app.containers.AdminPage.ProjectTimeline.draftDescriptionSaving',
    defaultMessage: 'Saving...',
  },
  draftDescriptionSaved: {
    id: 'app.containers.AdminPage.ProjectTimeline.draftDescriptionSaved',
    defaultMessage: 'Draft saved',
  },
  beta: {
    id: 'app.containers.AdminPage.ProjectTimeline.draftDescription.beta',
    defaultMessage: 'BETA',
  },
  emptyDescriptionWarning: {
    id: 'app.containers.Admin.PagesAndMenu.containers.ProjectsList.emptyDescriptionWarning1',
    defaultMessage:
      'For single phase projects, if the end date is empty and the description is not filled in, a timeline will not be displayed on the project page.',
  },
  descriptionSave: {
    id: 'app.containers.AdminPage.ProjectTimeline.descriptionSave',
    defaultMessage: 'Save',
  },
});
