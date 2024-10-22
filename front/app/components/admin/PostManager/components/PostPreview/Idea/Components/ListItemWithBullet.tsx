import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { List } from 'semantic-ui-react';

import { FormattedMessage } from 'utils/cl-intl';

type Props = {
  message: { id: string; defaultMessage: string };
};
const ListItemWithBullet = ({ message }: Props) => {
  return (
    <List.Item>
      <Box display="flex">
        <Box mr="4px">{'•'}</Box>
        <FormattedMessage {...message} />
      </Box>
    </List.Item>
  );
};

export default ListItemWithBullet;
