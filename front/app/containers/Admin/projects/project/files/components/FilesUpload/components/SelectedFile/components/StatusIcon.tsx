import React from 'react';

import {
  Tooltip,
  Icon,
  Text,
  Box,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';

import Feedback from 'components/HookForm/Feedback';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../../messages';
import { UploadStatus } from '../../../types';

type Props = {
  status: UploadStatus;
};

export const StatusIcon = ({ status }: Props) => {
  const { formatMessage } = useIntl();

  // Render the appropriate icon based on the file's upload status
  switch (status) {
    case 'uploaded':
      return <Icon name="check" fill={colors.green500} />;
    case 'error':
      return (
        <Tooltip
          content={
            <Feedback
              showBackground={false}
              showIcon={false}
              marginTop="0px"
              marginBottom="0px"
              showErrorTitle={false}
              fontSize="s"
            />
          }
        >
          <Icon fill={colors.red500} name="info-outline" />
        </Tooltip>
      );
    case 'uploading':
      return (
        <Box width="24px">
          <Spinner size="24px" />
        </Box>
      );
    case 'too_large':
      return (
        <Tooltip
          content={
            <Error
              text={
                <Text m="0px" color="red500" fontSize="s">
                  {formatMessage(messages.fileSizeError)}
                </Text>
              }
              showBackground={false}
              showIcon={false}
              marginTop="0px"
              marginBottom="0px"
            />
          }
        >
          <Icon fill={colors.red500} name="info-outline" />
        </Tooltip>
      );
    default:
      return null;
  }
};
