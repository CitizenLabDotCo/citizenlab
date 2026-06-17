import React, { useEffect, useMemo, useState } from 'react';

import { Box, Spinner, Text, colors } from '@citizenlab/cl2-component-library';
import { pdfjs, Document, Page } from 'react-pdf';
import styled from 'styled-components';

import {
  fetchCoverPreviewPdf,
  SurveyPdfCover,
} from 'api/survey_responses_pdf/generateSurveyResponsesPdf';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

const DEBOUNCE_MS = 600;

// Scale the rendered page canvas to fill the column width (it keeps the A4
// aspect ratio), with no border so the preview sits on plain white.
const FullWidthPage = styled.div`
  .react-pdf__Page,
  .react-pdf__Page__canvas {
    width: 100% !important;
    height: auto !important;
  }
`;

type Props = {
  cover: SurveyPdfCover;
  phaseId: string;
};

// Renders the cover as the actual (cover-only) PDF the backend generates
const CoverPreview = ({ cover, phaseId }: Props) => {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // `cover` is useState, so its reference only changes when it's actually
  // edited — safe to depend on directly (debounced below).
  useEffect(() => {
    if (!cover.include) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(false);
    const timer = setTimeout(async () => {
      try {
        const result = await fetchCoverPreviewPdf({ phaseId, cover });
        if (!cancelled) setBlob(result);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cover, phaseId]);

  // Stable file reference for react-pdf (re-parses only when the blob changes).
  const file = useMemo(() => blob, [blob]);

  if (!cover.include) {
    return (
      <Box
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="24px"
        background={colors.grey100}
      >
        <Text color="textSecondary" textAlign="center" m="0px">
          <FormattedMessage {...messages.coverDisabledPreview} />
        </Text>
      </Box>
    );
  }

  return (
    <Box position="relative" w="100%" h="100%" background="#FFFFFF">
      {file && !error && (
        <FullWidthPage>
          <Document
            file={file}
            loading={<></>}
            error={<></>}
            onLoadError={() => setError(true)}
          >
            <Page
              pageNumber={1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </FullWidthPage>
      )}
      {!loading && error && (
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="24px"
        >
          <Text color="textSecondary" textAlign="center" m="0px">
            <FormattedMessage {...messages.previewError} />
          </Text>
        </Box>
      )}
      {(loading || (!file && !error)) && (
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ background: 'rgba(255, 255, 255, 0.6)' }}
        >
          <Spinner />
        </Box>
      )}
    </Box>
  );
};

export default CoverPreview;
