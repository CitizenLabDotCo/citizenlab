import React, { useState, useEffect } from 'react';
import { get, has, isEmpty, omitBy } from 'lodash-es';

// components
import { Section, SectionTitle } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Branding from './Branding';
import ProjectHeader from './ProjectHeader';

// style
import styled from 'styled-components';

// utils
import { convertUrlToUploadFile } from 'utils/fileUtils';
import getSubmitState from './getSubmitState';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import sharedSettingsMessages from '../messages';

// services
import {
  IAppConfigurationStyle,
  IAppConfiguration,
  IAppConfigurationSettings,
} from 'api/app_configuration/types';

// typings
import { UploadFile, Multiloc } from 'typings';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

export interface IAttributesDiff {
  settings?: Partial<IAppConfigurationSettings>;
  logo?: UploadFile;
  style?: IAppConfigurationStyle;
}

// Styles and custom components
export const StyledSection = styled(Section)`
  margin-bottom 20px;
`;

export const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom 30px;
`;

const SettingsCustomizeTab = () => {
  const [logo, setLogo] = useState<UploadFile[] | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [attributesDiff, setAttributesDiff] = useState<IAttributesDiff>({});
  const [titleError, setTitleError] = useState<Multiloc>({});
  const [subtitleError, setSubtitleError] = useState<Multiloc>({});

  const { formatMessage } = useIntl();

  const locale = useLocale();
  const { data: appConfiguration } = useAppConfiguration();
  const {
    mutate: updateAppConfiguration,
    isLoading,
    error,
    isSuccess,
  } = useUpdateAppConfiguration();

  useEffect(() => {
    const logoUrl = get(appConfiguration, 'data.attributes.logo.large', null);
    if (logoUrl) {
      (async () => {
        const imageFile = await convertUrlToUploadFile(logoUrl);
        if (imageFile) {
          setLogo([imageFile]);
        }
      })();
    }
  }, [appConfiguration]);

  const validate = (
    tenant: IAppConfiguration,
    attributesDiff: IAttributesDiff
  ) => {
    const hasRemoteLogo = has(tenant, 'data.attributes.logo.large');
    const localLogoIsNotSet = !has(attributesDiff, 'logo');
    const localLogoIsNull = !localLogoIsNotSet && attributesDiff.logo === null;
    const logoError =
      !localLogoIsNull || (hasRemoteLogo && localLogoIsNotSet)
        ? null
        : formatMessage(messages.noLogo);
    const hasTitleError = !isEmpty(omitBy(titleError, isEmpty));
    const hasSubtitleError = !isEmpty(omitBy(subtitleError, isEmpty));

    setLogoError(logoError);
    setTitleError(titleError);
    setSubtitleError(subtitleError);
    return !logoError && !hasTitleError && !hasSubtitleError;
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !isNilOrError(appConfiguration) &&
      validate(appConfiguration, attributesDiff)
    ) {
      if (!isEmpty(attributesDiff)) {
        updateAppConfiguration(attributesDiff, {
          onSuccess: () => {
            setAttributesDiff({});
          },
        });
      }
    }
  };

  const getSetting = (setting: string) => {
    return (
      get(attributesDiff, `settings.${setting}`) ??
      get(appConfiguration, `data.attributes.settings.${setting}`)
    );
  };

  if (!isNilOrError(locale) && !isNilOrError(appConfiguration)) {
    const latestAppConfigSettings = {
      ...appConfiguration.data.attributes.settings,
      ...attributesDiff.settings,
      core: {
        ...appConfiguration.data.attributes.settings.core,
        ...attributesDiff.settings?.core,
      },
    };
    const latestAppConfigCoreSettings = latestAppConfigSettings.core;

    return (
      <form onSubmit={save}>
        <Branding
          logo={logo}
          logoError={logoError}
          setAttributesDiff={setAttributesDiff}
          setLogo={setLogo}
          getSetting={getSetting}
        />

        <ProjectHeader
          currentlyWorkingOnText={
            latestAppConfigCoreSettings?.['currently_working_on_text']
          }
          setAttributesDiff={setAttributesDiff}
        />

        <SubmitWrapper
          loading={isLoading}
          status={getSubmitState({
            errors: error,
            saved: isSuccess,
            attributeDiff: attributesDiff,
          })}
          messages={{
            buttonSave: sharedSettingsMessages.save,
            buttonSuccess: sharedSettingsMessages.saveSuccess,
            messageError: sharedSettingsMessages.saveErrorMessage,
            messageSuccess: sharedSettingsMessages.saveSuccessMessage,
          }}
        />
      </form>
    );
  }

  return null;
};

export default SettingsCustomizeTab;
