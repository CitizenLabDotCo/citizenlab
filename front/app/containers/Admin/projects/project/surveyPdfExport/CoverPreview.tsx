import React, { useEffect, useRef, useState } from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { SurveyPdfCover } from 'api/survey_responses_pdf/generateSurveyResponsesPdf';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

// Mirrors the backend cover template (app/views/export/pdf/survey_responses.html.erb).
// We render a real A4 page (white) with the same 16mm @page margin and the dark
// cover panel inset inside it, then scale it down to fit the preview column — so
// the inset/margins and proportions match the downloaded PDF. No response data
// is rendered here.
const DARK = '#1E155D';
const CHERRY = '#FF3E52';
const MM = 96 / 25.4; // CSS px per mm at 96dpi (how Chromium prints)
const PAGE_W = 210 * MM;
const PAGE_H = 297 * MM;
const PAGE_MARGIN = 16 * MM; // matches @page { margin: 16mm }

type Props = {
  cover: SurveyPdfCover;
  responseCount: number;
};

const CoverPreview = ({ cover, responseCount }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      {scale > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: PAGE_W,
            height: PAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            background: '#FFFFFF',
            padding: PAGE_MARGIN,
            boxSizing: 'border-box',
            display: 'flex',
          }}
        >
          <div
            style={{
              flex: 1,
              background: DARK,
              color: '#FFFFFF',
              borderRadius: 8,
              padding: '40px 36px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: CHERRY,
                fontWeight: 700,
                marginBottom: 32,
              }}
            >
              Survey response report
            </div>

            <div
              style={{
                fontSize: 32,
                fontWeight: 300,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                marginBottom: 8,
                wordBreak: 'break-word',
              }}
            >
              {cover.title}
            </div>

            {cover.subtitle && (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {cover.subtitle}
              </div>
            )}

            <div style={{ flex: 1 }} />

            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.15)',
                paddingTop: 16,
                marginTop: 16,
                display: 'flex',
                gap: 48,
              }}
            >
              {cover.date && (
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.35)',
                      marginBottom: 4,
                    }}
                  >
                    Date
                  </div>
                  <div style={{ fontSize: 13 }}>{cover.date}</div>
                </div>
              )}
              {cover.preparedBy && (
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.35)',
                      marginBottom: 4,
                    }}
                  >
                    Prepared by
                  </div>
                  <div style={{ fontSize: 13 }}>{cover.preparedBy}</div>
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.6)',
                marginTop: 14,
              }}
            >
              <FormattedMessage
                {...messages.coverResponseCount}
                values={{ count: responseCount }}
              />
            </div>

            {cover.notes && (
              <div
                style={{
                  marginTop: 16,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.6)',
                  wordBreak: 'break-word',
                }}
              >
                {cover.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverPreview;
