import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { getJwt } from 'utils/auth/jwt';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Props {
  currentPageIndex: number;
  file: string;
  pages: number[];
}

const PDFViewer = ({ currentPageIndex, file, pages }: Props) => {
  const [pagesInDocument, setPagesInDocument] = useState<number | null>(null);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setPagesInDocument(numPages);
  };

  const currentPage = pages[currentPageIndex];
  const jwt = getJwt();
  const fileWithHeaders = {
    url: file,
    httpHeaders: { Authorization: jwt },
  };

  return (
    <>
      <Box w="100%" h="100%" overflowY="scroll">
        <Document file={fileWithHeaders} onLoadSuccess={handleLoadSuccess}>
          {currentPage && pagesInDocument && currentPage <= pagesInDocument && (
            <Page pageNumber={currentPage} />
          )}
        </Document>
      </Box>
    </>
  );
};

export default PDFViewer;
