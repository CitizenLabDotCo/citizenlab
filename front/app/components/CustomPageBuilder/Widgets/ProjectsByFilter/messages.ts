import { defineMessages } from 'react-intl';

export default defineMessages({
  filteredProjects: {
    id: 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.filteredProjects',
    defaultMessage: 'Filtered projects',
  },
  description2: {
    id: 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.description2',
    defaultMessage:
      'Shows the published and archived projects matching the filter you choose below.',
  },
  filterByLabel: {
    id: 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.filterByLabel',
    defaultMessage: 'Show projects with',
  },
  filterByTags: {
    id: 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.filterByTags',
    defaultMessage: 'One of these tags',
  },
  filterByAreas: {
    id: 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.filterByAreas',
    defaultMessage: 'One of these areas',
  },
  filterBySpaces: {
    id: 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.filterBySpaces',
    defaultMessage: 'One of these spaces',
  },
  dimensionUnavailable: {
    id: 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.dimensionUnavailable',
    defaultMessage: '{dimension} (not available on this platform)',
  },
  selectionLabel: {
    id: 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.selectionLabel',
    defaultMessage: 'Selection',
  },
  titleLabel: {
    id: 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.titleLabel',
    defaultMessage: 'Title',
  },
  notAvailable: {
    id: 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.notAvailable',
    defaultMessage:
      'Filtered project lists are not available on this platform, so this is not shown to residents.',
  },
  nothingSelected: {
    id: 'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.nothingSelected',
    defaultMessage: 'Pick at least one to show projects here.',
  },
});
