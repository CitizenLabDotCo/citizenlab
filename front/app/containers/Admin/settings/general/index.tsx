import React, { useState } from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// components
import { Success, Error, Toggle } from '@citizenlab/cl2-component-library';
import { Section, SubSectionTitle } from 'components/admin/Section';
import Outlet from 'components/Outlet';
import Form from './Form';

// services
import {
  updateAppConfiguration,
  TAppConfigurationSettingWithEnabled,
  IAppConfigurationSettingsCore,
  updateAppConfigurationCore,
} from 'services/appConfiguration';

// Utils
import useAppConfiguration from 'hooks/useAppConfiguration';

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
  const appConfiguration = useAppConfiguration();
  const [settingsUpdatedSuccessFully, setSettingsUpdatedSuccessFully] =
    useState(false);
  const [settingsSavingError, setSettingsSavingError] = useState(false);
  const { formatMessage } = useIntl();

  const handleOnSubmit = async (formValues: FormValues) => {
    await updateAppConfigurationCore(formValues);
  };

  const onToggleBlockProfanitySetting = () => {
    if (
      !isNilOrError(appConfiguration) &&
      appConfiguration.attributes.settings.blocking_profanity
    ) {
      const oldProfanityBlockerEnabled =
        appConfiguration.attributes.settings.blocking_profanity.enabled;
      setSettingsSavingError(false);
      updateAppConfiguration({
        settings: {
          blocking_profanity: {
            enabled: !oldProfanityBlockerEnabled,
          },
        },
      })
        .then(() => {
          setSettingsUpdatedSuccessFully(true);
          setTimeout(() => {
            setSettingsUpdatedSuccessFully(false);
          }, 2000);
        })
        .catch((_error) => {
          setSettingsSavingError(true);
        });
    }
  };

  const handleSettingChange = (
    settingName: TAppConfigurationSettingWithEnabled
  ) => {
    if (!isNilOrError(appConfiguration)) {
      const setting = appConfiguration.attributes.settings[settingName];

      if (setting) {
        const oldSettingEnabled = setting.enabled;
        setSettingsSavingError(false);

        updateAppConfiguration({
          settings: {
            [settingName]: {
              enabled: !oldSettingEnabled,
            },
          },
        })
          .then(() => {
            setSettingsUpdatedSuccessFully(true);

            setTimeout(() => {
              setSettingsUpdatedSuccessFully(true);
            }, 2000);
          })
          .catch((_error) => {
            setSettingsUpdatedSuccessFully(true);
          });
      }
    }
  };

  if (!isNilOrError(appConfiguration)) {
    const profanityBlockerSetting =
      appConfiguration.attributes.settings.blocking_profanity;

    const { organization_name, organization_site, locales } =
      appConfiguration.attributes.settings.core;

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
