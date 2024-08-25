import { defineMessages } from 'react-intl';

export default defineMessages({
  mapConfiguration: {
    id: 'app.components.formBuilder.mapConfiguration',
    defaultMessage: 'Map configuration',
  },
  configureMap: {
    id: 'app.components.formBuilder.configureMap',
    defaultMessage: 'Configure map',
  },
  linePolygonMapWarning: {
    id: 'app.components.formBuilder.linePolygonMapWarning2',
    defaultMessage:
      'Line and polygon drawing may not meet accessibility standards. More information can be found in the { accessibilityStatement }.',
  },
  accessibilityStatement: {
    id: 'app.components.formBuilder.accessibilityStatement',
    defaultMessage: 'accessibility statement',
  },
});
