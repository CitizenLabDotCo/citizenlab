import { defineMessages } from 'react-intl';

export default defineMessages({
  spaceSelectTitle: {
    id: 'app.containers.Admin.projects.project.general.components.SpaceSelectSection.spaceSelectTitle',
    defaultMessage: 'Space',
  },
  tooltip: {
    id: 'app.containers.Admin.projects.project.general.components.SpaceSelectSection.tooltip',
    defaultMessage:
      'You can add your project to a space now, or do it later in the project settings',
  },
  disabledTooltip: {
    id: 'app.containers.Admin.projects.project.general.components.SpaceSelectSection.disabledTooltip',
    defaultMessage:
      'Since a folder was selected, you cannot add this project to a space. The project will be in the same space as the folder.',
  },
});
