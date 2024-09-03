import React from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';

import { IGlobalPermissionData } from 'api/permissions/types';
import usePermissions from 'api/permissions/usePermissions';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { Section, SectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import ActionForms from './ActionForms';
import messages from './messages';

const filterPermissions = (permissions: IGlobalPermissionData[]) => {
  return permissions.filter((permission) =>
    [
      'posting_initiative',
      'commenting_initiative',
      'reacting_initiative',
    ].includes(permission.attributes.action)
  );
};

const PermissionsInitiatives = () => {
  const { data: unfilteredPermissions } = usePermissions();
  const featureEnabled = useFeatureFlag({ name: 'granular_permissions' });

  if (!featureEnabled || !unfilteredPermissions) return null;

  const permissions = filterPermissions(unfilteredPermissions.data);

  return (
    <>
      <Title color="primary" mb="30px">
        <FormattedMessage {...messages.permissionsText} />
      </Title>
      <Box background={colors.white} p="40px">
        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.granularPermissionsTitle} />
          </SectionTitle>
          <ActionForms permissions={permissions} />
        </Section>
      </Box>
    </>
  );
};

export default PermissionsInitiatives;
