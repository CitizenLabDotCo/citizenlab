import React from 'react';

// hooks
import useAuthUser from 'api/me/useAuthUser';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Header from './Header';
import Fields from './Fields';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isAdmin } from 'utils/permissions/roles';

const ReferenceDataInterface = () => {
  const { data: authUser } = useAuthUser();

  if (!authUser || !isAdmin(authUser)) {
    return null;
  }

  return (
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
};

export default ReferenceDataInterface;
