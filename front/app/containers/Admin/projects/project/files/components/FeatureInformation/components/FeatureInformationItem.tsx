import React from 'react';

import {
  Box,
  Text,
  Icon,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';

type Props = {
  iconName: IconNames;
  mainText: MessageDescriptor;
  secondaryText: MessageDescriptor;
  disabled?: boolean;
};
const FeatureInformationItem = ({
  iconName,
  mainText,
  secondaryText,
  disabled = false,
}: Props) => {
  const { formatMessage } = useIntl();
  return (
    <UpsellTooltip disabled={!disabled}>
      <Box display="flex" gap="20px" alignItems="center">
        <Box mb="auto">
          <Box
            p="8px"
            borderRadius="50%"
            background={disabled ? colors.background : colors.teal100}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              height="20px"
              width="20px"
              fill={disabled ? colors.coolGrey500 : colors.teal400}
              name={disabled ? 'lock' : iconName}
            />
          </Box>
        </Box>
        <Box>
          <Text m="0px" color={disabled ? 'coolGrey500' : 'coolGrey600'}>
            {formatMessage(mainText)}
          </Text>
          <Text
            fontSize="s"
            m="0px"
            color={disabled ? 'coolGrey500' : 'coolGrey600'}
          >
            {formatMessage(secondaryText)}
          </Text>
        </Box>
      </Box>
    </UpsellTooltip>
  );
};

export default FeatureInformationItem;
