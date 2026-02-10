import React, { createContext, useContext, ReactNode } from 'react';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import useInsightsPdfDownload from './useInsightsPdfDownload';

interface PdfExportContextValue {
  downloadPdf: () => Promise<void>;
  /**
   * True when the PDF generation process is active (for the entire page).
   * Used for showing loading states on buttons and mounting the hidden PDF container.
   */
  isDownloading: boolean;
  error: string | null;
  /**
   * True only for components inside the hidden PDF render tree.
   * Used to render PDF-optimized layouts (expanded accordions, single-column, etc.)
   * without affecting the visible UI during PDF generation.
   */
  isPdfRenderMode: boolean;
}

const PdfExportContext = createContext<PdfExportContextValue>({
  downloadPdf: async () => {},
  isDownloading: false,
  error: null,
  isPdfRenderMode: false,
});

interface PdfExportProviderProps {
  children: ReactNode;
  filename?: string;
  isPdfRenderMode?: boolean;
}

export const PdfExportProvider = ({
  children,
  filename,
  isPdfRenderMode = false,
}: PdfExportProviderProps) => {
  const { formatMessage } = useIntl();
  const parentContext = useContext(PdfExportContext);
  const { downloadPdf, isDownloading, error } = useInsightsPdfDownload({
    filename: filename || '',
    errorMessage: formatMessage(messages.errorPdfDownload),
  });

  // If nested (no filename), inherit download state from parent
  const value = filename
    ? { downloadPdf, isDownloading, error, isPdfRenderMode }
    : { ...parentContext, isPdfRenderMode };

  return (
    <PdfExportContext.Provider value={value}>
      {children}
    </PdfExportContext.Provider>
  );
};

export const usePdfExportContext = () => useContext(PdfExportContext);
