import React from 'react';

import { Box, stylingConsts, colors } from '@citizenlab/cl2-component-library';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { SupportedPermittedBy } from './typings';
import { VISUALIZATION_STEPS } from './utils';

export interface Props {
  permittedBy: SupportedPermittedBy;
}

const FlowVisualization = ({ permittedBy }: Props) => {
  const visualizationSteps = VISUALIZATION_STEPS[permittedBy]();

  return (
    <Box display="flex" flexDirection="row">
      {visualizationSteps.map((step, index) => {
        const last = index === visualizationSteps.length - 1;
        return (
          <Box display="flex" flexDirection="row" key={index}>
            <Block number={index + 1} text={step} />
            {!last && <Edge />}
          </Box>
        );
      })}
    </Box>
  );
};

export default FlowVisualization;

interface BlockProps {
  number: number;
  text: MessageDescriptor;
}

const VERIFICATION_PROVIDER = 'MitID';

const Block = ({ number, text }: BlockProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      borderRadius={stylingConsts.borderRadius}
      border={`1px solid ${colors.blue700}`}
      bgColor={colors.teal50}
      p="16px"
      w="220px"
    >
      <Box>{`${number}.`}</Box>
      <Box>
        {formatMessage(text, { verificationProvider: VERIFICATION_PROVIDER })}
      </Box>
    </Box>
  );
};

const Edge = () => {
  return (
    <Box w="20px" display="flex" flexDirection="column" justifyContent="center">
      <Box w="100%" borderBottom={`1px solid ${colors.blue700}`} h="1px" />
    </Box>
  );
};
