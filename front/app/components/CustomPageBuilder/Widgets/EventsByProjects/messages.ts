import { defineMessages } from 'react-intl';

export default defineMessages({
  events: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.events',
    defaultMessage: 'Events',
  },
  descriptionAll: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.descriptionAll',
    defaultMessage:
      'Shows the next three upcoming events from every published project. Past events are never shown.',
  },
  descriptionFiltered: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.descriptionFiltered',
    defaultMessage:
      'Shows the next three upcoming events from the published projects you pick below. Past events are never shown.',
  },
  titleLabel: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.titleLabel',
    defaultMessage: 'Title',
  },
  modeLabel: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.modeLabel',
    defaultMessage: 'Show events from',
  },
  modeProjects: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.modeProjects',
    defaultMessage: 'These projects',
  },
  modeTags: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.modeTags',
    defaultMessage: 'Projects with one of these tags',
  },
  modeAreas: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.modeAreas',
    defaultMessage: 'Projects in one of these areas',
  },
  modeSpaces: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.modeSpaces',
    defaultMessage: 'Projects in one of these spaces',
  },
  modeAll: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.modeAll',
    defaultMessage: 'Every project',
  },
  modeUnavailable: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.modeUnavailable',
    defaultMessage: '{mode} (not available on this platform)',
  },
  selectionLabel: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.selectionLabel',
    defaultMessage: 'Selection',
  },
  notAvailable: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.notAvailable',
    defaultMessage:
      'Filtered event lists are not available on this platform, so this is not shown to residents.',
  },
  nothingSelected: {
    id: 'app.components.CustomPageBuilder.Widgets.EventsByProjects.nothingSelected',
    defaultMessage:
      'Pick at least one, or switch to every project, to show events here.',
  },
});
