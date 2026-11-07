import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import { PulsingDot } from '../../animations';
import { ProposedChange } from '../../draft';
import messages from '../../messages';

const LABELS = {
  create: messages.proposedNew,
  update: messages.proposedChange,
  remove: messages.proposedRemoval,
};

type Props = {
  kind: ProposedChange['kind'];
};

const ProposedChangeBadge = ({ kind }: Props) => (
  <Box
    display="inline-flex"
    alignItems="center"
    gap="6px"
    px="8px"
    py="2px"
    borderRadius="999px"
    bgColor={kind === 'remove' ? colors.red100 : colors.teal50}
  >
    <PulsingDot />
    <Text
      as="span"
      m="0px"
      fontSize="xs"
      fontWeight="semi-bold"
      color={kind === 'remove' ? 'red600' : 'teal700'}
    >
      <FormattedMessage {...LABELS[kind]} />
    </Text>
  </Box>
);

export default ProposedChangeBadge;
