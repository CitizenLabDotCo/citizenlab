import React from 'react';

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
  children,
}: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  // Re-renders on resize, for the classic layout's computed card height.
  useWindowSize();
  const classic = usingMapView;

  return (
    <Box
      w="100%"
      h="100vh"
      position="fixed"
      zIndex="1010"
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
              maxWidth={classic ? undefined : FORM_CONTENT_MAX_WIDTH}
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
              maxWidth={classic ? MAP_VIEW_MAX_WIDTH : FORM_CONTENT_MAX_WIDTH}
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
};

export default FormPageLayout;
