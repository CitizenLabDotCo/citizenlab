import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import SpaceNameForm from '../../_shared/SpaceNameForm';
import messages from '../messages';

const Settings = () => {
  return (
    <Box>
      <Title variant="h2" mt="0px" mb="36px" color="primary">
        <FormattedMessage {...messages.settings} />
      </Title>
      <SpaceNameForm />
    </Box>
  );
};

export default Settings;
