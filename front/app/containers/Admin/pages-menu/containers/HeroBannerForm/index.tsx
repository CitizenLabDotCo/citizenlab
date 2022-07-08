import React, { useState, useMemo, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';

// components
import Error from 'components/UI/Error';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import InfoBar from '../../components/InfoBar';
import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';

import {
  Setting,
  ToggleLabel,
  StyledToggle,
  LabelContent,
  LabelTitle,
  LabelDescription,
} from 'containers/Admin/settings/general';

import {
  Box,
  Button,
  ColorPickerInput,
  IconTooltip,
  IOption,
  Label,
  Select,
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
import { UploadFile, Multiloc, CLError } from 'typings';
type MultilocErrorType = {
  signedOutHeaderErrors: Multiloc;
  signedOutSubheaderErrors: Multiloc;
};
export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

// resources
import {
  IHomepageSettingsAttributes,
  updateHomepageSettings,
} from 'services/homepageSettings';
import useHomepageSettings from 'hooks/useHomepageSettings';

// utils
import { isNil, isNilOrError } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';
import { forOwn, size, trim, debounce, pick } from 'lodash-es';
import { convertUrlToUploadFile } from 'utils/fileUtils';

// constants
import { pagesAndMenuBreadcrumb, homeBreadcrumb } from '../../breadcrumbs';
const TITLE_MAX_CHAR_COUNT = 45;
const SUBTITLE_MAX_CHAR_COUNT = 90;

const BgHeaderPreviewSelect = styled(Select)`
  margin-bottom: 20px;
`;

const HeroBannerForm = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const theme: any = useTheme();
  const homepageSettings = useHomepageSettings();

  // component state
  const [isLoading, setIsLoading] = useState(false);
  const [headerLocalDisplayImage, setHeaderLocalDisplayImage] = useState<
    UploadFile[] | null
  >(null);
  const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);
  const [headerAndSubheaderErrors, setHeaderAndSubheaderErrors] =
    useState<MultilocErrorType>({
      signedOutHeaderErrors: {},
      signedOutSubheaderErrors: {},
    });
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [localHomepageSettings, setLocalHomepageSettings] =
    useState<IHomepageSettingsAttributes | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

  useEffect(() => {
    if (!isNilOrError(homepageSettings)) {
      // copy homepage settings to local state
      setLocalHomepageSettings({
        ...homepageSettings.data.attributes,
        banner_layout:
          homepageSettings.data.attributes.banner_layout ??
          'full_width_banner_layout',
      });

      // the image file sent from the API needs to be converted
      // to a format that can be displayed
      const convertHeaderToUploadFile = async (fileInfo) => {
        if (fileInfo) {
          const tenantHeaderBg = await convertUrlToUploadFile(fileInfo.url);
          const headerBgUploadFile = !isNilOrError(tenantHeaderBg)
            ? [tenantHeaderBg]
            : [];
          setHeaderLocalDisplayImage(headerBgUploadFile);
          setBannerError(null);
        }
      };

      const headerFileInfo = homepageSettings.data.attributes.header_bg?.large;
      convertHeaderToUploadFile(headerFileInfo);
    }
  }, [homepageSettings]);

  const onSave = async () => {
    if (localHomepageSettings) {
      // only send the keys that relate to the banner
      // and layout back to the API
      const bannerRelevantKeys = [
        'banner_layout',
        'banner_avatars_enabled',
        'banner_signed_out_header_overlay_opacity',
        'banner_signed_out_header_overlay_color',
        'banner_signed_out_header_multiloc',
        'banner_signed_out_subheader_multiloc',
        'banner_signed_in_header_multiloc',
        'header_bg',
      ];
      const bannerRelevantValues = pick(
        localHomepageSettings,
        bannerRelevantKeys
      );
      setIsLoading(true);
      try {
        await updateHomepageSettings(bannerRelevantValues);
        setApiErrors(null);
        setIsLoading(false);
      } catch (error) {
        if (isCLErrorJSON(error)) {
          setApiErrors(error.json.errors);
        } else {
          setApiErrors(error);
        }
        setIsLoading(false);
      }
    }
  };

  const updateValueInLocalHomepageSettings = (key: string, value: any) => {
    if (localHomepageSettings) {
      setLocalHomepageSettings({
        ...localHomepageSettings,
        [key]: value,
      });
    }
  };

  const handleSettingOnChange = (
    key: keyof IHomepageSettingsAttributes,
    value: any
  ) => {
    updateValueInLocalHomepageSettings(key, value);
  };

  const handleOverlayColorOnChange = (color: string) => {
    updateValueInLocalHomepageSettings(
      'banner_signed_out_header_overlay_color',
      color
    );
  };

  const handleOverlayOpacityOnChange = (opacity: number) => {
    updateValueInLocalHomepageSettings(
      'banner_signed_out_header_overlay_opacity',
      opacity
    );
  };

  const debounceHandleOverlayOpacityOnChange = debounce(
    handleOverlayOpacityOnChange,
    15
  );

  const debouncedHandleOverlayOpacityOnChange = useMemo(
    () => debounceHandleOverlayOpacityOnChange,
    [debounceHandleOverlayOpacityOnChange]
  );

  const handleSignedOutHeaderOnChange = (titleMultiloc: Multiloc) => {
    const signedOutHeaderErrors = {};

    forOwn(titleMultiloc, (title, locale) => {
      if (size(trim(title)) > 45) {
        signedOutHeaderErrors[locale] = formatMessage(
          messages.titleMaxCharError
        );
      }
    });

    updateValueInLocalHomepageSettings(
      'banner_signed_out_header_multiloc',
      titleMultiloc
    );
    setHeaderAndSubheaderErrors((prevState) => ({
      ...prevState,
      ...signedOutHeaderErrors,
    }));
  };

  const handleSignedOutSubheaderOnChange = (subtitleMultiloc: Multiloc) => {
    const signedOutSubheaderErrors = {};

    forOwn(subtitleMultiloc, (subtitle, locale) => {
      if (size(trim(subtitle)) > 90) {
        signedOutSubheaderErrors[locale] = formatMessage(
          messages.subtitleMaxCharError
        );
      }
    });

    updateValueInLocalHomepageSettings(
      'banner_signed_out_subheader_multiloc',
      subtitleMultiloc
    );
    setHeaderAndSubheaderErrors((prevState) => ({
      ...prevState,
      ...signedOutSubheaderErrors,
    }));
  };

  const handleSignedInHeaderOnChange = (titleMultiloc: Multiloc) => {
    // no length limit for signed-in header
    updateValueInLocalHomepageSettings(
      'banner_signed_in_header_multiloc',
      titleMultiloc
    );
  };

  // set error and disable save button if header is removed
  useEffect(() => {
    if (isNil(localHomepageSettings?.header_bg)) {
      setBannerError(formatMessage(messages.noHeader));
      return;
    }

    setBannerError(null);
  }, [localHomepageSettings?.header_bg, formatMessage]);

  if (isNilOrError(localHomepageSettings)) {
    return null;
  }

  const bannerImageAddHandler = (newImage: UploadFile[]) => {
    // this base64 value is sent to the API
    updateValueInLocalHomepageSettings('header_bg', newImage[0].base64);
    // this value is used for local display
    setHeaderLocalDisplayImage([newImage[0]]);
  };

  const bannerImageRemoveHandler = () => {
    updateValueInLocalHomepageSettings('header_bg', null);
    setHeaderLocalDisplayImage(null);
  };

  const {
    banner_layout,
    banner_avatars_enabled,
    banner_signed_out_header_overlay_opacity,
    banner_signed_out_header_overlay_color,
    banner_signed_out_header_multiloc,
    banner_signed_out_subheader_multiloc,
    banner_signed_in_header_multiloc,
    header_bg,
  } = localHomepageSettings;

  const saveDisabled = isLoading || isNil(header_bg);

  return (
    <SectionFormWrapper
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: formatMessage(homeBreadcrumb.label),
          linkTo: homeBreadcrumb.linkTo,
        },
        { label: formatMessage(messages.header) },
      ]}
      title={formatMessage(messages.heroBannerTitle)}
      stickyMenuContents={
        <Button disabled={saveDisabled} onClick={onSave}>
          <FormattedMessage {...messages.saveHeroBanner} />
        </Button>
      }
    >
      <Section key={'header'}>
        <InfoBar
          textContent={<FormattedMessage {...messages.heroBannerInfoBar} />}
        />
        <Outlet
          id="app.containers.Admin.settings.customize.headerSectionStart"
          latestHomepageSettings={localHomepageSettings}
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
          {!isNilOrError(headerLocalDisplayImage) && (
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
                onChange={(option: IOption) => setPreviewDevice(option.value)}
                value={previewDevice}
              />
            </>
          )}
          <HeaderImageDropzone
            onAdd={bannerImageAddHandler}
            onRemove={bannerImageRemoveHandler}
            homepageSettingsOverlayColor={
              banner_signed_out_header_overlay_color
            }
            homepageSettingsOverlayOpacity={
              banner_signed_out_header_overlay_opacity
            }
            headerError={bannerError}
            header_bg={headerLocalDisplayImage}
            previewDevice={previewDevice}
            // check on default
            layout={banner_layout || 'full_width_banner_layout'}
          />
        </SectionField>

        {/* We only allow the overlay for the full-width banner layout for the moment. */}
        {banner_layout === 'full_width_banner_layout' &&
          headerLocalDisplayImage && (
            <>
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.imageOverlayColor} />
                </Label>
                <ColorPickerInput
                  type="text"
                  value={
                    // default values come from the theme
                    banner_signed_out_header_overlay_color ?? theme.colorMain
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
                    banner_signed_out_header_overlay_opacity ||
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
            valueMultiloc={banner_signed_out_header_multiloc}
            label={
              <Box display="flex" mr="20px">
                <FormattedMessage {...messages.bannerHeaderSignedOut} />
              </Box>
            }
            maxCharCount={TITLE_MAX_CHAR_COUNT}
            onChange={handleSignedOutHeaderOnChange}
            errorMultiloc={headerAndSubheaderErrors.signedOutHeaderErrors}
          />
        </SectionField>
        <SectionField>
          <InputMultilocWithLocaleSwitcher
            type="text"
            valueMultiloc={banner_signed_out_subheader_multiloc}
            label={formatMessage(messages.bannerHeaderSignedOutSubtitle)}
            maxCharCount={SUBTITLE_MAX_CHAR_COUNT}
            onChange={handleSignedOutSubheaderOnChange}
            errorMultiloc={headerAndSubheaderErrors.signedOutSubheaderErrors}
          />
        </SectionField>
        <SectionField>
          <InputMultilocWithLocaleSwitcher
            type="text"
            valueMultiloc={banner_signed_in_header_multiloc}
            label={formatMessage(messages.bannerHeaderSignedIn)}
            onChange={handleSignedInHeaderOnChange}
          />
        </SectionField>
        <SectionField key="avatars">
          <SubSectionTitle>
            <FormattedMessage {...messages.avatarsTitle} />
          </SubSectionTitle>
          <Setting>
            <ToggleLabel>
              <StyledToggle
                checked={!!banner_avatars_enabled}
                onChange={() => {
                  updateValueInLocalHomepageSettings(
                    'banner_avatars_enabled',
                    !banner_avatars_enabled
                  );
                }}
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
          latestHomepageSettings={localHomepageSettings}
          handleOnChange={handleSettingOnChange}
          // testing
          errors={{ base: [{ error: 'some error' }] }}
        />
        <Error apiErrors={apiErrors} />
      </Section>
    </SectionFormWrapper>
  );
};

export default injectIntl(HeroBannerForm);
