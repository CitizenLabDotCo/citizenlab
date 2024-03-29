import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';

import Esri from './Esri';
import messages from './messages';
import PowerBI from './PowerBI';
import PublicAPI from './PublicAPI';
import Widget from './Widget';
import Workshops from './Workshops';

export const Tools = () => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const isEsriIntegrationEnabled = useFeatureFlag({ name: 'esri_integration' }); // TODO: Remove this when releasing esri integration

  if (isNilOrError(authUser)) return null;
  const isUserAdmin = isAdmin({ data: authUser.data });

  return (
    <Box width="100%" display="flex" justifyContent="center">
      <Box maxWidth="800px">
        <Title color="primary">{formatMessage(messages.toolsLabel)}</Title>
        <Workshops />
        {isUserAdmin && isEsriIntegrationEnabled && <Esri />}
        {isUserAdmin && <Widget />}
        {isUserAdmin && <PublicAPI />}
        {isUserAdmin && <PowerBI />}
      </Box>
    </Box>
  );
};

export default Tools;
