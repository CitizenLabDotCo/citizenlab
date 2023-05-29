import React from 'react';
import { Box, Title } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'services/permissions/roles';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import messages from './messages';
import Workshops from './Workshops';
import Widget from './Widget';
import PublicAPI from './PublicAPI';

export const Tools = () => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) return null;

  const isUserAdmin = isAdmin({ data: authUser });

  return (
    <Box width="100%" display="flex" justifyContent="center">
      <Box maxWidth="800px">
        <Title color="primary">{formatMessage(messages.tools)}</Title>
        <Workshops />
        {isUserAdmin && <Widget />}
        {isUserAdmin && <PublicAPI />}
      </Box>
    </Box>
  );
};

export default Tools;
