import React, { useState } from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import styled from 'styled-components';

import Comments from './Comments';
import InputPreview from './InputPreview';
import InputsList from './InputsList';
import Insights from './Insights';
import SelectedInputContext from './SelectedInputContext';
import Tags from './Tags';
import TopBar from './TopBar';

const COMMENTS_CLOSED_OFFSET = '72px';
const COMMENTS_OPENED_OFFSET = '300px';

const AnimatedBox = styled(Box)`
  transition: all 300ms cubic-bezier(0.165, 0.84, 0.44, 1);
`;

const Analysis = () => {
  const modalPortalElement = document.getElementById('modal-portal');
  const [commentsOpened, setCommentsOpened] = useState(false);

  if (!modalPortalElement) return null;

  const commentsOffset = commentsOpened
    ? COMMENTS_OPENED_OFFSET
    : COMMENTS_CLOSED_OFFSET;

  return createPortal(
    <Box
      display="flex"
      flexDirection="column"
      w="100%"
      zIndex="10000"
      position="fixed"
      bgColor={colors.background}
      h="100vh"
    >
      <FocusOn>
        <SelectedInputContext>
          <TopBar />
          <Box
            display="flex"
            w="100"
            alignItems="stretch"
            gap="8px"
            pt={`${stylingConsts.mobileMenuHeight}px`}
          >
            <Box
              w="300px"
              h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
              mt="12px"
              bg={colors.white}
            >
              <Tags />
            </Box>

            <Box flex="1" mt="12px">
              <InputsList />
            </Box>

            <Box flex="1" mt="12px">
              <AnimatedBox
                overflow="auto"
                h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px - ${commentsOffset})`}
                display="flex"
                flexDirection="column"
                bg={colors.white}
              >
                <Box flex="1" bg={colors.white} px="12px" pt="12px">
                  <InputPreview />
                </Box>
              </AnimatedBox>
              <Box bg={colors.white} mt="6px">
                <Comments
                  opened={commentsOpened}
                  onChange={setCommentsOpened}
                />
              </Box>
            </Box>

            <Box
              flex="1"
              p="12px"
              mt="12px"
              h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
              bg={colors.white}
            >
              <Insights />
            </Box>
          </Box>
        </SelectedInputContext>
      </FocusOn>
    </Box>,
    modalPortalElement
  );
};

export default Analysis;
