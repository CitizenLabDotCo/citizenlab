import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Fields from './Fields';
import Header from './Header';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const ReferenceDataInterface = () => (
  <>
    <Box display="flex" justifyContent="flex-start" mb="32px">
      <Button
        linkTo="/admin/dashboard/representation"
        buttonStyle="text"
        icon="arrow-left"
        size="m"
        padding="0px"
        text={<FormattedMessage {...messages.backToDashboard} />}
      />
    </Box>
    <Box background="white" px="40px" pt="60px" pb="40px">
      <Box maxWidth="855px">
        <Header />
        <Fields />
      </Box>
    </Box>
  </>
);

export default ReferenceDataInterface;
