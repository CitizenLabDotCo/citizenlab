import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const ReferenceDataInterface = () => {
  return (
    <>
      <Box display="flex" justifyContent="flex-start">
        <Button
          linkTo="/admin/dashboard/representativeness"
          buttonStyle="text"
          icon="arrow-back"
          size="2"
          padding="0px"
          text={<FormattedMessage {...messages.backToDashboard} />}
        />
      </Box>
      <Title variant="h1">Manage data</Title>
    </>
  );
};

export default ReferenceDataInterface;
