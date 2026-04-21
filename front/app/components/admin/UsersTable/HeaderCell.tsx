import React from 'react';

import { Th, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

const HeaderCell = ({ message }: { message: MessageDescriptor }) => (
  <Th py="16px">
    <Text m="0" fontSize="s" fontWeight="bold">
      <FormattedMessage {...message} />
    </Text>
  </Th>
);

export default HeaderCell;
