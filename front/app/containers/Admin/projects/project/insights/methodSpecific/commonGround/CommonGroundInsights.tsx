import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import CommonGroundResults from 'containers/ProjectsShowPage/timeline/CommonGround/CommonGroundResults';

import { useIntl } from 'utils/cl-intl';

import { MethodSpecificInsightProps } from '../types';

import messages from './messages';

const CommonGroundInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <Text fontSize="m" fontWeight="bold" m="0px">
        {formatMessage(messages.commonGroundStatements)}
      </Text>
      <CommonGroundResults phaseId={phaseId} />
    </Box>
  );
};

export default CommonGroundInsights;
