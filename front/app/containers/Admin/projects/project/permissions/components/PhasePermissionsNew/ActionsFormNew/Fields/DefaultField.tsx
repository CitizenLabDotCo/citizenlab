import React, { useState } from 'react';

import {
  Box,
  Button,
  stylingConsts,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import EmailModal from './EmailModal';
import messages from './messages';

interface Props {
  fieldName: string;
}

const noop = () => {};

const DefaultField = ({ fieldName }: Props) => {
  const { formatMessage } = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Box
        py="18px"
        borderTop={stylingConsts.border}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text m="0" fontSize="m" color="primary">
          {fieldName}
        </Text>
        <Box display="flex" flexDirection="row">
          <Button
            icon="edit"
            buttonStyle="text"
            p="0"
            m="0"
            mr="22px"
            onClick={() => setIsModalOpen(true)}
          >
            {formatMessage(messages.edit)}
          </Button>
          <Box
            mb="-4px" // cancel out te bottom margin of the Toggle
          >
            <Toggle checked onChange={noop} />
          </Box>
        </Box>
      </Box>
      <EmailModal opened={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default DefaultField;
