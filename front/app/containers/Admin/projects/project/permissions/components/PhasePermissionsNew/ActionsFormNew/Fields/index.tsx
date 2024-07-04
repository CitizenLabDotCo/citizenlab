import React from 'react';

import { Title, Box, Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import DefaultField from './DefaultField';
import messages from './messages';

const Fields = () => {
  return (
    <Box maxWidth="844px">
      <Title variant="h4" color="primary">
        <FormattedMessage {...messages.whatInformation} />
      </Title>
      <Box mt="20px">
        <DefaultField fieldName="Name" />
        <DefaultField fieldName="Email" />
      </Box>
      <Box mt="20px" w="100%" display="flex">
        <Button
          buttonStyle="admin-dark"
          icon="plus-circle"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <FormattedMessage {...messages.addAQuestion} />
        </Button>
      </Box>
    </Box>
  );
};

export default Fields;
