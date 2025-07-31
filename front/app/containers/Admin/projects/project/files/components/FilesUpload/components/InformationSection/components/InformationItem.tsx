import React from 'react';

import {
  Box,
  Text,
  Icon,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { useIntl } from 'utils/cl-intl';

type Props = {
  iconName: IconNames;
  mainText: MessageDescriptor;
  secondaryText: MessageDescriptor;
};

// Component is used to display a styled information item with an icon, main text, and secondary text.
const InformationItem = ({ iconName, mainText, secondaryText }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex" gap="20px" alignItems="center">
      <Icon height="20px" width="20px" fill={colors.primary} name={iconName} />
      <Box>
        <Text m="0px">{formatMessage(mainText)}</Text>
        <Text fontSize="s" m="0px" color="coolGrey600">
          {formatMessage(secondaryText)}
        </Text>
      </Box>
    </Box>
  );
};

export default InformationItem;
