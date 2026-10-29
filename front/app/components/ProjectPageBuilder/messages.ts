import { defineMessages } from 'react-intl';

export default defineMessages({
  projectHomepage: {
    id: 'app.containers.ProjectPageBuilder.projectHomepage',
    defaultMessage: 'Project homepage',
  },
  saveError: {
    id: 'app.containers.ProjectPageBuilder.saveError',
    defaultMessage: 'There was an error saving the project page.',
  },
  saveErrorUnauthorizedFile: {
    id: 'app.containers.ProjectPageBuilder.saveErrorUnauthorizedFile',
    defaultMessage:
      "The project page wasn't saved because you can't use one of the files you added. Remove it, or ask an admin to add it.",
  },
  lockedZoneLabel: {
    id: 'app.containers.ProjectPageBuilder.lockedZoneLabel',
    defaultMessage: 'Fixed — editable only',
  },
  editableContent: {
    id: 'app.containers.ProjectPageBuilder.editableContent',
    defaultMessage: 'Editable content',
  },
});
