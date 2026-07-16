import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  Box,
  IconButton,
  Spinner,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { pdfjs, Document, Page } from 'react-pdf';

import {
  fetchCoverPreviewPdf,
  InputPdfCover,
} from 'api/input_responses_pdf/generateInputResponsesPdf';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

const DEBOUNCE_MS = 600;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

type Props = {
  cover: InputPdfCover;
  phaseId: string;
};

// Renders just the cover of the generated PDF
const CoverPreview = ({ cover, phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(ZOOM_MIN);

  // Width the page renders at: the container's width (fit) times the zoom.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [baseWidth, setBaseWidth] = useState<number | null>(null);
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setBaseWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [blob]);

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
    <Box position="relative" w="100%" h="100%" background={colors.white}>
      <Box
        ref={scrollRef}
        w="100%"
        h="100%"
        overflow="auto"
        display="flex"
        justifyContent={zoom > ZOOM_MIN ? 'flex-start' : 'center'}
      >
        {file && !error && baseWidth && (
          <Document
            file={file}
            loading={<></>}
            error={<></>}
            onLoadError={() => setError(true)}
          >
            <Page
              pageNumber={1}
              width={baseWidth * zoom}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </Box>
      {file && !error && (
        <Box
          position="absolute"
          top="8px"
          right="8px"
          display="flex"
          gap="8px"
          p="6px"
          zIndex="2"
          background={colors.white}
          border={`1px solid ${colors.borderLight}`}
          borderRadius={stylingConsts.borderRadius}
        >
          <IconButton
            iconName="minus"
            iconWidth="20px"
            iconHeight="20px"
            iconColor={colors.coolGrey600}
            iconColorOnHover={colors.black}
            disabled={zoom <= ZOOM_MIN}
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
            a11y_buttonActionMessage={formatMessage(messages.zoomOut)}
          />
          <IconButton
            iconName="plus"
            iconWidth="20px"
            iconHeight="20px"
            iconColor={colors.coolGrey600}
            iconColorOnHover={colors.black}
            disabled={zoom >= ZOOM_MAX}
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
            a11y_buttonActionMessage={formatMessage(messages.zoomIn)}
          />
        </Box>
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
          style={{ background: colors.grey100 }}
        >
          <Spinner />
        </Box>
      )}
    </Box>
  );
};

export default CoverPreview;
