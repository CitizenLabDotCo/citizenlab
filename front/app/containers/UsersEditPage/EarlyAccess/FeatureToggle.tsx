import React from 'react';

import {
  Box,
  colors,
  Text,
  Title,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { EarlyAccessLevel } from 'api/users/types';

import EarlyAccessBadge from 'components/admin/EarlyAccessBadge';

import { FormattedMessage } from 'utils/cl-intl';

type Props = {
  title: MessageDescriptor;
  description: MessageDescriptor;
  level?: EarlyAccessLevel;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
};

const FeatureToggle = ({
  title,
  description,
  level,
  checked,
  disabled,
  onChange,
}: Props) => (
  <Box as="label" display="flex" mb="20px">
    <Box w="fit-content" display="flex" flexDirection="row-reverse">
      <Toggle
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        labelTextColor={colors.primary}
      />
    </Box>
    <Box display="flex" flexDirection="column" pl="1rem">
      <Box display="flex" alignItems="center" gap="8px">
        <Title color="primary" fontSize="l" my="0px" fontWeight="semi-bold">
          <FormattedMessage {...title} />
        </Title>
        <EarlyAccessBadge level={level} />
      </Box>
      <Text fontSize="s" color="textSecondary" mt="4px">
        <FormattedMessage {...description} />
      </Text>
    </Box>
  </Box>
);

export default FeatureToggle;
