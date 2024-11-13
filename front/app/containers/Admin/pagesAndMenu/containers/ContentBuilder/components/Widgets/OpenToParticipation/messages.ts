import { defineMessages } from 'react-intl';

export default defineMessages({
  openToParticipation: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.CraftComponents.OpenToParticipation.openToParticipation',
    defaultMessage: 'Open to participation',
  },
  noData: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.CraftComponents.OpenToParticipation.noData',
    defaultMessage:
      'This widget will only be shown to the user if there are projects where they can participate. If you see this message, it means that you (the admin) cannot participate in any projects at this moment. This message will not be visible on the real homepage.',
  },
});
