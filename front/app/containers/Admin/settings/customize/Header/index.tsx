import React, { useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

// components
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
} from '../../general';
import {
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
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { get, forOwn, size, trim, debounce } from 'lodash-es';
import {
  createAddUploadHandler,
  createRemoveUploadHandler,
  createCoreMultilocHandler,
} from '../createHandler';

// typings
import { UploadFile, Multiloc } from 'typings';
import {
  TAppConfigurationSetting,
  IAppConfigurationSettings,
  IAppConfigurationStyle,
} from 'services/appConfiguration';

const LabelTooltip = styled.div`
  display: flex;
  margin-right: 20px;
`;

const BgHeaderPreviewSelect = styled(Select)`
  margin-bottom: 20px;
`;

interface Props {
  header_bg: UploadFile[] | null;
  headerError: string | null;
  titleError: Multiloc;
  subtitleError: Multiloc;
  latestAppConfigStyleSettings?: IAppConfigurationStyle;
  latestAppConfigSettings:
    | IAppConfigurationSettings
    | Partial<IAppConfigurationSettings>;
  setParentState: (state: any) => void;
  getSetting: (settingName: string) => any;
  handleSettingOnChange: (
    settingName: TAppConfigurationSetting
  ) => (settingKey: string, settingValue: any) => void;
}

const TITLE_MAX_CHAR_COUNT = 45;
const SUBTITLE_MAX_CHAR_COUNT = 90;

export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';
const Header = ({
  header_bg,
  headerError,
  titleError,
  subtitleError,
  latestAppConfigStyleSettings,
  latestAppConfigSettings,
  setParentState,
  getSetting,
  handleSettingOnChange,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const theme: any = useTheme();
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

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

  const handleHeaderBgOnAdd = (newImage: UploadFile[]) => {
    handleAppConfigurationStyleChange('signedOutHeaderOverlayColor')(
      theme.colorMain
    );
    handleAppConfigurationStyleChange('signedOutHeaderOverlayOpacity')(80);
    headerBgOnAddHandler(newImage);
  };

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
              display_header_avatars: !getSetting('core')
                .display_header_avatars,
            },
          },
        },
      };
    });
  };

  const handleHeaderBgPreviewOnChange = (option: IOption) => {
    setPreviewDevice(option.value);
  };

  const latestAppConfigCoreSettings = latestAppConfigSettings?.core;

  return (
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
          onAdd={handleHeaderBgOnAdd}
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
          {typeof latestAppConfigStyleSettings?.signedOutHeaderOverlayColor ===
            'string' && (
            <SectionField>
              <Label>
                <FormattedMessage {...messages.imageOverlayColor} />
              </Label>
              <ColorPickerInput
                type="text"
                value={latestAppConfigStyleSettings.signedOutHeaderOverlayColor}
                onChange={handleOverlayColorOnChange}
              />
            </SectionField>
          )}
          {typeof latestAppConfigStyleSettings?.signedOutHeaderOverlayOpacity ===
            'number' && (
            <SectionField>
              <Label>
                <FormattedMessage {...messages.imageOverlayOpacity} />
              </Label>
              <RangeInput
                step={1}
                min={0}
                max={100}
                value={
                  latestAppConfigStyleSettings.signedOutHeaderOverlayOpacity
                }
                onChange={debouncedHandleOverlayOpacityOnChange}
              />
            </SectionField>
          )}
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
            <LabelTooltip>
              <FormattedMessage {...messages.bannerHeaderSignedOut} />
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
        errors={{}}
      />
    </Section>
  );
};

export default injectIntl(Header);
