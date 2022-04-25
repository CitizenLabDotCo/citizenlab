import React from 'react';
import { withRouter } from 'react-router';

// styles
import styled from 'styled-components';
import { colors, stylingConsts } from 'utils/styleUtils';

// components
import { RightColumn } from 'containers/Admin';
import { Box } from '@citizenlab/cl2-component-library';

// craft
import Editor from '../components/Editor';
import ContentBuilderToolbox from '../components/ContentBuilderToolbox';
import ContentBuilderSettings from '../components/ContentBuilderSettings';
import ContentBuilderTopBar from '../components/ContentBuilderTopBar';
import ContentBuilderFrame from '../components/ContentBuilderFrame';

const StyledRightColumn = styled(RightColumn)`
  min-height: calc(100vh - ${2 * stylingConsts.menuHeight}px);
`;

const ContentBuilderPage = ({ params: { projectId } }) => {
  return (
    <Box display="flex" flexDirection="column" w="100%">
      <Editor isPreview={false}>
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
            <ContentBuilderToolbox projectId={projectId} />
          </Box>
          <StyledRightColumn>
            <Box paddingTop="20px">
              <ContentBuilderFrame projectId={projectId} />
            </Box>
          </StyledRightColumn>
          <ContentBuilderSettings />
        </Box>
      </Editor>
    </Box>
  );
};

export default withRouter(ContentBuilderPage);
