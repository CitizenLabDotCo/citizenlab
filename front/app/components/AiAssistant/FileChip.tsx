import React from 'react';

import {
  Box,
  Icon,
  IconButton,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  fileName: string;
  onRemove: () => void;
  disabled: boolean;
};

const FileChip = ({ fileName, onRemove, disabled }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="4px"
      pl="8px"
      bgColor={colors.grey100}
      borderRadius={stylingConsts.borderRadius}
      maxWidth="100%"
    >
      <Icon name="file" width="14px" height="14px" fill={colors.grey700} />
      <Text m="0px" fontSize="s" overflow="hidden" whiteSpace="nowrap">
        {fileName}
      </Text>
      <IconButton
        iconName="close"
        buttonType="button"
        iconWidth="14px"
        iconHeight="14px"
        iconColor={colors.grey700}
        iconColorOnHover={colors.textPrimary}
        a11y_buttonActionMessage={formatMessage(messages.removeFile, {
          fileName,
        })}
        onClick={onRemove}
        disabled={disabled}
      />
    </Box>
  );
};

export default FileChip;
