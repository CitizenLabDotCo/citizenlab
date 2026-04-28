import { useState, useCallback } from 'react';

import { colors } from '@citizenlab/cl2-component-library';

interface UseInsightsPdfDownloadOptions {
  filename?: string;
  hiddenContainerId?: string;
  errorMessage: string;
}

export type PdfExportStatus = 'idle' | 'preparing' | 'capturing' | 'generating';

interface UseInsightsPdfDownloadReturn {
  downloadPdf: () => Promise<void>;
  isDownloading: boolean;
  error: string | null;
  status: PdfExportStatus;
  progress: { completed: number; total: number };
  skippedSections: number;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 15;
const SECTION_GAP_MM = 4;
const CAPTURE_SCALE = 1.5;
const SECTION_TIMEOUT_MS = 45_000;
const IMAGE_TIMEOUT_MS = 8_000;

const sliceCanvas = (
  source: HTMLCanvasElement,
  sourceY: number,
  sliceHeightPx: number
): HTMLCanvasElement => {
  const slice = document.createElement('canvas');
  slice.width = source.width;
  slice.height = sliceHeightPx;
  const ctx = slice.getContext('2d');
  if (!ctx) return slice;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, slice.width, slice.height);
  ctx.drawImage(
    source,
    0,
    sourceY,
    source.width,
    sliceHeightPx,
    0,
    0,
    source.width,
    sliceHeightPx
  );
  return slice;
};

const captureWithTimeout = async (
  capture: () => Promise<HTMLCanvasElement>,
  timeoutMs: number
): Promise<HTMLCanvasElement | null> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race<HTMLCanvasElement | null>([
      capture(),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

/**
 * Hook for downloading insights tab content as a PDF.
 *
 * Captures each `[data-pdf-section="true"]` element inside the hidden offscreen
 * container as its own canvas via html2canvas, then assembles the canvases into
 * a paginated A4 PDF with jsPDF. Per-section capture is necessary because a
 * single html2canvas call on the whole tree can exceed Chromium's ~16,384 px
 * canvas dimension limit and silently return a blank canvas (which manifested
 * as a multi-page PDF of blank pages on heavy phases — TAN-7597).
 */
export default function useInsightsPdfDownload({
  errorMessage,
  filename = 'insights',
  hiddenContainerId = 'insights-pdf-hidden-container',
}: UseInsightsPdfDownloadOptions): UseInsightsPdfDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<PdfExportStatus>('idle');
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [skippedSections, setSkippedSections] = useState(0);

  const downloadPdf = useCallback(async () => {
    setIsDownloading(true);
    setError(null);
    setStatus('preparing');
    setProgress({ completed: 0, total: 0 });
    setSkippedSections(0);

    try {
      // Allow React to render the hidden PDF container; Recharts ResponsiveContainer
      // needs time to measure dimensions. Animation is disabled in PDF mode so
      // layout settle is enough — we don't have to wait for chart animations.
      await new Promise((resolve) => setTimeout(resolve, 150));
      await document.fonts.ready;

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const container = document.getElementById(hiddenContainerId);
      if (!container) {
        throw new Error(`Element with id "${hiddenContainerId}" not found`);
      }

      // Use the deepest markers — when an outer section contains inner ones,
      // the outer is too coarse (and may exceed the 16,384 px canvas limit on
      // heavy phases). This lets InsightsPdfContent declare a coarse marker
      // around MethodSpecificInsights for the small method types while
      // SurveyResultsPdfExport overrides it with per-question markers for
      // native_survey.
      const allMarkers = Array.from(
        container.querySelectorAll<HTMLElement>('[data-pdf-section="true"]')
      );
      const sections = allMarkers.filter(
        (el) => !el.querySelector('[data-pdf-section="true"]')
      );

      if (sections.length === 0) {
        throw new Error('No PDF sections found in hidden container');
      }

      setStatus('capturing');
      setProgress({ completed: 0, total: sections.length });

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      });

      const usableWidthMm = A4_WIDTH_MM - 2 * PAGE_MARGIN_MM;
      const usableHeightMm = A4_HEIGHT_MM - 2 * PAGE_MARGIN_MM;
      const pageBottomMm = A4_HEIGHT_MM - PAGE_MARGIN_MM;
      let cursorY = PAGE_MARGIN_MM;
      let pageStarted = false;
      let skipped = 0;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          skipped += 1;
          setProgress({ completed: i + 1, total: sections.length });
          continue;
        }

        const canvas = await captureWithTimeout(
          () =>
            html2canvas(section, {
              scale: CAPTURE_SCALE,
              useCORS: true,
              logging: false,
              backgroundColor: colors.white,
              imageTimeout: IMAGE_TIMEOUT_MS,
            }),
          SECTION_TIMEOUT_MS
        );

        setProgress({ completed: i + 1, total: sections.length });

        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          skipped += 1;
          // eslint-disable-next-line no-console
          console.warn(
            `[InsightsPdf] Skipped section ${i + 1}/${
              sections.length
            } (timeout or empty)`,
            section
          );
          continue;
        }

        const fullHeightMm = (canvas.height / canvas.width) * usableWidthMm;

        if (fullHeightMm <= usableHeightMm) {
          if (pageStarted && cursorY + fullHeightMm > pageBottomMm) {
            pdf.addPage();
            cursorY = PAGE_MARGIN_MM;
          }
          pdf.addImage(
            canvas,
            'JPEG',
            PAGE_MARGIN_MM,
            cursorY,
            usableWidthMm,
            fullHeightMm,
            undefined,
            'FAST'
          );
          cursorY += fullHeightMm + SECTION_GAP_MM;
          pageStarted = true;
        } else {
          // Section is taller than one page. Slice it across pages so we never
          // hand a >16,384px canvas to addImage and never lose content. Each
          // slice is a fresh small canvas drawn from a vertical strip of the
          // source canvas — jsPDF doesn't support source rectangles directly.
          if (pageStarted && cursorY > PAGE_MARGIN_MM) {
            pdf.addPage();
            cursorY = PAGE_MARGIN_MM;
          }
          const pageHeightPx = Math.floor(
            (usableHeightMm / usableWidthMm) * canvas.width
          );
          let srcY = 0;
          let lastSliceHeightMm = 0;
          while (srcY < canvas.height) {
            const sliceHeightPx = Math.min(pageHeightPx, canvas.height - srcY);
            const slice = sliceCanvas(canvas, srcY, sliceHeightPx);
            const sliceMmHeight =
              (sliceHeightPx / canvas.width) * usableWidthMm;
            pdf.addImage(
              slice,
              'JPEG',
              PAGE_MARGIN_MM,
              PAGE_MARGIN_MM,
              usableWidthMm,
              sliceMmHeight,
              undefined,
              'FAST'
            );
            srcY += sliceHeightPx;
            lastSliceHeightMm = sliceMmHeight;
            if (srcY < canvas.height) {
              pdf.addPage();
            }
          }
          cursorY = PAGE_MARGIN_MM + lastSliceHeightMm + SECTION_GAP_MM;
          pageStarted = true;
        }
      }

      setStatus('generating');
      setSkippedSections(skipped);

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
      pdf.save(`${filename}-${timestamp}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
      setError(errorMessage);
    } finally {
      setIsDownloading(false);
      setStatus('idle');
    }
  }, [hiddenContainerId, filename, errorMessage]);

  return {
    downloadPdf,
    isDownloading,
    error,
    status,
    progress,
    skippedSections,
  };
}
