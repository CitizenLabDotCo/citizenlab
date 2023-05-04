import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import getSubmitState from 'utils/getSubmitState';
import { Multiloc } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

// components
import {
  SectionTitle,
  SubSectionTitle,
  SectionField,
  SectionDescription,
} from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import CustomFieldSettings from './CustomFieldSettings';
import ToggleUserConfirmation from './ToggleUserConfirmation';
import CustomFieldsSignupText from './CustomFieldsSignupText';

// i18n
import messages from 'containers/Admin/settings/messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import {
  IAppConfigurationSettings,
  IUpdatedAppConfigurationProperties,
  TAppConfigurationSettingCore,
} from 'api/app_configuration/types';

export const LabelTooltip = styled.div`
  display: flex;
`;

const SignUpFieldsSection = styled.div`
  margin-bottom: 60px;
`;

const SettingsRegistrationTab = () => {
  const { data: appConfig } = useAppConfiguration();
  const {
    mutate: updateAppConfiguration,
    error,
    isLoading: isFormSubmitting,
    isSuccess: isFormSaved,
  } = useUpdateAppConfiguration();

  const userConfirmationIsAllowed = useFeatureFlag({
    name: 'user_confirmation',
    onlyCheckAllowed: true,
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

  const userConfirmationToggleIsEnabled =
    !!latestAppConfigSettings?.user_confirmation?.enabled;

  const handleUserConfirmationToggleChange = (value: boolean) => {
    const newAttributesDiff = {
      ...attributesDiff,
      settings: {
        ...(attributesDiff.settings || {}),
        user_confirmation: { enabled: value },
      },
    };

    setAttributesDiff(newAttributesDiff);
  };

  if (!isNilOrError(latestAppConfigSettings)) {
    return (
      <>
        <SectionTitle>
          <FormattedMessage {...messages.registrationTitle} />
        </SectionTitle>
        <SignUpFieldsSection key={'signup_fields'}>
          <SubSectionTitle>
            <FormattedMessage {...messages.signupFormText} />
          </SubSectionTitle>
          <SectionDescription>
            <FormattedMessage {...messages.registrationHelperTextDescription} />
          </SectionDescription>
          <form onSubmit={handleSubmit}>
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                type="text"
                valueMultiloc={latestAppConfigSettings.core.signup_helper_text}
                onChange={handleCoreSettingWithMultilocOnChange(
                  'signup_helper_text'
                )}
                label={
                  <LabelTooltip>
                    <FormattedMessage {...messages.step1} />
                    <IconTooltip
                      content={<FormattedMessage {...messages.step1Tooltip} />}
                    />
                  </LabelTooltip>
                }
              />
            </SectionField>
            {userConfirmationIsAllowed && (
              <ToggleUserConfirmation
                onChange={handleUserConfirmationToggleChange}
                isEnabled={userConfirmationToggleIsEnabled}
              />
            )}
            <CustomFieldsSignupText
              onCoreSettingWithMultilocChange={
                handleCoreSettingWithMultilocOnChange
              }
              customFieldsSignupHelperTextMultiloc={
                latestAppConfigSettings.core.custom_fields_signup_helper_text
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
        </SignUpFieldsSection>
        <CustomFieldSettings />
      </>
    );
  }

  return null;
};

export default SettingsRegistrationTab;
