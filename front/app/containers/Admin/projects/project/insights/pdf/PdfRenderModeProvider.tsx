import React, { ReactNode, useContext } from 'react';

import { PdfExportContext } from './PdfExportContext';

interface Props {
  children: ReactNode;
}

// Wraps the hidden PDF tree, which sits inside the page's PdfExportProvider:
// it keeps the page's download state and only switches on the PDF layouts.
const PdfRenderModeProvider = ({ children }: Props) => {
  const parentContext = useContext(PdfExportContext);

  return (
    <PdfExportContext.Provider
      value={{ ...parentContext, isPdfRenderMode: true }}
    >
      {children}
    </PdfExportContext.Provider>
  );
};

export default PdfRenderModeProvider;
