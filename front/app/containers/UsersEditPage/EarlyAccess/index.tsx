import React from 'react';

import { useQueryClient } from '@tanstack/react-query';

import appConfigurationKeys from 'api/app_configuration/keys';
import { TAppConfigurationSetting } from 'api/app_configuration/types';
import useAuthUser from 'api/me/useAuthUser';
import useUpdateUser from 'api/users/useUpdateUser';

import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';

import { isAdmin } from 'utils/permissions/roles';

import { EARLY_ACCESS_FEATURES } from './features';
import FeatureToggle from './FeatureToggle';
import messages from './messages';

const EarlyAccess = () => {
  const { data: authUser } = useAuthUser();
  const { mutate: updateUser } = useUpdateUser();
  const queryClient = useQueryClient();

  if (!authUser || !isAdmin(authUser) || EARLY_ACCESS_FEATURES.length === 0) {
    return null;
  }

  const optedIn = authUser.data.attributes.early_access_features ?? [];

  const handleChange = (name: TAppConfigurationSetting) => () => {
    const next = optedIn.includes(name)
      ? optedIn.filter((feature) => feature !== name)
      : [...optedIn, name];

    updateUser(
      { userId: authUser.data.id, early_access_features: next },
      {
        // The features live on the app configuration, which useUpdateUser does
        // not invalidate, so without this the toggle flips but nothing changes.
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: appConfigurationKeys.all(),
          });
        },
      }
    );
  };

  return (
    <FormSection>
      <FormSectionTitle
        message={messages.earlyAccessTitle}
        subtitleMessage={messages.earlyAccessSubtitle}
      />
      {EARLY_ACCESS_FEATURES.map(({ name, title, description }) => (
        <FeatureToggle
          key={name}
          title={title}
          description={description}
          checked={optedIn.includes(name)}
          onChange={handleChange(name)}
        />
      ))}
    </FormSection>
  );
};

export default EarlyAccess;
