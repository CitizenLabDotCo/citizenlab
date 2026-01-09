import { SupportedLocale } from 'typings';

import { IPhaseData } from 'api/phases/types';

import {
  rasterizeSvgToBase64,
  getSvgFromRechartsRef,
} from '../converters/chartConverter';
import { WordExportDocument, WordExportSection, ChartSection } from '../types';

export interface InsightsCollectorOptions {
  phase: IPhaseData;
  locale: SupportedLocale;
  phaseName: string;
  chartRefs?: Map<string, React.RefObject<any>>;
  chartSvgElements?: Map<string, SVGElement>;
}

/**
 * Collects content from the Insights tab and converts it to WordExportDocument format.
 * This collector handles the phase insights view including metrics and charts.
 */
export async function collectInsightsContent(
  options: InsightsCollectorOptions
): Promise<WordExportDocument> {
  const { locale, phaseName, chartRefs, chartSvgElements } = options;
  const sections: WordExportSection[] = [];

  // Title section
  sections.push({
    type: 'text',
    content: phaseName,
    variant: 'h1',
  });

  sections.push({
    type: 'text',
    content: 'Insights',
    variant: 'h2',
  });

  // Add whitespace
  sections.push({
    type: 'whitespace',
    size: 'medium',
  });

  // Rasterize charts from refs if provided
  if (chartRefs) {
    for (const [chartId, ref] of chartRefs) {
      const svg = getSvgFromRechartsRef(ref);
      if (svg) {
        try {
          const imageData = await rasterizeSvgToBase64(svg);
          const chartSection: ChartSection = {
            type: 'chart',
            imageData,
            title: formatChartTitle(chartId),
            width: 600,
            height: 300,
          };
          sections.push(chartSection);
          sections.push({ type: 'whitespace', size: 'medium' });
        } catch (error) {
          console.error(`Failed to rasterize chart ${chartId}:`, error);
          sections.push({
            type: 'text',
            content: `[Chart "${chartId}" could not be exported]`,
            variant: 'paragraph',
          });
        }
      }
    }
  }

  // Rasterize charts from SVG elements if provided
  if (chartSvgElements) {
    for (const [chartId, svg] of chartSvgElements) {
      try {
        const imageData = await rasterizeSvgToBase64(svg);
        const chartSection: ChartSection = {
          type: 'chart',
          imageData,
          title: formatChartTitle(chartId),
          width: 600,
          height: 300,
        };
        sections.push(chartSection);
        sections.push({ type: 'whitespace', size: 'medium' });
      } catch (error) {
        console.error(`Failed to rasterize chart ${chartId}:`, error);
        sections.push({
          type: 'text',
          content: `[Chart "${chartId}" could not be exported]`,
          variant: 'paragraph',
        });
      }
    }
  }

  return {
    title: `${phaseName} - Insights`,
    sections,
    metadata: {
      locale,
      createdAt: new Date(),
      author: 'Go Vocal',
    },
  };
}

/**
 * Formats a chart ID into a human-readable title.
 */
function formatChartTitle(chartId: string): string {
  return chartId
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Helper to collect all SVG elements from a container for export.
 * Use this when you have a DOM container with multiple charts.
 */
export function collectSvgElementsFromContainer(
  container: HTMLElement
): Map<string, SVGElement> {
  const svgMap = new Map<string, SVGElement>();

  // Find all SVG elements with data-chart-id attribute or within chart containers
  const svgElements = container.querySelectorAll('svg');

  svgElements.forEach((svg, index) => {
    // Try to get chart ID from data attribute or parent
    const chartId =
      svg.getAttribute('data-chart-id') ||
      svg.closest('[data-chart-id]')?.getAttribute('data-chart-id') ||
      `chart-${index + 1}`;

    // Only include SVGs that look like charts (have reasonable size)
    if (svg.clientWidth > 100 && svg.clientHeight > 50) {
      svgMap.set(chartId, svg);
    }
  });

  return svgMap;
}
