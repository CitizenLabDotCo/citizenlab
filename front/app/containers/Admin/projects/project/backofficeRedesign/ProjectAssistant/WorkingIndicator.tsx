import React, { useEffect, useState } from 'react';

import {
  Box,
  Spinner,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  startedAt: string;
};

const secondsSince = (startedAt: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));

const WorkingIndicator = ({ startedAt }: Props) => {
  const [seconds, setSeconds] = useState(() => secondsSince(startedAt));

  useEffect(() => {
    const interval = setInterval(() => setSeconds(secondsSince(startedAt)), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <Box
      role="status"
      display="flex"
      alignItems="center"
      gap="12px"
      p="12px"
      bgColor={colors.white}
      border={`1px solid ${colors.borderLight}`}
      borderRadius={stylingConsts.borderRadius}
    >
      <Spinner size="20px" />
      <Box flex="1">
        <Text m="0px">
          <FormattedMessage {...messages.working} />
        </Text>
      </Box>
      <Text m="0px" fontSize="s" color="textSecondary">
        <FormattedMessage {...messages.elapsed} values={{ seconds }} />
      </Text>
    </Box>
  );
};

export default WorkingIndicator;
