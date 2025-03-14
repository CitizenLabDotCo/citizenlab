import React from 'react';

import { StatusLabel, colors } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import { PARTICIPATION_METHOD_LABELS } from '../constants';

interface Props {
  participationMethod: ParticipationMethod;
}

const MethodLabel = ({ participationMethod }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <StatusLabel
      text={formatMessage(PARTICIPATION_METHOD_LABELS[participationMethod])}
      variant="outlined"
      backgroundColor={colors.grey100}
      mr="4px"
      my="2px"
    />
  );
};

export default MethodLabel;
