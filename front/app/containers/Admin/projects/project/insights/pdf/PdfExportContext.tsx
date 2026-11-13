import React, { createContext, useContext, ReactNode } from 'react';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import useInsightsPdfDownload, {
  PdfExportStatus,
} from './useInsightsPdfDownload';

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
  status: PdfExportStatus;
  progress: { completed: number; total: number };
  skippedSections: string[];
}

export const PdfExportContext = createContext<PdfExportContextValue>({
  downloadPdf: async () => {},
  isDownloading: false,
  error: null,
  isPdfRenderMode: false,
  status: 'idle',
  progress: { completed: 0, total: 0 },
  skippedSections: [],
});

interface PdfExportProviderProps {
  children: ReactNode;
  filename: string;
}

export const PdfExportProvider = ({
  children,
  filename,
}: PdfExportProviderProps) => {
  const { formatMessage } = useIntl();
  const {
    downloadPdf,
    isDownloading,
    error,
    status,
    progress,
    skippedSections,
  } = useInsightsPdfDownload({
    filename,
    errorMessage: formatMessage(messages.errorPdfDownload),
  });

  const value = {
    downloadPdf,
    isDownloading,
    error,
    isPdfRenderMode: false,
    status,
    progress,
    skippedSections,
  };

  return (
    <PdfExportContext.Provider value={value}>
      {children}
    </PdfExportContext.Provider>
  );
};

export const usePdfExportContext = () => useContext(PdfExportContext);
