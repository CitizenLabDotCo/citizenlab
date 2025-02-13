import React from 'react';

import { Accordion, Box, Icon, Title } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onChange: (value: boolean) => void;
}

const Comments = ({ onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Accordion
      title={
        <Box display="flex" alignItems="center" px="24px" py="12px">
          <Icon height="16px" width="16px" name="comments" mr="8px" />
          <Title variant="h5" m="0">
            {formatMessage(messages.comments)}
          </Title>
        </Box>
      }
      onChange={onChange}
    >
      <Box p="32px" h="300px">
        Test!
      </Box>
    </Accordion>
  );
};

export default Comments;
