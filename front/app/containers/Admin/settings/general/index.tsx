import React, { useState } from 'react';

import { Success, Error, Toggle } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { Section, SubSectionTitle } from 'components/admin/Section';
import Outlet from 'components/Outlet';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import {
  TAppConfigurationSetting,
  IAppConfigurationSettingsCore,
} from 'api/app_configuration/types';

// Utils
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

import messages from '../messages';

import Form from './Form';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

export const StyledToggle = styled(Toggle)`
  margin-right: 15px;
`;

export const Setting = styled.div`
  margin-bottom: 20px;
`;

export const LabelTitle = styled.div`
  font-weight: bold;
`;

export const ToggleLabel = styled.label`
  display: flex;
`;

export const LabelDescription = styled.div``;
export const LabelContent = styled.div`
  display: flex;
  flex-direction: column;
`;

interface FormValues {
  organization_name: IAppConfigurationSettingsCore['organization_name'];
  locales: IAppConfigurationSettingsCore['locales'];
  organization_site: IAppConfigurationSettingsCore['organization_site'];
}

const SettingsGeneralTab = () => {
  const [settingsUpdatedSuccessFully, setSettingsUpdatedSuccessFully] =
    useState(false);
  const { data: appConfiguration } = useAppConfiguration();
  const {
    mutate: updateAppConfiguration,
    mutateAsync: updateAppConfigurationAsync,

    isError: settingsSavingError,
    reset,
  } = useUpdateAppConfiguration();

  const { formatMessage } = useIntl();

  const handleOnSubmit = async (formValues: FormValues) => {
    await updateAppConfigurationAsync({ settings: { core: formValues } });
  };

  const onToggleBlockProfanitySetting = () => {
    if (
      !isNilOrError(appConfiguration) &&
      appConfiguration.data.attributes.settings.blocking_profanity
    ) {
      const oldProfanityBlockerEnabled =
        appConfiguration.data.attributes.settings.blocking_profanity.enabled;

      updateAppConfiguration(
        {
          settings: {
            blocking_profanity: {
              enabled: !oldProfanityBlockerEnabled,
            },
          },
        },
        { onSuccess: () => setSettingsUpdatedSuccessFully(true) }
      );
    }
  };

  const handleSettingChange = (settingName: TAppConfigurationSetting) => {
    if (!isNilOrError(appConfiguration)) {
      const setting = appConfiguration.data.attributes.settings[settingName];

      if (setting) {
        const oldSettingEnabled = setting.enabled;
        reset();

        updateAppConfiguration({
          settings: {
            [settingName]: {
              enabled: !oldSettingEnabled,
            },
          },
        });
      }
    }
  };

  if (!isNilOrError(appConfiguration)) {
    const profanityBlockerSetting =
      appConfiguration.data.attributes.settings.blocking_profanity;

    const { organization_name, organization_site, locales } =
      appConfiguration.data.attributes.settings.core;

    return (
      <>
        <Form
          defaultValues={{
            organization_name,
            organization_site,
            locales,
          }}
          onSubmit={handleOnSubmit}
        />
        <StyledSection>
          <SubSectionTitle>
            <FormattedMessage {...messages.contentModeration} />
          </SubSectionTitle>
          {profanityBlockerSetting && profanityBlockerSetting.allowed && (
            <Setting>
              <ToggleLabel>
                <StyledToggle
                  checked={profanityBlockerSetting.enabled}
                  onChange={onToggleBlockProfanitySetting}
                />
                <LabelContent>
                  <LabelTitle>
                    {formatMessage(messages.profanityBlockerSetting)}
                  </LabelTitle>
                  <LabelDescription>
                    {formatMessage(messages.profanityBlockerSettingDescription)}
                  </LabelDescription>
                </LabelContent>
              </ToggleLabel>
            </Setting>
          )}
          <Outlet
            id="app.containers.Admin.settings.general.form"
            onSettingChange={handleSettingChange}
          />
          {settingsUpdatedSuccessFully && (
            <Success
              showBackground
              text={formatMessage(messages.successfulUpdateSettings)}
            />
          )}
          {settingsSavingError && (
            <Error text={formatMessage(messages.settingsSavingError)} />
          )}
        </StyledSection>
      </>
    );
  }

  return null;
};

export default SettingsGeneralTab;
