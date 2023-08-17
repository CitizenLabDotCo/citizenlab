import React, { useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

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
    <Document file={file} onLoadSuccess={handleLoadSuccess}>
      {pagesInDocument && currentPage <= pagesInDocument && (
        <Page pageNumber={currentPage} />
      )}
    </Document>
  );
};

export default PDFViewer;
