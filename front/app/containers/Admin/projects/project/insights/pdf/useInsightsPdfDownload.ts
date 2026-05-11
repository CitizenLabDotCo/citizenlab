import { useState, useCallback, useRef, useEffect } from 'react';

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
  skippedSections: string[];
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 15;
const SECTION_GAP_MM = 4;
const CAPTURE_SCALE = 1;
const SECTION_TIMEOUT_MS = 45_000;
const FONTS_READY_TIMEOUT_MS = 3_000;
const CHARTS_READY_TIMEOUT_MS = 3_000;
const CONTAINER_MOUNT_TIMEOUT_MS = 3_000;
const EMPTY_CAPTURE_RETRY_DELAY_MS = 200;

const sliceCanvas = (
  source: HTMLCanvasElement,
  sourceY: number,
  sliceHeightPx: number
): HTMLCanvasElement | null => {
  const slice = document.createElement('canvas');
  slice.width = source.width;
  slice.height = sliceHeightPx;
  const ctx = slice.getContext('2d');
  if (!ctx) return null;
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

const sectionLabel = (section: HTMLElement, index: number): string => {
  const heading = section.querySelector('h1, h2, h3, h4');
  const text = heading?.textContent?.trim();
  if (text) return text.slice(0, 80);
  return `Section ${index + 1}`;
};

// `setIsDownloading(true)` triggers a re-render that mounts the hidden
// container, but the DOM node is not present until React commits. Poll for it.
const waitForContainer = (
  containerId: string,
  maxMs: number
): Promise<HTMLElement | null> =>
  new Promise((resolve) => {
    const start = performance.now();
    const tick = () => {
      const el = document.getElementById(containerId);
      if (el) {
        resolve(el);
      } else if (performance.now() - start > maxMs) {
        resolve(null);
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });

// Recharts ResponsiveContainer can briefly report -1 x -1 during the first
// paints after mount; capturing then yields a 0 x 0 canvas and the section
// is silently dropped. Wait until every chart and section measures non-zero.
const waitForLayout = (container: HTMLElement, maxMs: number): Promise<void> =>
  new Promise((resolve) => {
    const start = performance.now();
    const tick = () => {
      const charts = container.querySelectorAll<HTMLElement>(
        '.recharts-responsive-container'
      );
      const chartsReady = Array.from(charts).every(
        (el) => el.clientWidth > 0 && el.clientHeight > 0
      );
      const sections = container.querySelectorAll<HTMLElement>(
        '[data-pdf-section="true"]'
      );
      const sectionsReady = Array.from(sections).every((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if ((chartsReady && sectionsReady) || performance.now() - start > maxMs) {
        resolve();
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });

/**
 * Per-section capture avoids Chromium's ~16,384 px canvas dimension limit,
 * which produced blank multi-page PDFs on heavy phases (TAN-7597). snapDOM
 * is used over html2canvas because it renders via SVG `<foreignObject>`,
 * which is faster on heavy DOM and lets Recharts measure correctly during
 * capture (html2canvas's iframe clone reported `-1 x -1` and dropped charts).
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
  const [skippedSections, setSkippedSections] = useState<string[]>([]);

  const isMountedRef = useRef(true);
  const isDownloadingRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeSetIsDownloading = (v: boolean) => {
    if (isMountedRef.current) setIsDownloading(v);
  };
  const safeSetError = (v: string | null) => {
    if (isMountedRef.current) setError(v);
  };
  const safeSetStatus = (v: PdfExportStatus) => {
    if (isMountedRef.current) setStatus(v);
  };
  const safeSetProgress = (v: { completed: number; total: number }) => {
    if (isMountedRef.current) setProgress(v);
  };
  const safeSetSkippedSections = (v: string[]) => {
    if (isMountedRef.current) setSkippedSections(v);
  };

  const downloadPdf = useCallback(async () => {
    if (isDownloadingRef.current) return;
    isDownloadingRef.current = true;

    safeSetIsDownloading(true);
    safeSetError(null);
    safeSetStatus('preparing');
    safeSetProgress({ completed: 0, total: 0 });
    safeSetSkippedSections([]);

    const skippedLabels: string[] = [];

    try {
      const containerPromise = waitForContainer(
        hiddenContainerId,
        CONTAINER_MOUNT_TIMEOUT_MS
      );

      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, FONTS_READY_TIMEOUT_MS)),
      ]);

      const [{ snapdom }, { default: jsPDF }, container] = await Promise.all([
        import('@zumer/snapdom'),
        import('jspdf'),
        containerPromise,
      ]);

      if (!container) {
        throw new Error(`Element with id "${hiddenContainerId}" not found`);
      }

      await waitForLayout(container, CHARTS_READY_TIMEOUT_MS);

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

      safeSetStatus('capturing');
      safeSetProgress({ completed: 0, total: sections.length });

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

      const captureSection = (section: HTMLElement) =>
        captureWithTimeout(
          () =>
            snapdom.toCanvas(section, {
              scale: CAPTURE_SCALE,
              backgroundColor: colors.white,
              embedFonts: true,
            }),
          SECTION_TIMEOUT_MS
        );

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const label = sectionLabel(section, i);
        const rect = section.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          skippedLabels.push(label);
          safeSetProgress({ completed: i + 1, total: sections.length });
          continue;
        }

        let canvas = await captureSection(section);

        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          // Recharts can transiently measure to 0 on the first capture pass
          // even when the live DOM looks settled; retry once.
          await new Promise((resolve) =>
            setTimeout(resolve, EMPTY_CAPTURE_RETRY_DELAY_MS)
          );
          canvas = await captureSection(section);
        }

        safeSetProgress({ completed: i + 1, total: sections.length });

        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          skippedLabels.push(label);
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
          if (pageHeightPx <= 0) {
            skippedLabels.push(label);
            continue;
          }
          let srcY = 0;
          let lastSliceHeightMm = 0;
          let sliceFailed = false;
          while (srcY < canvas.height) {
            const sliceHeightPx = Math.min(pageHeightPx, canvas.height - srcY);
            const slice = sliceCanvas(canvas, srcY, sliceHeightPx);
            if (!slice) {
              sliceFailed = true;
              break;
            }
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
          if (sliceFailed) {
            skippedLabels.push(label);
            continue;
          }
          cursorY = PAGE_MARGIN_MM + lastSliceHeightMm + SECTION_GAP_MM;
          pageStarted = true;
        }
      }

      safeSetStatus('generating');
      safeSetSkippedSections(skippedLabels);

      if (skippedLabels.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(
          `[InsightsPdf] Skipped ${skippedLabels.length}/${sections.length} section(s):`,
          skippedLabels
        );
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
      pdf.save(`${filename}-${timestamp}.pdf`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF download error:', err);
      safeSetError(errorMessage);
    } finally {
      isDownloadingRef.current = false;
      safeSetIsDownloading(false);
      safeSetStatus('idle');
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
