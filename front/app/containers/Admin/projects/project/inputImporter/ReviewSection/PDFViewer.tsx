import React, { useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { getJwt } from 'utils/auth/jwt';

import PDFDownloadButton from './PDFDownloadButton';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

interface Props {
  file: string;
  ideaId: string;
}

const PDFViewer = ({ file, ideaId }: Props) => {
  const [pagesInDocument, setPagesInDocument] = useState<number | null>(null);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setPagesInDocument(numPages);
  };

  const jwt = getJwt();
  const fileWithHeaders = {
    url: file,
    httpHeaders: { Authorization: jwt },
  };

  return (
    <>
      <Box
        w="100%"
        h="100%"
        overflowY="scroll"
        paddingBottom="80px"
        background={colors.grey100}
        p="12px"
      >
        <Document file={fileWithHeaders} onLoadSuccess={handleLoadSuccess}>
          {pagesInDocument &&
            [...Array(pagesInDocument)].map((_, pageIndex) => (
              <Box
                key={pageIndex}
                mb="12px"
                border={`1px ${colors.grey400} solid`}
                display="inline-block"
              >
                <Page key={pageIndex} pageNumber={pageIndex + 1} />
              </Box>
            ))}
        </Document>
        {pagesInDocument && <PDFDownloadButton file={file} ideaId={ideaId} />}
      </Box>
    </>
  );
};

export default PDFViewer;
