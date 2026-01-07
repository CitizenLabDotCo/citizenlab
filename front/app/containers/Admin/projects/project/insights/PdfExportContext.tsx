import React, { createContext, useContext, ReactNode } from 'react';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import useInsightsPdfDownload from './useInsightsPdfDownload';

interface PdfExportContextValue {
  downloadPdf: () => Promise<void>;
  isDownloading: boolean;
  error: string | null;
}

const PdfExportContext = createContext<PdfExportContextValue>({
  downloadPdf: async () => {},
  isDownloading: false,
  error: null,
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
  const { downloadPdf, isDownloading, error } = useInsightsPdfDownload({
    filename,
    errorMessage: formatMessage(messages.errorPdfDownload),
  });

  return (
    <PdfExportContext.Provider value={{ downloadPdf, isDownloading, error }}>
      {children}
    </PdfExportContext.Provider>
  );
};

export const usePdfExportContext = () => useContext(PdfExportContext);
