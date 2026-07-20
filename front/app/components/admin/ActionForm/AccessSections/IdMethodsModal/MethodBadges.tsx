// What a single identification method can be used for. A method can be an
// authentication method, a verification method, or both at once — so these are
// two independent badges rather than one either/or label.

import React from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  colors,
} from '@citizenlab/cl2-component-library';

import { IdMethodData } from 'api/id_methods/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Badge = ({ icon, label }: { icon: IconNames; label: string }) => (
  <Box
    display="inline-flex"
    alignItems="center"
    gap="4px"
    px="8px"
    py="2px"
    borderRadius="4px"
    bgColor={colors.teal50}
  >
    <Icon name={icon} width="12px" height="12px" fill={colors.teal700} />
    <Text as="span" m="0" fontSize="xs" fontWeight="semi-bold" color="teal700">
      {label}
    </Text>
  </Box>
);

interface Props {
  method: IdMethodData;
}

const MethodBadges = ({ method }: Props) => {
  const { formatMessage } = useIntl();
  const { authentication_method, verification_method } = method.attributes;

  return (
    <Box display="flex" alignItems="center" gap="6px">
      {authentication_method && (
        <Badge
          icon="user-circle"
          label={formatMessage(messages.authentication)}
        />
      )}
      {verification_method && (
        <Badge
          icon="shield-checkered"
          label={formatMessage(messages.verification)}
        />
      )}
    </Box>
  );
};

export default MethodBadges;
