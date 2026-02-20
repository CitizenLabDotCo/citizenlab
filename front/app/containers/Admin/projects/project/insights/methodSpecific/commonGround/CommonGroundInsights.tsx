import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import CommonGroundResults from 'containers/ProjectsShowPage/timeline/CommonGround/CommonGroundResults';

import { useIntl } from 'utils/cl-intl';

import { MethodSpecificInsightProps } from '../types';

import messages from './messages';

const CommonGroundInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <Title variant="h3" m="0">
        {formatMessage(messages.commonGroundStatements)}
      </Title>
      <CommonGroundResults phaseId={phaseId} />
    </Box>
  );
};

export default CommonGroundInsights;
