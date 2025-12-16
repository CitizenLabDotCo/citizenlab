import { useState, useCallback } from 'react';

import { colors } from '@citizenlab/cl2-component-library';

interface UseInsightsPdfDownloadOptions {
  filename?: string;
  containerId?: string;
  errorMessage: string;
}

interface UseInsightsPdfDownloadReturn {
  downloadPdf: () => Promise<void>;
  isDownloading: boolean;
  isPdfExport: boolean;
  error: string | null;
}

/**
 * Hook for downloading insights tab content as a PDF.
 * Manages both the download state and the PDF export mode state.
 */
export default function useInsightsPdfDownload({
  errorMessage,
  filename = 'insights',
  containerId = 'insights-pdf-container',
}: UseInsightsPdfDownloadOptions): UseInsightsPdfDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPdfExport, setIsPdfExport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = useCallback(async () => {
    setIsDownloading(true);
    setIsPdfExport(true);
    setError(null);

    try {
      // Allow React to re-render with PDF export mode
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Lazy load html2pdf.js to reduce initial bundle size (~500KB gzipped)
      const html2pdf = (await import('html2pdf.js')).default;

      const element = document.getElementById(containerId);

      if (!element) {
        throw new Error(`Element with id "${containerId}" not found`);
      }

      // Clone the element to avoid modifying the original
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // Remove action buttons and elements marked for exclusion from PDF
      const actionsToRemove = clonedElement.querySelectorAll(
        '[data-pdf-exclude="true"], .dropdown, .auto-insights-placeholder'
      );
      actionsToRemove.forEach((el) => el.remove());

      // Remove all buttons (export menus, etc.)
      const buttonsToRemove = clonedElement.querySelectorAll('button');
      buttonsToRemove.forEach((el) => el.remove());

      // Configure PDF options for accessibility
      const options = {
        margin: [15, 15, 15, 15] as [number, number, number, number],
        filename: `${filename}-${new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, 19)}.pdf`,
        image: {
          type: 'jpeg' as const,
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          // Ensure proper rendering of styled components
          allowTaint: true,
          backgroundColor: colors.white,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as const,
          compress: true,
        },
        // Page break settings - keeps titles with their content
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: [
            'section',
            'figure',
            'table',
            '.chart-container',
            'h1',
            'h2',
            'h3',
            'h4',
            // PageBreakBox styled component - prevents orphaned headers
            '[class*="PageBreakBox"]',
          ],
        },
      };

      await html2pdf().set(options).from(clonedElement).save();
    } catch (err) {
      console.error('PDF download error:', err);
      setError(errorMessage);
    } finally {
      setIsPdfExport(false);
      setIsDownloading(false);
    }
  }, [containerId, filename, errorMessage]);

  return {
    downloadPdf,
    isDownloading,
    isPdfExport,
    error,
  };
}
