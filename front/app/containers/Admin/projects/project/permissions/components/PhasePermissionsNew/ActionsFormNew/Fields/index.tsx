import React from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import DefaultField from './DefaultField';

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
    </Box>
  );
};

export default Fields;
