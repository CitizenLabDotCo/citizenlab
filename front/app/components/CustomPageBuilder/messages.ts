import { defineMessages } from 'react-intl';

export default defineMessages({
  customPage: {
    id: 'app.containers.CustomPageBuilder.customPage',
    defaultMessage: 'Custom page',
  },
  saveError: {
    id: 'app.containers.CustomPageBuilder.saveError',
    defaultMessage: 'There was an error saving the custom page.',
  },
  saveErrorUnauthorizedFile: {
    id: 'app.containers.CustomPageBuilder.saveErrorUnauthorizedFile',
    defaultMessage:
      "The custom page wasn't saved because you can't use one of the files you added. Remove it, or ask an admin to add it.",
  },
});
