import React, { useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

// components
// import Error from 'components/UI/Error';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import {
  Section,
  SectionField,
  SectionTitle,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';

import {
  Setting,
  StyledToggle,
  ToggleLabel,
  LabelContent,
  LabelTitle,
  LabelDescription,
} from 'containers/admin/settings/general';

import {
  Box,
  Button,
  Select,
  IOption,
  Label,
  ColorPickerInput,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import HeaderImageDropzone from './HeaderImageDropzone';
import RangeInput from 'components/UI/RangeInput';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Outlet from 'components/Outlet';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { Multiloc, CLError } from 'typings';

// resources
import { isNilOrError } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

// utils
import { get, forOwn, size, trim, debounce } from 'lodash-es';
import {
  createAddUploadHandler,
  createRemoveUploadHandler,
  createCoreMultilocHandler,
} from 'containers/admin/settings/customize/createHandler';

const BgHeaderPreviewSelect = styled(Select)`
  margin-bottom: 20px;
`;

// constants
const TITLE_MAX_CHAR_COUNT = 45;
const SUBTITLE_MAX_CHAR_COUNT = 90;
export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

const HeroBannerForm = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const theme: any = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);

  const onSave = () => {
    console.log('save');
  };

  const handleOverlayColorOnChange = (color: string) => {
    handleAppConfigurationStyleChange('signedOutHeaderOverlayColor')(color);
  };

  const handleOverlayOpacityOnChange = (opacity: number) => {
    handleAppConfigurationStyleChange('signedOutHeaderOverlayOpacity')(opacity);
  };

  const debounceHandleOverlayOpacityOnChange = debounce(
    handleOverlayOpacityOnChange,
    15
  );

  const debouncedHandleOverlayOpacityOnChange = useMemo(
    () => debounceHandleOverlayOpacityOnChange,
    [debounceHandleOverlayOpacityOnChange]
  );

  const layout =
    latestAppConfigSettings.customizable_homepage_banner?.layout ||
    'full_width_banner_layout';

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

  const handleAppConfigurationStyleChange =
    (key: string) => (value: unknown) => {
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
    const titleError = {};

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
    const subtitleError = {};

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

  const headerBgOnAddHandler = createAddUploadHandler(
    'header_bg',
    setParentState
  );
  const headerBgOnRemoveHandler = createRemoveUploadHandler(
    'header_bg',
    setParentState
  );

  const handleHeaderBgOnRemove = () => {
    headerBgOnRemoveHandler();
  };

  const handleDisplayHeaderAvatarsOnChange = () => {
    setParentState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...state.settings,
            ...get(state.attributesDiff, 'settings', {}),
            core: {
              ...get(state.settings, 'core', {}),
              ...get(state.attributesDiff, 'settings.core', {}),
              display_header_avatars:
                !getSetting('core').display_header_avatars,
            },
          },
        },
      };
    });
  };

  const handleHeaderBgPreviewOnChange = (option: IOption) => {
    setPreviewDevice(option.value);
  };

  return (
    <SectionFormWrapper
      breadcrumbs={[
        { label: formatMessage(messages.title), linkTo: 'admin' },
        { label: formatMessage(messages.homeTitle), linkTo: 'pages-and-menu' },
        { label: formatMessage(messages.heroBannerPageTitle) },
      ]}
      title="Bottom Info Section"
      stickyMenuContents={
        <Button disabled={isLoading} onClick={onSave}>
          Save Bottom Info Form
        </Button>
      }
    >
      <>
        <Section key={'header'}>
          <SectionTitle>
            <FormattedMessage {...messages.header} />
          </SectionTitle>
          <SectionDescription>
            <FormattedMessage {...messages.headerDescription} />
          </SectionDescription>
          <Outlet
            id="app.containers.Admin.settings.customize.headerSectionStart"
            latestAppConfigSettings={latestAppConfigSettings}
            handleOnChange={handleSettingOnChange}
          />
          <SubSectionTitle>
            <FormattedMessage {...messages.header_bg} />
            <IconTooltip
              content={
                <FormattedMessage
                  {...messages.headerBgTooltip}
                  values={{
                    supportPageLink: (
                      <a
                        href={formatMessage(messages.headerImageSupportPageURL)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FormattedMessage
                          {...messages.headerImageSupportPageText}
                        />
                      </a>
                    ),
                  }}
                />
              }
            />
          </SubSectionTitle>
          <SectionField>
            {header_bg && (
              <>
                <Label>
                  <FormattedMessage {...messages.bgHeaderPreviewSelectLabel} />
                </Label>
                <BgHeaderPreviewSelect
                  options={[
                    {
                      value: 'desktop',
                      label: formatMessage(messages.desktop),
                    },
                    {
                      value: 'tablet',
                      label: formatMessage(messages.tablet),
                    },
                    {
                      value: 'phone',
                      label: formatMessage(messages.phone),
                    },
                  ]}
                  onChange={handleHeaderBgPreviewOnChange}
                  value={previewDevice}
                />
              </>
            )}

            <HeaderImageDropzone
              onAdd={headerBgOnAddHandler}
              onRemove={handleHeaderBgOnRemove}
              latestAppConfigStyleSettings={latestAppConfigStyleSettings}
              headerError={headerError}
              header_bg={header_bg}
              previewDevice={previewDevice}
              layout={layout}
            />
          </SectionField>

          {/* We only allow the overlay for the full-width banner layout for the moment. */}
          {layout === 'full_width_banner_layout' && header_bg && (
            <>
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.imageOverlayColor} />
                </Label>
                <ColorPickerInput
                  type="text"
                  // default values come from the theme
                  value={
                    latestAppConfigStyleSettings?.signedOutHeaderOverlayColor ??
                    theme.colorMain
                  }
                  onChange={handleOverlayColorOnChange}
                />
              </SectionField>
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.imageOverlayOpacity} />
                </Label>
                <RangeInput
                  step={1}
                  min={0}
                  max={100}
                  value={
                    latestAppConfigStyleSettings?.signedOutHeaderOverlayOpacity ??
                    theme.signedOutHeaderOverlayOpacity
                  }
                  onChange={debouncedHandleOverlayOpacityOnChange}
                />
              </SectionField>
            </>
          )}
          <SectionField key={'banner_text'}>
            <SubSectionTitle>
              <FormattedMessage {...messages.bannerTextTitle} />
            </SubSectionTitle>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={latestAppConfigCoreSettings?.['header_title']}
              label={
                <Box display="flex" mr="20px">
                  <FormattedMessage {...messages.bannerHeaderSignedOut} />
                </Box>
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
                latestAppConfigCoreSettings?.[
                  'custom_onboarding_fallback_message'
                ]
              }
              label={formatMessage(messages.bannerHeaderSignedIn)}
              onChange={updateOnboardingFallbackMessage}
            />
          </SectionField>
          <SectionField key="avatars">
            <SubSectionTitle>
              <FormattedMessage {...messages.avatarsTitle} />
            </SubSectionTitle>
            <Setting>
              <ToggleLabel>
                <StyledToggle
                  checked={
                    !!latestAppConfigCoreSettings?.['display_header_avatars']
                  }
                  onChange={handleDisplayHeaderAvatarsOnChange}
                />
                <LabelContent>
                  <LabelTitle>
                    {formatMessage(messages.bannerDisplayHeaderAvatars)}
                  </LabelTitle>
                  <LabelDescription>
                    {formatMessage(messages.bannerDisplayHeaderAvatarsSubtitle)}
                  </LabelDescription>
                </LabelContent>
              </ToggleLabel>
            </Setting>
          </SectionField>
          <Outlet
            id="app.containers.Admin.settings.customize.headerSectionEnd"
            latestAppConfigSettings={latestAppConfigSettings}
            handleOnChange={handleSettingOnChange}
            errors={errors}
          />
        </Section>
      </>
    </SectionFormWrapper>
  );
};

export default injectIntl(HeroBannerForm);
