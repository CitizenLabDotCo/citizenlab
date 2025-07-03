import React from 'react';

import { Box, Text, Icon, IconNames } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { useIntl } from 'utils/cl-intl';

type Props = {
  iconName: IconNames;
  mainText: MessageDescriptor;
  secondaryText: MessageDescriptor;
  iconColor?: string;
  iconBackgroundColor?: string;
};
const InformationPoint = ({
  iconName,
  mainText,
  secondaryText,
  iconColor,
  iconBackgroundColor,
}: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex" gap="20px" alignItems="center">
      <Box mb="auto">
        <Box
          p="8px"
          borderRadius="50%"
          background={iconBackgroundColor}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon height="20px" width="20px" fill={iconColor} name={iconName} />
        </Box>
      </Box>
      <Box>
        <Text m="0px">{formatMessage(mainText)}</Text>
        <Text fontSize="s" m="0px" color="coolGrey600">
          {formatMessage(secondaryText)}
        </Text>
      </Box>
    </Box>
  );
};

export default InformationPoint;
