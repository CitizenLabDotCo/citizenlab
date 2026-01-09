import { SupportedLocale, Multiloc } from 'typings';

import { CraftJson } from 'components/admin/ContentBuilder/typings';

import {
  WordExportDocument,
  WordExportSection,
  TextSection,
  ImageSection,
  ChartSection,
  WhiteSpaceSection,
} from '../types';

export interface CraftJSCollectorOptions {
  craftJson: CraftJson;
  locale: SupportedLocale;
  title: string;
  chartImages: Map<string, string>; // nodeId -> base64 image data
}

// Widget types that are charts and need pre-rasterized images
const CHART_WIDGET_TYPES = [
  'ParticipantsWidget',
  'ParticipationWidget',
  'RegistrationsWidget',
  'VisitorsWidget',
  'VisitorsTrafficSourcesWidget',
  'DemographicsWidget',
  'MethodsUsedWidget',
  'ProjectsTimelineWidget',
  'CommunityMonitorHealthScoreWidget',
  'SurveyQuestionResultWidget',
];

/**
 * Collects content from a CraftJS JSON structure and converts it to WordExportDocument format.
 * Used for Report Builder export.
 */
export function collectCraftJSContent(
  options: CraftJSCollectorOptions
): WordExportDocument {
  const { craftJson, locale, title, chartImages } = options;
  const sections: WordExportSection[] = [];

  // Find the root node
  const rootNodeId = findRootNode(craftJson);

  if (rootNodeId) {
    // Traverse the tree and collect sections
    traverseAndCollect(craftJson, rootNodeId, sections, locale, chartImages);
  }

  return {
    title,
    sections,
    metadata: {
      locale,
      createdAt: new Date(),
      author: 'Go Vocal',
    },
  };
}

/**
 * Finds the root node in the CraftJS JSON structure.
 */
function findRootNode(nodes: CraftJson): string | null {
  // ROOT is the conventional name for the root node in CraftJS
  if ('ROOT' in nodes) {
    return 'ROOT';
  }

  // Fallback: find node with no parent or parent === null
  for (const [id, node] of Object.entries(nodes)) {
    if (!node.parent || node.parent === 'ROOT') {
      return id;
    }
  }

  return null;
}

/**
 * Recursively traverses the CraftJS tree and collects sections.
 */
function traverseAndCollect(
  nodes: CraftJson,
  nodeId: string,
  sections: WordExportSection[],
  locale: SupportedLocale,
  chartImages: Map<string, string>
): void {
  // Check if node exists (nodeId may not be in the CraftJson object)
  if (!(nodeId in nodes)) return;
  const node = nodes[nodeId];

  // Convert the current node to a section
  const section = nodeToSection(node, nodeId, locale, chartImages);
  if (section) {
    sections.push(section);
  }

  // Get child node IDs
  const childIds = getChildNodeIds(node);

  // Process children
  for (const childId of childIds) {
    traverseAndCollect(nodes, childId, sections, locale, chartImages);
  }
}

/**
 * Gets all child node IDs from a node (including linked nodes).
 */
function getChildNodeIds(node: any): string[] {
  const children: string[] = [];

  // Direct children
  if (node.nodes && Array.isArray(node.nodes)) {
    children.push(...node.nodes);
  }

  // Linked nodes (used by TwoColumn and other container widgets)
  if (node.linkedNodes && typeof node.linkedNodes === 'object') {
    children.push(...(Object.values(node.linkedNodes) as string[]));
  }

  return children;
}

/**
 * Converts a CraftJS node to a WordExportSection.
 */
