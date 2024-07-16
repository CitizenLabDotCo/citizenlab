import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { isNil } from 'lodash-es';
import styled from 'styled-components';

import ProgressBar from 'components/UI/ProgressBar';

const StyledProgressBar = styled(ProgressBar)<{ width: number }>`
  height: 5px;
  width: ${({ width }) => width * 100}%;
`;

type Props = {
  count?: number;
  totalCount?: number;
  filteredCount?: number;
};

const TagCount = ({ totalCount, filteredCount, count }: Props) => {
  if (isNil(totalCount) || isNil(filteredCount) || isNil(count)) return null;
  return (
    <Box display="flex" alignItems="center">
      <StyledProgressBar
        width={count / totalCount}
        progress={filteredCount / count}
        color={colors.blue700}
        bgColor={colors.coolGrey300}
      />
      <Box w="50px" ml="5px">
        {filteredCount === count ? count : `${filteredCount}/${count}`}
      </Box>
    </Box>
  );
};

export default TagCount;
