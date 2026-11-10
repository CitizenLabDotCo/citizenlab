import React, { useLayoutEffect, useRef } from 'react';

import {
  Box,
  colors,
  useBreakpoint,
  useWindowSize,
} from '@citizenlab/cl2-component-library';

import { calculateDynamicHeight } from 'containers/IdeasNewSurveyPage/IdeasNewSurveyForm/utils';

// Width of the form column. Wider than the old 700px card, but still a
// comfortable line length for questions and answers.
export const FORM_CONTENT_MAX_WIDTH = '860px';
// Survey map pages: the map next to the questions needs a wider column.
export const FORM_MAP_PAGE_MAX_WIDTH = '1400px';
const MAP_VIEW_MAX_WIDTH = '1100px';
// Space between questions in this layout: roomier than the classic 24px.
export const FORM_QUESTION_SPACING = '40px';

type Props = {
  // The heading bar (title, close button). Give it no bottom border in the
  // regular layout: the full-width header bar around it draws one.
  heading: React.ReactNode;
  // A map page is open: keep the classic layout (grey background, card of a
  // fixed height that scrolls inside, footer pinned to its bottom).
  usingMapView: boolean;
  mainId: string;
  // E.g. the details panel of a similar input, next to the form.
  aside?: React.ReactNode;
  // A wider column, for a survey map page.
  wide?: boolean;
  // Fills its container instead of the screen (the survey builder's
  // preview). The parts pinned to the screen (the footers) then stay inside
  // it.
  embedded?: boolean;
  children: React.ReactNode;
};

// Full-screen frame of the participant forms (survey, new and edited input).
// Regular pages: a white page that scrolls as a whole, a sticky header bar
// and the form in a centred column. The element structure is identical for
// both layouts, so switching doesn't remount (and reset) the form inside.
const FormPageLayout = ({
  heading,
  usingMapView,
  mainId,
  aside,
  embedded = false,
  wide = false,
  children,
}: Props) => {
  const columnMaxWidth = wide
    ? FORM_MAP_PAGE_MAX_WIDTH
    : FORM_CONTENT_MAX_WIDTH;
  const isSmallerThanPhone = useBreakpoint('phone');
  // Re-renders on resize, for the classic layout's computed card height.
  useWindowSize();
  const classic = usingMapView;

  // The map layout doesn't scroll as a whole, so a scroll position left over
  // from a long regular page would hide part of it.
  const scrollRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (classic) scrollRef.current?.scrollTo({ top: 0 });
  }, [classic]);

  const page = (
    <Box
      ref={scrollRef}
      w="100%"
      h={embedded ? '100%' : '100vh'}
      position={embedded ? 'absolute' : 'fixed'}
      top={embedded ? '0' : undefined}
      left={embedded ? '0' : undefined}
      zIndex={embedded ? undefined : '1010'}
      // Grey on both sides of the white form column.
      bgColor={colors.grey100}
      overflowY={classic ? 'hidden' : 'auto'}
      overflowX="hidden"
    >
      <Box
        display="flex"
        flexDirection="row"
        w="100%"
        h={classic ? '100%' : undefined}
        minHeight="100%"
      >
        <Box
          flex="1"
          minWidth="0px"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Box
            as="header"
            w="100%"
            maxWidth={classic ? MAP_VIEW_MAX_WIDTH : undefined}
            position={classic ? 'relative' : 'sticky'}
            top={classic ? (isSmallerThanPhone ? '0' : '40px') : '0'}
            zIndex={classic ? undefined : '3'}
            bgColor={classic ? undefined : colors.white}
            borderBottom={classic ? undefined : `1px solid ${colors.divider}`}
          >
            <Box
              w="100%"
              maxWidth={classic ? undefined : columnMaxWidth}
              mx="auto"
            >
              {heading}
            </Box>
          </Box>
          <Box
            as="main"
            id={mainId}
            w="100%"
            display="flex"
            justifyContent="center"
            // The form column runs down to the bottom of the page.
            flex={classic ? undefined : '1'}
            pt={classic && !isSmallerThanPhone ? '40px' : '0'}
          >
            <Box
              w="100%"
              display="flex"
              maxWidth={classic ? MAP_VIEW_MAX_WIDTH : columnMaxWidth}
              bgColor={colors.white}
              h={
                classic ? calculateDynamicHeight(isSmallerThanPhone) : undefined
              }
              pb={classic && !isSmallerThanPhone ? '80px' : '0'}
              px={classic ? '0' : isSmallerThanPhone ? '16px' : '24px'}
              pt={classic ? '0' : '24px'}
            >
              {children}
            </Box>
          </Box>
        </Box>
        {aside}
      </Box>
    </Box>
  );

  if (!embedded) return page;

  // The transform makes this box, rather than the screen, the frame of the
  // fixed footers. It doesn't scroll itself, so they stay put while the page
  // inside scrolls.
  return (
    <Box
      position="relative"
      w="100%"
      h="100%"
      overflow="hidden"
      style={{ transform: 'translateZ(0)' }}
    >
      {page}
    </Box>
  );
};

export default FormPageLayout;
