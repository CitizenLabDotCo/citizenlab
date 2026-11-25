import React, { useMemo } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import useUserjotIdentity from 'api/userjot_identity/useUserjotIdentity';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import UserjotEmbed from './UserjotEmbed';
import { UserjotIdentity } from './userjotSdk';

const ProductFeedback = () => {
  const userjotEnabled = useFeatureFlag({ name: 'userjot' });
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: userjotIdentity, isError } = useUserjotIdentity(
    userjotEnabled ? authUser?.data.id : undefined
  );

  const identity = useMemo<UserjotIdentity | undefined>(() => {
    if (!authUser || !appConfiguration || !userjotIdentity) return undefined;

    const { email, first_name, last_name, avatar } = authUser.data.attributes;
    const tenant = appConfiguration.data;

    return {
      id: authUser.data.id,
      signature: userjotIdentity.data.attributes.signature,
      email,
      firstName: first_name ?? undefined,
      lastName: last_name ?? undefined,
      avatar: avatar?.medium ?? undefined,
      companies: [
        {
          id: tenant.id,
          name: tenant.attributes.name,
          domain: tenant.attributes.host,
        },
      ],
    };
  }, [authUser, appConfiguration, userjotIdentity]);

  if (!userjotEnabled) return null;

  return (
    <Box id="e2e-product-feedback-page" h="100vh" bg={colors.white}>
      {isError ? (
        <Box p="24px">
          <Warning>
            <FormattedMessage {...messages.loadingFailed} />
          </Warning>
        </Box>
      ) : (
        userjotIdentity &&
        identity && (
          <UserjotEmbed
            projectId={userjotIdentity.data.attributes.project_id}
            identity={identity}
          />
        )
      )}
    </Box>
  );
};

export default ProductFeedback;
