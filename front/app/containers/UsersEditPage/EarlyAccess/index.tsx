import React, { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import appConfigurationKeys from 'api/app_configuration/keys';
import { TAppConfigurationSetting } from 'api/app_configuration/types';
import useAuthUser from 'api/me/useAuthUser';
import useUpdateUser from 'api/users/useUpdateUser';

import Error from 'components/UI/Error';
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';

import { EARLY_ACCESS_FEATURES } from './features';
import FeatureToggle from './FeatureToggle';
import messages from './messages';

const EarlyAccess = () => {
  const { formatMessage } = useIntl();
  const { data: authUser, isFetching } = useAuthUser();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const queryClient = useQueryClient();
  const [failed, setFailed] = useState(false);

  const offered = authUser?.data.attributes.offered_early_access_features;

  if (!authUser || !offered) {
    return null;
  }

  const features = EARLY_ACCESS_FEATURES.filter(({ name }) => offered[name]);

  if (features.length === 0) {
    return null;
  }

  const optedIn = authUser.data.attributes.early_access_features ?? [];

  const handleChange = (name: TAppConfigurationSetting) => () => {
    const next = optedIn.includes(name)
      ? optedIn.filter((feature) => feature !== name)
      : [...optedIn, name];

    setFailed(false);
    updateUser(
      { userId: authUser.data.id, early_access_features: next },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: appConfigurationKeys.all(),
          });
        },
        onError: () => setFailed(true),
      }
    );
  };

  return (
    <FormSection>
      <FormSectionTitle
        message={messages.earlyAccessTitle}
        subtitleMessage={messages.earlyAccessSubtitle}
      />
      {features.map(({ name, title, description }) => (
        <FeatureToggle
          key={name}
          title={title}
          description={description}
          level={offered[name]}
          checked={optedIn.includes(name)}
          // A toggle writes back the whole list, so block a second change until the
          // list we are reading from is the saved one again.
          disabled={isPending || isFetching}
          onChange={handleChange(name)}
        />
      ))}
      {failed && <Error text={formatMessage(messages.earlyAccessSaveError)} />}
    </FormSection>
  );
};

export default EarlyAccess;
