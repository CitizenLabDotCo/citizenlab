// Types
export type {
  WordExportDocument,
  WordExportSection,
  TextSection,
  ImageSection,
  ChartSection,
  TableSection,
  LayoutSection,
  WhiteSpaceSection,
  WordDocumentMetadata,
  ContentCollectorOptions,
  ChartRasterizationOptions,
} from './types';

export { WordExportError, WordExportErrorCode } from './types';

// Document generator
export {
  generateWordDocument,
  type GenerateWordDocumentOptions,
} from './generateWordDocument';

// Converters
export {
  convertText,
  convertPlainText,
  convertImage,
  convertChart,
  convertTable,
  convertKeyValueTable,
  convertLayout,
  rasterizeSvgToBase64,
  rasterizeChartsBatch,
  rasterizeHtmlToBase64,
  getSvgFromRechartsRef,
  base64ToUint8Array,
} from './converters';

// Collectors
export {
  collectInsightsContent,
  collectSvgElementsFromContainer,
  collectCraftJSContent,
  getChartNodeIds,
  type InsightsCollectorOptions,
  type CraftJSCollectorOptions,
} from './collectors';
