import React, { useState } from 'react';
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
} from '../general';
import { IconTooltip, Select, IOption, Label } from 'cl2-component-library';
import ImagesDropzone from 'components/UI/ImagesDropzone';
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
} from './createHandler';

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

const StyledImagesDropzone = styled(ImagesDropzone)`
  margin-bottom: 20px;
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
  const [previewDevice, setPreviewDevice] = useState<
    'mobile' | 'tablet' | 'desktop'
  >('desktop');

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

  const getImagePreviewRatio = () => {
    const layoutHeightOnDevice = heights[layout][previewDevice];
    const standardDeviceWidth = { desktop: 1530, tablet: 768, phone: 375 }[
      previewDevice
    ];
    const deviceWidthPerLayout =
      previewDevice === 'desktop' && layout === 'two_column_layout' ? 0.5 : 1;
    const ratio =
      layoutHeightOnDevice / (standardDeviceWidth * deviceWidthPerLayout);

    return ratio;
  };

  const latestAppConfigCoreSettings = latestAppConfigSettings?.core;

  const heights = {
    full_width_banner_layout: {
      desktop: 450,
      tablet: 350,
      phone: 300,
    },
    two_column_layout: {
      desktop: 532,
      tablet: 532,
      phone: 240,
    },
    two_row_layout: {
      desktop: 280,
      tablet: 200,
      phone: 200,
    },
  };
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

        <StyledImagesDropzone
          id="landingpage-header-dropzone"
          acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
          images={header_bg}
          imagePreviewRatio={getImagePreviewRatio()}
          onAdd={handleHeaderBgOnAdd}
          onRemove={handleHeaderBgOnRemove}
          errorMessage={headerError}
        />

        <Outlet
          id="app.containers.Admin.settings.customize.headerBgSectionFieldEnd"
          onChange={handleAppConfigurationStyleChange}
          theme={theme}
          latestAppConfigStyleSettings={latestAppConfigStyleSettings}
        />
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
