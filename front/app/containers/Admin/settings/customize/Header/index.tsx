import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { debounce } from 'lodash-es';

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
  IconTooltip,
  Select,
  IOption,
  Label,
  Toggle,
  ColorPickerInput,
} from 'cl2-component-library';
import HeaderImageDropzone from './HeaderImageDropzone';
import RangeInput from 'components/UI/RangeInput';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Outlet from 'components/Outlet';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { get, forOwn, size, trim } from 'lodash-es';
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
  const [overlayEnabled, setOverlayEnabled] = useState(false);

  const handleOverlayToggleOnChange = () => {
    setOverlayEnabled(!overlayEnabled);

    if (!overlayEnabled) {
      if (!latestAppConfigStyleSettings?.signedOutHeaderOverlayColor) {
        handleAppConfigurationStyleChange('signedOutHeaderOverlayColor')(
          theme.colorMain
        );
      }
      if (!latestAppConfigStyleSettings?.signedOutHeaderOverlayOpacity) {
        handleAppConfigurationStyleChange('signedOutHeaderOverlayOpacity')(80);
      }
    }

    if (overlayEnabled) {
      handleAppConfigurationStyleChange('signedOutHeaderOverlayColor')(
        undefined
      );
      handleAppConfigurationStyleChange('signedOutHeaderOverlayOpacity')(0);
    }
  };

  const handleOverlayColorOnChange = (color: string) => {
    handleAppConfigurationStyleChange('signedOutHeaderOverlayColor')(color);
  };

  const handleOverlayOpacityOnChange = (opacity: number) => {
    handleAppConfigurationStyleChange('signedOutHeaderOverlayOpacity')(opacity);
  };

  const debouncedHandleOverlayOpacityOnChange = useMemo(
    () => debounce(handleOverlayOpacityOnChange, 15),
    []
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

  const handleHeaderBgOnAdd = createAddUploadHandler(
    'header_bg',
    setParentState
  );
  const handleHeaderBgOnRemove = createRemoveUploadHandler(
    'header_bg',
    setParentState
  );

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
      <SectionField key={'header_bg'}>
        <SubSectionTitle>
          <FormattedMessage {...messages.header_bg} />
          <IconTooltip
            content={<FormattedMessage {...messages.header_bgTooltip} />}
          />
        </SubSectionTitle>
        {header_bg && (
          <>
            <Label>Show preview for:</Label>
            {/* Add note for layout 2? changes to a column in mobile view */}
            <BgHeaderPreviewSelect
              options={[
                { value: 'desktop', label: 'Desktop' },
                { value: 'tablet', label: 'Tablet' },
                { value: 'phone', label: 'Phone' },
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
          overlayEnabled={overlayEnabled}
          headerError={headerError}
          header_bg={header_bg}
          previewDevice={previewDevice}
          layout={layout}
        />

        {layout === 'full_width_banner_layout' && (
          <SectionField>
            <Toggle
              checked={overlayEnabled}
              onChange={handleOverlayToggleOnChange}
              label={'Add overlay to image?'}
            />
          </SectionField>
        )}
        {overlayEnabled && (
          <>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.imageOverlayColor} />
              </Label>
              <ColorPickerInput
                type="text"
                value={
                  latestAppConfigStyleSettings?.signedOutHeaderOverlayColor ||
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
                  latestAppConfigStyleSettings?.signedOutHeaderOverlayOpacity ||
                  90
                }
                  onChange={debouncedHandleOverlayOpacityOnChange}
      </SectionField>
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
    </Section>
  );
};

export default injectIntl(Header);
