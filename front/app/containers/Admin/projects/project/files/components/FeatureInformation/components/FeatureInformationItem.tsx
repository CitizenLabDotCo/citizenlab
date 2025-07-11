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
const FeatureInformationItem = ({
  iconName,
  mainText,
  secondaryText,
}: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex" gap="20px" alignItems="center">
      <Box mb="auto">
        <Box
          p="8px"
          borderRadius="50%"
          background={colors.teal100}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon
            height="20px"
            width="20px"
            fill={colors.teal400}
            name={iconName}
          />
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

export default FeatureInformationItem;
