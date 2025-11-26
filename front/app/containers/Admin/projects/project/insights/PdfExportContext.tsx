import React, { createContext, useContext, ReactNode } from 'react';

import useInsightsPdfDownload from './useInsightsPdfDownload';

interface PdfExportContextValue {
  isPdfExport: boolean;
  downloadPdf: () => Promise<void>;
  isDownloading: boolean;
}

const PdfExportContext = createContext<PdfExportContextValue>({
  isPdfExport: false,
  downloadPdf: async () => {},
  isDownloading: false,
});

interface PdfExportProviderProps {
  children: ReactNode;
  filename: string;
}

export const PdfExportProvider = ({
  children,
  filename,
}: PdfExportProviderProps) => {
  const { downloadPdf, isDownloading, isPdfExport } = useInsightsPdfDownload({
    filename,
  });

  return (
    <PdfExportContext.Provider
      value={{ isPdfExport, downloadPdf, isDownloading }}
    >
      {children}
    </PdfExportContext.Provider>
  );
};

export const usePdfExportContext = () => useContext(PdfExportContext);

export default PdfExportContext;
