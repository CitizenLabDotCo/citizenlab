import React, { useEffect, useRef, useState } from 'react';

import { Box, Spinner, Text, colors } from '@citizenlab/cl2-component-library';

import { fetchCoverPreviewHtml } from 'api/survey_responses_pdf/fetchCoverPreviewHtml';
import { SurveyPdfCover } from 'api/survey_responses_pdf/generateSurveyResponsesPdf';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

// The backend renders the cover (single source of truth) as a 210x297mm page;
// we show it in an iframe scaled to the column width. mm -> px at 96dpi.
const MM = 96 / 25.4;
const PAGE_W = 210 * MM;
const PAGE_H = 297 * MM;
const DEBOUNCE_MS = 600;

type Props = {
  cover: SurveyPdfCover;
  phaseId: string;
};

const CoverPreview = ({ cover, phaseId }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Debounced fetch of the rendered cover whenever its content changes.
  const signature = JSON.stringify(cover);
  useEffect(() => {
    if (!cover.include) return undefined;
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await fetchCoverPreviewHtml({ phaseId, cover });
        if (!cancelled) setHtml(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, phaseId]);

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

  const scale = width ? width / PAGE_W : 0;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#FFFFFF',
      }}
    >
      {scale > 0 && html && (
        <iframe
          title="cover-preview"
          srcDoc={html}
          sandbox=""
          style={{
            width: PAGE_W,
            height: PAGE_H,
            border: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      )}
      {(loading || !html) && (
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
    </div>
  );
};

export default CoverPreview;
