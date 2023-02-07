import React, { useState } from 'react';
import styled from 'styled-components';
import { get, map, merge, set } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { object } from 'yup';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// typings
import { CLError, Multiloc, IOption } from 'typings';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { appLocalePairs } from 'containers/App/constants';
import messages from '../messages';

// components
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import {
  Input,
  IconTooltip,
  Label,
  Success,
  Error,
  Toggle,
  Button,
  Box,
} from '@citizenlab/cl2-component-library';
import MultipleSelect from 'components/UI/MultipleSelect';
import {
  Section,
  SectionTitle,
  SubSectionTitle,
  SectionField,
  SectionDescription,
} from 'components/admin/Section';
import Outlet from 'components/Outlet';

// services
import {
  updateAppConfiguration,
  IUpdatedAppConfigurationProperties,
  TAppConfigurationSettingWithEnabled,
  IAppConfigurationSettingsCore,
  updateAppConfigurationCore,
} from 'services/appConfiguration';

// Utils
import useAppConfiguration from 'hooks/useAppConfiguration';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

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

interface Props {
  defaultValues: FormValues;
}

const SettingsGeneralTab = ({ defaultValues }: Props) => {
  const appConfiguration = useAppConfiguration();
  const [hasUrlError, setHasUrlError] = useState(false);
  const [settingsUpdatedSuccessFully, setSettingsUpdatedSuccessFully] =
    useState(false);
  const [settingsSavingError, setSettingsSavingError] = useState(false);
  const [attributesDiff, setAttributesDiff] =
    useState<IUpdatedAppConfigurationProperties>({});

  const { formatMessage } = useIntl();

  const schema = object({
    organization_name: validateMultilocForEveryLocale(
      formatMessage(messages.organizationNameMultilocError)
    ),
  });
  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await save(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const handleCoreMultilocSettingOnChange =
    (propertyName: string) => (multiloc: Multiloc) => {
      setAttributesDiff((attributesDiff) => ({
        ...attributesDiff,
        settings: {
          ...get(attributesDiff, 'settings', {}),
          core: {
            ...get(attributesDiff, 'settings.core', {}),
            [propertyName]: multiloc,
          },
        },
      }));
    };

  const handleLocalesOnChange = (selectedLocaleOptions: IOption[]) => {
    setAttributesDiff((attributesDiff) => ({
      ...attributesDiff,
      settings: {
        ...get(attributesDiff, 'settings', {}),
        core: {
          ...get(attributesDiff, 'settings.core', {}),
          locales: selectedLocaleOptions.map((option) => option.value),
        },
      },
    }));
  };

  const handleUrlOnChange = (url: string) => {
    setAttributesDiff((attributesDiff) => ({
      ...attributesDiff,
      settings: {
        ...get(attributesDiff, 'settings', {}),
        core: {
          ...get(attributesDiff, 'settings.core', {}),
          organization_site: url,
        },
      },
    }));
  };

  const save = async (formValues: FormValues) => {
    await updateAppConfigurationCore(formValues);
    // if (isCLErrorJSON(e)) {
    //   const errors = e.json.errors;
    //   setErrors(errors);
    //   setLoading(false);
    //   // This error check uses an undocumented API from the backend.
    //   // Needs to be reimplemented to use frontend validation when converted to a React Hook Form.
    //   if (errors.settings && errors.settings.length > 0) {
    //     const foundUrlError = !!errors.settings.find((error) => {
    //       return (
    //         typeof error.error !== 'string' &&
    //         error.error.fragment === '#/core/organization_site'
    //       );
    //     });

    //     if (foundUrlError) {
    //       setHasUrlError(true);
    //     }
    //   }
    // }
  };

  const getLocaleOptions = () => {
    return map(appLocalePairs, (label, locale) => ({
      label,
      value: locale,
    }));
  };

  const localesToOptions = (locales) => {
    return locales.map((locale) => ({
      value: locale,
      label: appLocalePairs[locale],
    }));
  };

  const handleOrganizatioNameOnChange =
    handleCoreMultilocSettingOnChange('organization_name');

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
    const updatedLocales = get(attributesDiff, 'settings.core.locales');

    let appConfigAttrs = appConfiguration
      ? merge({}, appConfiguration.attributes, attributesDiff)
      : merge({}, attributesDiff);

    // Prevent merging the arrays of locales
    if (updatedLocales) {
      appConfigAttrs = set(
        appConfigAttrs,
        'settings.core.locales',
        updatedLocales
      );
    }

    const appConfigLocales: string[] | null = get(
      appConfigAttrs,
      'settings.core.locales',
      null
    );
    const organizationType: string | null = get(
      appConfigAttrs,
      'settings.core.organization_type',
      null
    );
    const appConfigSite: string | null = get(
      appConfigAttrs,
      'settings.core.organization_site',
      null
    );
    const organizationNameMultiloc: Multiloc | null = get(
      appConfigAttrs,
      'settings.core.organization_name',
      null
    );
    const localeOptions = getLocaleOptions();
    const selectedLocaleOptions = localesToOptions(appConfigLocales);
    const profanityBlockerSetting =
      appConfiguration.attributes.settings.blocking_profanity;

    return (
      <>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onFormSubmit)}>
            <SectionTitle>
              <FormattedMessage {...messages.titleBasic} />
            </SectionTitle>
            <StyledSection>
              <SubSectionTitle>
                <FormattedMessage {...messages.platformConfiguration} />
              </SubSectionTitle>
              <SectionDescription>
                <FormattedMessage {...messages.subtitleBasic} />
              </SectionDescription>

              <SectionField>
                <InputMultilocWithLocaleSwitcher
                  type="text"
                  id="organization_name"
                  label={
                    <FormattedMessage
                      {...messages.organizationName}
                      values={{ type: organizationType }}
                    />
                  }
                  valueMultiloc={organizationNameMultiloc}
                  onChange={handleOrganizatioNameOnChange}
                />
              </SectionField>

              <SectionField>
                <Label>
                  <FormattedMessage {...messages.languages} />
                  <IconTooltip
                    content={
                      <FormattedMessage {...messages.languagesTooltip} />
                    }
                  />
                </Label>
                <MultipleSelect
                  placeholder=""
                  value={selectedLocaleOptions}
                  onChange={handleLocalesOnChange}
                  options={localeOptions}
                />
              </SectionField>

              <SectionField>
                <Label>
                  <FormattedMessage {...messages.urlTitle} />
                  <IconTooltip
                    content={formatMessage(messages.urlTitleTooltip)}
                  />
                </Label>
                <Input
                  type="text"
                  placeholder="https://..."
                  onChange={handleUrlOnChange}
                  value={appConfigSite}
                  error={hasUrlError ? formatMessage(messages.urlError) : null}
                />
              </SectionField>
              <Box display="flex">
                <Button
                  type="submit"
                  processing={methods.formState.isSubmitting}
                >
                  {formatMessage(messages.save)}
                </Button>
              </Box>
            </StyledSection>
          </form>
        </FormProvider>
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