function nodeToSection(
  node: any,
  nodeId: string,
  locale: SupportedLocale,
  chartImages: Map<string, string>
): WordExportSection | null {
  const { type, props } = node;

  // Get the resolved type name
  const resolvedType = typeof type === 'string' ? type : type?.resolvedName;

  if (!resolvedType) return null;

  switch (resolvedType) {
    case 'TextMultiloc':
      return convertTextMultiloc(props, locale);

    case 'ImageMultiloc':
      return convertImageMultiloc(props, locale);

    case 'WhiteSpace':
      return convertWhiteSpace(props);

    case 'TwoColumn':
      // TwoColumn children are handled by the linked nodes
      // We don't create a layout section here as children are processed separately
      return null;

    case 'IframeMultiloc':
      return {
        type: 'text',
        content: '[Embedded content not available in Word export]',
        variant: 'paragraph',
      };

    case 'SingleIdeaWidget':
      return convertSingleIdeaWidget(props, locale);

    case 'MostReactedIdeasWidget':
      return {
        type: 'text',
        content: getMultilocText(props.title, locale) || 'Most Reacted Ideas',
        variant: 'h3',
      };

    case 'ProjectsWidget':
      return {
        type: 'text',
        content: 'Projects',
        variant: 'h3',
      };

    // Chart widgets - use pre-rasterized images
    default:
      if (CHART_WIDGET_TYPES.includes(resolvedType)) {
        return convertChartWidget(props, nodeId, locale, chartImages);
      }

      // Skip unknown widget types
      return null;
  }
}

/**
 * Converts TextMultiloc widget to TextSection.
 */
function convertTextMultiloc(
  props: any,
  locale: SupportedLocale
): TextSection | null {
  const text = getMultilocText(props.text, locale);

  if (!text) return null;

  return {
    type: 'text',
    content: text,
    variant: 'paragraph',
  };
}

/**
 * Converts ImageMultiloc widget to ImageSection.
 */
function convertImageMultiloc(
  props: any,
  locale: SupportedLocale
): ImageSection | null {
  const imageUrl = props.image?.imageUrl;

  if (!imageUrl) return null;

  return {
    type: 'image',
    src: imageUrl,
    alt: getMultilocText(props.alt, locale),
  };
}

/**
 * Converts WhiteSpace widget to WhiteSpaceSection.
 */
function convertWhiteSpace(props: any): WhiteSpaceSection {
  // Map the widget's size prop to our standard sizes
  const validSizes = ['small', 'medium', 'large'] as const;
  const size = validSizes.includes(props.size) ? props.size : 'medium';

  return {
    type: 'whitespace',
    size,
  };
}

/**
 * Converts a chart widget to ChartSection using pre-rasterized image.
 */
function convertChartWidget(
  props: any,
  nodeId: string,
  locale: SupportedLocale,
  chartImages: Map<string, string>
): ChartSection | TextSection {
  const imageData = chartImages.get(nodeId);
  const title = getMultilocText(props.title, locale);

  if (!imageData) {
    return {
      type: 'text',
      content: title
        ? `[Chart: ${title} - not available]`
        : '[Chart not available]',
      variant: 'paragraph',
    };
  }

  return {
    type: 'chart',
    imageData,
    title,
    width: 600,
    height: 350,
  };
}

/**
 * Converts SingleIdeaWidget to a text section.
 */
function convertSingleIdeaWidget(
  _props: any,
  _locale: SupportedLocale
): TextSection {
  // The actual idea content would need to be fetched
  // For now, we just indicate where the idea would be
  return {
    type: 'text',
    content: '[Idea content]',
    variant: 'paragraph',
  };
}

/**
 * Extracts text from a Multiloc object for the given locale.
 * Falls back to the first available locale if the requested one is not available.
 */
function getMultilocText(
  multiloc: Multiloc | undefined,
  locale: SupportedLocale
): string {
  if (!multiloc) return '';

  // Try the requested locale first
  if (multiloc[locale]) {
    return multiloc[locale] ?? '';
  }

  // Fallback to first available locale
  const values = Object.values(multiloc);
  return values.length > 0 ? values[0] ?? '' : '';
}

/**
 * Helper to collect all chart node IDs from CraftJS JSON.
 * Use this to know which charts need to be pre-rasterized.
 */
export function getChartNodeIds(craftJson: CraftJson): string[] {
  const chartNodeIds: string[] = [];

  for (const [nodeId, node] of Object.entries(craftJson)) {
    const resolvedType =
      typeof node.type === 'string' ? node.type : node.type.resolvedName;

    if (resolvedType && CHART_WIDGET_TYPES.includes(resolvedType)) {
      chartNodeIds.push(nodeId);
    }
  }

  return chartNodeIds;
}
