import React from 'react';

import {
  Box,
  Icon,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import usePermissionsFields from 'api/permissions_fields/usePermissionsFields';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import Arrow from './Arrow';
import { SupportedPermittedBy } from './typings';
import { VISUALIZATION_STEPS } from './utils';

interface Props {
  permittedBy: SupportedPermittedBy;
  phaseId: string;
  action: IPhasePermissionAction;
}

const FlowVisualization = ({ permittedBy, phaseId, action }: Props) => {
  const { data: permissionsFields } = usePermissionsFields({
    phaseId,
    action,
  });

  if (!permissionsFields?.data) return null;

  const visualizationSteps = VISUALIZATION_STEPS[permittedBy](
    permissionsFields?.data
  );

  return (
    <Box display="flex" flexDirection="row">
      {visualizationSteps.map((step, index) => {
        return (
          <Box display="flex" flexDirection="row" key={index}>
            <Block
              number={visualizationSteps.length === 1 ? undefined : index + 1}
              text={step}
            />
            <Edge />
          </Box>
        );
      })}
      <Box display="flex" alignItems="center">
        <Box
          bgColor={colors.green100}
          border={`1px solid ${colors.green700}`}
          w="40px"
          h="40px"
          borderRadius="20px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Icon name="check" fill={colors.green700} />
        </Box>
      </Box>
    </Box>
  );
};

export default FlowVisualization;

interface BlockProps {
  number?: number;
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
      {number && <Box>{`${number}.`}</Box>}
      <Box>
        {formatMessage(text, { verificationProvider: VERIFICATION_PROVIDER })}
      </Box>
    </Box>
  );
};

const EDGE_WIDTH = 20;

const Edge = () => {
  return (
    <Box
      w={`${EDGE_WIDTH}px`}
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Arrow width={EDGE_WIDTH} />
    </Box>
  );
};
