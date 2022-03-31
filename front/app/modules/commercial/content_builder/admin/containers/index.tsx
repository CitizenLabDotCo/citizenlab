import React from 'react';
import { Editor } from '@craftjs/core';

// styles
import styled from 'styled-components';
import { colors, stylingConsts } from 'utils/styleUtils';

// components
import { RightColumn } from 'containers/Admin';
import { Box } from '@citizenlab/cl2-component-library';

// craft
import ContentBuilderToolbox from '../components/ContentBuilderToolbox';
import ContentBuilderSettings from '../components/ContentBuilderSettings';
import Container from '../components/CraftComponents/Container';
import Text from '../components/CraftComponents/Text';
import TwoColumn from '../components/CraftComponents/TwoColumn';
import RenderNode from '../components/RenderNode';
import ContentBuilderTopBar from '../components/ContentBuilderTopBar';
import ContentBuilderFrame from '../components/ContentBuilderFrame';

const StyledRightColumn = styled(RightColumn)`
  min-height: calc(100vh - ${2 * stylingConsts.menuHeight}px);
`;

const ContentBuilderPage = () => {
  return (
    <Box display="flex" flexDirection="column" w="100%">
      <Editor
        resolver={{ Box, Container, TwoColumn, Text }}
        onRender={RenderNode}
      >
        <ContentBuilderTopBar />
        <Box display="flex">
          <Box
            flex="0 0 auto"
            h="100%"
            w="210px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            bgColor={colors.adminDarkBackground}
            borderRight={`1px solid ${colors.mediumGrey}`}
          >
            <ContentBuilderToolbox />
          </Box>
          <StyledRightColumn>
            <Box paddingTop="20px">
              <ContentBuilderFrame />
            </Box>
          </StyledRightColumn>
          <ContentBuilderSettings />
        </Box>
      </Editor>
    </Box>
  );
};

export default ContentBuilderPage;
