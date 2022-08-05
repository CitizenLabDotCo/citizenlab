import React from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// styles
import styled from 'styled-components';
import { stylingConsts, colors } from 'utils/styleUtils';

// components
import { RightColumn } from 'containers/Admin';
import { Box } from '@citizenlab/cl2-component-library';
import SurveyBuilderTopBar from 'modules/free/native_surveys/admin/components/SurveyBuilderTopBar';
import SurveyBuilderToolbox from 'modules/free/native_surveys/admin/components/SurveyBuilderToolbox';
import SurveyBuilderSettings from 'modules/free/native_surveys/admin/components/SurveyBuilderSettings';

const StyledRightColumn = styled(RightColumn)`
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  z-index: 2;
  margin: 0;
  max-width: 100%;
  align-items: center;
  padding-bottom: 100px;
  overflow-y: auto;
`;

export const SurveyEdit = () => (
  <Box
    display="flex"
    flexDirection="column"
    w="100%"
    zIndex="10000"
    position="fixed"
    bgColor={colors.adminBackground}
    h="100vh"
    data-testid="surveyBuilderPage"
  >
    <FocusOn>
      <SurveyBuilderTopBar />
      <Box mt={`${stylingConsts.menuHeight}px`} display="flex">
        <SurveyBuilderToolbox />
        <StyledRightColumn>
          <Box width="1000px" bgColor="#ffffff" minHeight="300px" />
        </StyledRightColumn>
        <SurveyBuilderSettings />
      </Box>
    </FocusOn>
  </Box>
);

const SurveyBuilderPage = () => {
  const modalPortalElement = document.getElementById('modal-portal');
  return modalPortalElement
    ? createPortal(<SurveyEdit />, modalPortalElement)
    : null;
};

export default SurveyBuilderPage;
