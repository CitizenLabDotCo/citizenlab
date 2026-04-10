import { defineMessages } from 'react-intl';

export default defineMessages({
  downloadPDF: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.downloadPDF2',
    defaultMessage: 'Download PDF',
  },
  paperFormsOCR: {
    id: 'app.components.FormSync.paperFormsOCR1',
    defaultMessage: 'Paper forms OCR',
  },
  paperFormsOCRDescription: {
    id: 'app.components.FormSync.paperFormsOCRDescription1',
    defaultMessage: 'Print form, collect on paper, scan responses back',
  },
  importScans: {
    id: 'app.components.FormSync.importScans1',
    defaultMessage: 'Import scans',
  },
  spreadsheet: {
    id: 'app.components.FormSync.spreadsheet1',
    defaultMessage: 'Spreadsheet',
  },
  spreadsheetDescription: {
    id: 'app.components.FormSync.spreadsheetDescription1',
    defaultMessage: 'Import response data from Excel or CSV',
  },
  downloadExcelTemplateTooltip: {
    id: 'app.components.FormSync.downloadExcelTemplateTooltip3',
    defaultMessage:
      'Excel templates will not include File upload questions and any mapping input questions (Drop Pin, Draw Route, Draw Area, ESRI file upload) as these are not supported for bulk importing at this time.',
  },
  template: {
    id: 'app.components.FormSync.template1',
    defaultMessage: 'Template',
  },
  importFile: {
    id: 'app.components.FormSync.importFile1',
    defaultMessage: 'Import file',
  },
  unlockScanning: {
    id: 'app.components.FormSync.unlockScanning1',
    defaultMessage: 'Unlock scanning',
  },
  unlockScanningTooltip1: {
    id: 'app.components.FormSync.unlockScanningTooltip1',
    defaultMessage:
      'Scanning paper forms with FormSync is not included on your current plan.',
  },
  unlockScanningTooltip2: {
    id: 'app.components.FormSync.unlockScanningTooltip2',
    defaultMessage:
      'Talk to your Government Success Manager or admin to unlock it.',
  },
});
