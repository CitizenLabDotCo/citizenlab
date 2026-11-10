import React from 'react';

import {
  Box,
  Text,
  colors,
  stylingConsts,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const StyledSurveyTitle = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

type Props = {
  titleText: string | React.ReactNode;
  // Off when a surrounding header bar draws the line.
  bordered?: boolean;
  // Buttons on the right, e.g. edit and close.
  actions: React.ReactNode;
};

// The bar at the top of a survey: its title and the buttons to leave it.
// Shared by the survey and the survey builder's preview.
const SurveyHeadingBar = ({ titleText, bordered = true, actions }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Box
      bgColor={colors.white}
      display="flex"
      alignItems="center"
      // If we don't have an edit button, it still needs to look consistent
      minHeight={`${
        isSmallerThanPhone
          ? stylingConsts.mobileTopBarHeight
          : stylingConsts.menuHeight
      }px`}
      px="24px"
      borderBottom={bordered ? `1px solid ${colors.divider}` : undefined}
    >
      <StyledSurveyTitle
        color={'tenantText'}
        variant="bodyS"
        fontSize="m"
        my="0px"
        textAlign="left"
      >
        {titleText}
      </StyledSurveyTitle>
      <Box
        display="flex"
        // Pushes buttons to the right
        ml="auto"
      >
        {actions}
      </Box>
    </Box>
  );
};

export default SurveyHeadingBar;
