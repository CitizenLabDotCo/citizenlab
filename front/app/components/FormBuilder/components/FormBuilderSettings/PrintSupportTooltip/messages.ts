import { defineMessages } from 'react-intl';

export default defineMessages({
  page: {
    id: 'app.components.formBuilder.printSupportTooltip.page',
    defaultMessage:
      'Page titles and descriptions are shown as a section header in the downloaded PDF.',
  },
  ranking: {
    id: 'app.components.formBuilder.printSupportTooltip.ranking',
    defaultMessage:
      'Ranking questions are shown on the downloaded PDF but are not currently supported for import via FormSync.',
  },
  matrix: {
    id: 'app.components.formBuilder.printSupportTooltip.matrix',
    defaultMessage:
      'Matrix questions are shown on the downloaded PDF but are not currently supported for import via FormSync.',
  },
  topic_ids: {
    id: 'app.components.formBuilder.printSupportTooltip.topics2',
    defaultMessage:
      'Tags are shown as unsupported on the downloaded PDF and are not supported for import via FormSync.',
  },
  cosponsor_ids: {
    id: 'app.components.formBuilder.printSupportTooltip.cosponsor_ids2',
    defaultMessage:
      'Co-sponsors are not shown on the downloaded PDF and are not supported for import via FormSync.',
  },
  fileupload: {
    id: 'app.components.formBuilder.printSupportTooltip.fileupload',
    defaultMessage:
      'File upload questions are shown as unsupported on the downloaded PDF and are not supported for import via FormSync.',
  },
  mapping: {
    id: 'app.components.formBuilder.printSupportTooltip.mapping',
    defaultMessage:
      'Mapping questions are shown on the downloaded PDF, but layers will not be visible. Mapping questions are not supported for import via FormSync.',
  },
});
