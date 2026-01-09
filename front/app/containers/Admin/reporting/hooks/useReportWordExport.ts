import { useState, useCallback } from 'react';

import { SerializedNodes } from '@craftjs/core';
import { saveAs } from 'file-saver';

import useLocale from 'hooks/useLocale';

import { trackEventByName } from 'utils/analytics';
import {
  collectCraftJSContent,
  getChartNodeIds,
  generateWordDocument,
  rasterizeSvgToBase64,
} from 'utils/wordExport';

export interface UseReportWordExportOptions {
  reportId: string;
  reportTitle: string;
  onError?: (error: string) => void;
}

export interface UseReportWordExportReturn {
  downloadWord: (nodes: SerializedNodes) => Promise<void>;
  isDownloading: boolean;
  error: string | null;
}

/**
 * Hook for downloading a report as a Word (.docx) document.
 * Uses the CraftJS node structure to generate the document.
 */
export default function useReportWordExport({
  reportId,
  reportTitle,
  onError,
}: UseReportWordExportOptions): UseReportWordExportReturn {
  const locale = useLocale();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadWord = useCallback(
    async (nodes: SerializedNodes) => {
      setIsDownloading(true);
      setError(null);

      try {
        // Get chart node IDs that need to be rasterized
        const chartNodeIds = getChartNodeIds(nodes);

        // Collect SVG elements from the report preview
        // The report preview should be rendered with the same content
        const chartImages = new Map<string, string>();

        // Try to find chart SVGs in the DOM
        // Look for SVGs in the main report content area
        const reportContainer = window.document.querySelector(
          '[data-testid="report-content"], .report-content, [class*="ViewContainer"]'
        );

        if (reportContainer) {
          const svgElements = reportContainer.querySelectorAll('svg');

          for (let i = 0; i < svgElements.length; i++) {
            const svg = svgElements[i];
            // Only process SVGs that look like charts (reasonable dimensions)
            if (svg.clientWidth > 100 && svg.clientHeight > 50) {
              try {
                const imageData = await rasterizeSvgToBase64(svg);
                // Use index as fallback ID if no chart node ID matches
                const nodeId = chartNodeIds[i] || `chart-${i}`;
                chartImages.set(nodeId, imageData);
              } catch (err) {
                console.error(`Failed to rasterize chart:`, err);
              }
            }
          }
        }

        // Collect content from CraftJS nodes
        const wordDocument = collectCraftJSContent({
          craftJson: nodes,
          locale,
          title: reportTitle,
          chartImages,
        });

        // Generate the Word document
        const blob = await generateWordDocument(wordDocument, { locale });

        // Generate filename with timestamp
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, 19);

        const sanitizedTitle = reportTitle
          .replace(/[^a-zA-Z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase();

        // Save the file
        saveAs(blob, `${sanitizedTitle}-${timestamp}.docx`);

        // Track the download
        trackEventByName('Report Word document downloaded', {
          reportId,
          title: reportTitle,
        });
      } catch (err) {
        console.error('Word export error:', err);
        const errorMessage =
          'Failed to download Word document. Please try again.';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsDownloading(false);
      }
    },
    [locale, reportId, reportTitle, onError]
  );

  return {
    downloadWord,
    isDownloading,
    error,
  };
}
