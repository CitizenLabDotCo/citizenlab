import React from 'react';
import styled, { useTheme } from 'styled-components';

// components
import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import { Label, IconTooltip } from 'cl2-component-library';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Outlet from 'components/Outlet';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { get, forOwn, size, trim } from 'lodash-es';
import {
  createAddUploadHandler,
  createRemoveUploadHandler,
  createCoreMultilocHandler,
} from './createHandler';

// typings
import { UploadFile, Multiloc } from 'typings';
import {
  IAppConfigurationSettingsCore,
  IAppConfigurationStyle,
} from 'services/appConfiguration';

const LabelTooltip = styled.div`
  display: flex;
  margin-right: 20px;
`;

interface Props {
  header_bg: UploadFile[] | null;
  headerError: string | null;
  titleError: Multiloc;
  subtitleError: Multiloc;
  latestAppConfigStyleSettings?: IAppConfigurationStyle;
  latestAppConfigCoreSettings?: IAppConfigurationSettingsCore;
  setParentState: (state: any) => void;
}

const TITLE_MAX_CHAR_COUNT = 45;
const SUBTITLE_MAX_CHAR_COUNT = 90;

const Header = ({
  header_bg,
  headerError,
  titleError,
  subtitleError,
  latestAppConfigStyleSettings,
  latestAppConfigCoreSettings,
  setParentState,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const theme: any = useTheme();

  const updateHeaderTitle = createCoreMultilocHandler(
    'header_title',
    setParentState
  );
  const updateHeaderSlogan = createCoreMultilocHandler(
    'header_slogan',
    setParentState
  );
  const updateOnboardingFallbackMessage = createCoreMultilocHandler(
    'custom_onboarding_fallback_message',
    setParentState
  );

  const handleAppConfigurationStyleChange = (key: string) => (
    value: unknown
  ) => {
    setParentState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          style: {
            ...get(state.attributesDiff, 'style', {}),
            [key]: value,
          },
        },
      };
    });
  };

  const handleTitleOnChange = (titleMultiloc: Multiloc) => {
    const titleError = {} as Multiloc;

    forOwn(titleMultiloc, (title, locale) => {
      if (size(trim(title)) > 45) {
        titleError[locale] = formatMessage(messages.titleMaxCharError);
      }
    });

    updateHeaderTitle(titleMultiloc);
    setParentState((prevState) => ({
      ...prevState,
      titleError,
    }));
  };

  const handleSubtitleOnChange = (subtitleMultiloc: Multiloc) => {
    const subtitleError = {} as Multiloc;

    forOwn(subtitleMultiloc, (subtitle, locale) => {
      if (size(trim(subtitle)) > 90) {
        subtitleError[locale] = formatMessage(messages.subtitleMaxCharError);
      }
    });

    updateHeaderSlogan(subtitleMultiloc);
    setParentState((prevState) => ({
      ...prevState,
      subtitleError,
    }));
  };

  const handleHeaderBgOnAdd = createAddUploadHandler(
    'header_bg',
    setParentState
  );
  const handleHeaderBgOnRemove = createRemoveUploadHandler(
    'header_bg',
    setParentState
  );

  return (
    <Section key={'header'}>
      <SubSectionTitle>
        <FormattedMessage {...messages.header} />
      </SubSectionTitle>
      <SectionField key={'header_bg'}>
        <Label htmlFor="landingpage-header-dropzone">
          <FormattedMessage {...messages.header_bg} />
          <IconTooltip
            content={<FormattedMessage {...messages.header_bgTooltip} />}
          />
        </Label>
        <ImagesDropzone
          id="landingpage-header-dropzone"
          acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
          images={header_bg}
          imagePreviewRatio={480 / 1440}
          maxImagePreviewWidth="500px"
          onAdd={handleHeaderBgOnAdd}
          onRemove={handleHeaderBgOnRemove}
          errorMessage={headerError}
        />
      </SectionField>

      <Outlet
        id="app.containers.Admin.settings.customize.fields"
        onChange={handleAppConfigurationStyleChange}
        theme={theme}
        latestAppConfigStyleSettings={latestAppConfigStyleSettings}
      />

      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          valueMultiloc={latestAppConfigCoreSettings?.['header_title']}
          label={
            <LabelTooltip>
              <FormattedMessage {...messages.bannerHeaderSignedOut} />
              <IconTooltip
                content={
                  <FormattedMessage
                    {...messages.bannerHeaderSignedOutTooltip}
                  />
                }
              />
            </LabelTooltip>
          }
          maxCharCount={TITLE_MAX_CHAR_COUNT}
          onChange={handleTitleOnChange}
          errorMultiloc={titleError}
        />
      </SectionField>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          valueMultiloc={latestAppConfigCoreSettings?.['header_slogan']}
          label={formatMessage(messages.bannerHeaderSignedOutSubtitle)}
          maxCharCount={SUBTITLE_MAX_CHAR_COUNT}
          onChange={handleSubtitleOnChange}
          errorMultiloc={subtitleError}
        />
      </SectionField>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          valueMultiloc={
            latestAppConfigCoreSettings?.['custom_onboarding_fallback_message']
          }
          label={formatMessage(messages.bannerHeaderSignedIn)}
          onChange={updateOnboardingFallbackMessage}
        />
      </SectionField>
    </Section>
  );
};

export default injectIntl(Header);
