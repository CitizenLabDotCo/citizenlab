import React from 'react';

import { Box, Divider, Text } from '@citizenlab/cl2-component-library';
import { subHours } from 'date-fns';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import SummaryHeader from 'containers/Admin/projects/project/analysis/Insights/SummaryHeader';

import { timeAgo } from 'utils/dateUtils';

const StyledInsightsText = styled(Text)`
  white-space: pre-wrap;
  word-break: break-word;
`;

const Summary = () => {
  const generatedAt = subHours(new Date(), 2);
  const locale = useLocale();

  return (
    <Box mb="24px" position="relative">
      <Divider />
      <Box>
        <SummaryHeader />
        <StyledInsightsText>
          {
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          }
        </StyledInsightsText>
        <Box>
          <Text m="0px" fontSize="s" textAlign="right" mr="8px">
            {timeAgo(generatedAt.getTime(), locale)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Summary;
