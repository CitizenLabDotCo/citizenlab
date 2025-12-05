import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import {
  IAppConfigurationSettings,
  IUpdatedAppConfigurationProperties,
  TAppConfigurationSettingCore,
} from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/Admin/settings/messages';

import {
  SectionTitle,
  SubSectionTitle,
  SectionDescription,
} from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Areas from 'components/Areas';
import Topics from 'components/Topics';

import { FormattedMessage } from 'utils/cl-intl';
import getSubmitState from 'utils/getSubmitState';
import { isNilOrError } from 'utils/helperUtils';

import CustomFieldSettings from './CustomFieldSettings';
import HelperTextInputs from './HelperTextInputs';
import ToggleShowFollowPreferences from './ToggleShowFollowPreferences';

export const LabelTooltip = styled.div`
  display: flex;
`;

const SettingsRegistrationTab = () => {
  const { data: appConfig } = useAppConfiguration();
  const {
    mutate: updateAppConfiguration,
    error,
    isLoading: isFormSubmitting,
    isSuccess: isFormSaved,
  } = useUpdateAppConfiguration();

  // Creating another instance to update follow preferences separately
  const { mutate: updateFollowPreferences } = useUpdateAppConfiguration();

  const isFollowingEnabled = useFeatureFlag({
    name: 'follow',
  });

  const [attributesDiff, setAttributesDiff] =
    useState<IUpdatedAppConfigurationProperties>({});
  const [latestAppConfigSettings, setLatestAppConfigSettings] =
    useState<IAppConfigurationSettings | null>(null);

  useEffect(() => {
    if (!isNilOrError(appConfig)) {
      setLatestAppConfigSettings(appConfig.data.attributes.settings);
    }
  }, [appConfig]);

  useEffect(() => {
    setLatestAppConfigSettings((latestAppConfigSettings) => {
      if (!isNilOrError(latestAppConfigSettings)) {
        const newLatestAppConfigSettings = {
          ...latestAppConfigSettings,
          ...attributesDiff.settings,
        };

        return newLatestAppConfigSettings as IAppConfigurationSettings;
      }

      return null;
    });
  }, [attributesDiff]);

  const handleCoreSettingWithMultilocOnChange =
    (coreSetting: TAppConfigurationSettingCore) => (multiloc: Multiloc) => {
      const newAttributesDiff = {
        ...attributesDiff,
        settings: {
          ...attributesDiff.settings,
          core: {
            ...(attributesDiff.settings?.core || {}),
            // needed because otherwise the useEffect that uses
            // setLatestAppConfigSettings will replace the entire core
            // setting with just our 1 setting whenever we change one of the fields
            ...latestAppConfigSettings?.core,
            [coreSetting]: multiloc,
          },
        },
      };

      setAttributesDiff(newAttributesDiff);
    };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    updateAppConfiguration(attributesDiff, {
      onSuccess: () => {
        setAttributesDiff({});
      },
    });
  };

  const isOnboardingEnabled = !!latestAppConfigSettings?.core.onboarding;

  const handleOnboardingChange = (value: boolean) => {
    updateFollowPreferences({
      settings: {
        core: {
          onboarding: value,
        },
      },
    });
  };

  if (!isNilOrError(latestAppConfigSettings)) {
    return (
      <>
        <SectionTitle>
          <FormattedMessage {...messages.registrationTitle} />
        </SectionTitle>
        <Box mb="60px" key={'signup_fields'}>
          <SubSectionTitle className="intercom-settings-tab-registration-helper-text">
            <FormattedMessage {...messages.signupFormText} />
          </SubSectionTitle>
          <SectionDescription>
            <FormattedMessage {...messages.registrationHelperTextDescription} />
          </SectionDescription>
          <form onSubmit={handleSubmit}>
            <HelperTextInputs
              coreSettings={latestAppConfigSettings.core}
              onCoreSettingWithMultilocChange={
                handleCoreSettingWithMultilocOnChange
              }
            />
            <SubmitWrapper
              loading={isFormSubmitting}
              status={getSubmitState({
                errors: error,
                saved: isFormSaved,
                diff: attributesDiff,
              })}
              messages={{
                buttonSave: messages.save,
                buttonSuccess: messages.saveSuccess,
                messageError: messages.saveErrorMessage,
                messageSuccess: messages.saveSuccessMessage,
              }}
            />
          </form>
          {isFollowingEnabled && (
            <Box maxWidth="500px" mt="36px">
              <ToggleShowFollowPreferences
                onChange={handleOnboardingChange}
                isEnabled={isOnboardingEnabled}
              />
              {isOnboardingEnabled && (
                <>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.selectOnboardingTopics} />
                  </SubSectionTitle>
                  <Topics action="updateOnboardingPreferences" />
                  <Box mt="36px">
                    <SubSectionTitle>
                      <FormattedMessage {...messages.selectOnboardingAreas} />
                    </SubSectionTitle>
                    <Areas action="updateOnboardingPreferences" />
                  </Box>
                </>
              )}
            </Box>
          )}
        </Box>
        <CustomFieldSettings />
      </>
    );
  }

  return null;
};

export default SettingsRegistrationTab;
