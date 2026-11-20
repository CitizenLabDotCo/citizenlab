import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { SaveError } from 'components/admin/ContentBuilder/saveError';

import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  saveError: SaveError | null;
  genericMessage: MessageDescriptor;
  unauthorizedFileMessage: MessageDescriptor;
}

const SaveErrorMessage = ({
  saveError,
  genericMessage,
  unauthorizedFileMessage,
}: Props) => {
  if (!saveError) return null;

  return (
    <Text
      color="error"
      ml="20px"
      position="absolute"
      right="16px"
      bottom="-18px"
      fontSize="s"
    >
      <FormattedMessage
        {...(saveError === 'unauthorizedFile'
          ? unauthorizedFileMessage
          : genericMessage)}
      />
    </Text>
  );
};

export default SaveErrorMessage;
