import React, { useState } from 'react';

// react-pdf
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface Props {
  file: string;
  pages: number[];
}

const PDFViewer = ({ file, pages }: Props) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pagesInDocument, setPagesInDocument] = useState<number | null>(null);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setPagesInDocument(numPages);
  };

  const currentPage = pages[currentPageIndex];

  const hasPreviousPage = pages.length > 1 && currentPageIndex !== 0;
  const hasNextPage = pages.length > 1 && currentPageIndex !== pages.length - 1;

  const goToPreviousPage = () => {
    setCurrentPageIndex((index) => index - 1);
  };

  const goToNextPage = () => {
    setCurrentPageIndex((index) => index + 1);
  };

  return (
    <Box w="100%" h="100%" position="relative">
      <Box w="100%" h="100%" overflowY="scroll">
        <Document file={file} onLoadSuccess={handleLoadSuccess}>
          {currentPage && pagesInDocument && currentPage <= pagesInDocument && (
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
        justifyContent="space-between"
        alignItems="flex-end"
        pb="32px"
        px="12px"
      >
        <Box zIndex="10002">
          <Button
            icon="arrow-left"
            disabled={!hasPreviousPage}
            bgColor={colors.primary}
            onClick={goToPreviousPage}
          />
        </Box>
        <Box zIndex="10002">
          <Button
            icon="arrow-right"
            disabled={!hasNextPage}
            bgColor={colors.primary}
            onClick={goToNextPage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PDFViewer;
