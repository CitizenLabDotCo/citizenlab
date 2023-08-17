import React, { useState } from 'react';

// react-pdf
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// components
import { Box } from '@citizenlab/cl2-component-library';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface Props {
  file: string;
  currentPage: number;
}

const PDFViewer = ({ file, currentPage }: Props) => {
  const [pagesInDocument, setPagesInDocument] = useState<number | null>(null);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setPagesInDocument(numPages);
  };

  return (
    <Box w="100%" h="100%" position="relative">
      <Box w="100%" h="100%" overflowY="scroll">
        <Document file={file} onLoadSuccess={handleLoadSuccess}>
          {pagesInDocument && currentPage <= pagesInDocument && (
            <Page pageNumber={currentPage} />
          )}
        </Document>
      </Box>
      <Box
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        display="flex"
        justifyContent="center"
        alignItems="flex-end"
        pb="32px"
      >
        Overlay
      </Box>
    </Box>
  );
};

export default PDFViewer;
