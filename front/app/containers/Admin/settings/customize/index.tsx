import React, { useState, useEffect } from 'react';

import { get, has, isEmpty, omitBy } from 'lodash-es';
import styled from 'styled-components';
import { UploadFile, Multiloc } from 'typings';

import { Section, SectionTitle } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';

import { useIntl } from 'utils/cl-intl';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';

import {
  IAppConfigurationStyle,
  IAppConfiguration,
  IAppConfigurationSettings,
} from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

import useLocale from 'hooks/useLocale';

import sharedSettingsMessages from '../messages';

import Branding from './Branding';
import getSubmitState from './getSubmitState';
import messages from './messages';

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
    return (
      <form onSubmit={save}>
        <Branding
          logo={logo}
          logoError={logoError}
          setAttributesDiff={setAttributesDiff}
          setLogo={setLogo}
          getSetting={getSetting}
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
