import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import Fields from './Fields';
import Header from './Header';
import messages from './messages';

const ReferenceDataInterface = () => {
  const { data: authUser } = useAuthUser();

  if (!authUser || !isAdmin(authUser)) {
    return null;
  }

  return (
    <>
      <Box display="flex" justifyContent="flex-start" mb="32px">
        <ButtonWithLink
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
