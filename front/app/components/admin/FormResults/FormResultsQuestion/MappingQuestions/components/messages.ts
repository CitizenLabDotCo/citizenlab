import { defineMessages } from 'react-intl';

export default defineMessages({
  exportGeoJSON: {
    id: 'app.containers.Admin.projects.project.survey.formResults.exportGeoJSON',
    defaultMessage: 'Export as GeoJSON',
  },
  exportGeoJSONTooltip: {
    id: 'app.containers.Admin.projects.project.survey.formResults.exportGeoJSONTooltip2',
    defaultMessage:
      "Export the responses to this question as a GeoJSON file. For each GeoJSON Feature, all of the related respondent's survey responses will be listed in that Feature's 'properties' object.",
  },
});
