import { defineMessages } from 'react-intl';

export default defineMessages({
  exportGeoJSON: {
    id: 'app.containers.Admin.projects.project.survey.formResults.exportGeoJSON',
    defaultMessage: 'Export as GeoJSON',
  },
  exportGeoJSONTooltip: {
    id: 'app.containers.Admin.projects.project.survey.formResults.exportGeoJSONTooltip',
    defaultMessage:
      "Export the responses to this question as a GeoJSON file. For each GeoJSON Feature, the user's responses to the other survey questions are included as Attributes.",
  },
});
