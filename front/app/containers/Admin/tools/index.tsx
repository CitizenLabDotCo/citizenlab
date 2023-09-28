import React from 'react';
import { Box, Title } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';
import useAuthUser from 'api/me/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import messages from './messages';
import Workshops from './Workshops';
import Widget from './Widget';
import PublicAPI from './PublicAPI';

export const Tools = () => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  if (isNilOrError(authUser)) return null;

  const isUserAdmin = isAdmin({ data: authUser.data });

  return (
    <Box width="100%" display="flex" justifyContent="center">
      <Box maxWidth="800px">
        <Title color="primary">{formatMessage(messages.toolsLabel)}</Title>
        <Workshops />
        {isUserAdmin && <Widget />}
        {isUserAdmin && <PublicAPI />}
      </Box>
    </Box>
  );
};

export default Tools;
