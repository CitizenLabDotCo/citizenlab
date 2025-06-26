import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { useIntl } from 'utils/cl-intl';

type Props = {
  iconName: IconNames;
  fileTypeMessage: MessageDescriptor;
  fileExtensionMessage: MessageDescriptor;
};
const FileExampleDescription = ({
  iconName,
  fileTypeMessage,
  fileExtensionMessage,
}: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex">
      <Icon width="20px" my="auto" fill={colors.blue500} name={iconName} />
      <Box p="12px">
        <Text m="0px" color="coolGrey600">
          {formatMessage(fileTypeMessage)}
        </Text>
        <Text fontSize="s" m="0px" color="coolGrey500">
          {formatMessage(fileExtensionMessage)}
        </Text>
      </Box>
    </Box>
  );
};

export default FileExampleDescription;
