import React, { useEffect, useState } from 'react';
import { Multiloc } from 'typings';

// components
import { ISubmitState } from 'components/admin/SubmitWrapper';
import Outlet from 'components/Outlet';
import {
  homeBreadcrumb,
  pagesAndMenuBreadcrumb,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';
import GenericHeroBannerForm from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm';
import BannerHeaderFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerHeaderFields';
import BannerHeaderMultilocField from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerHeaderMultilocField';
import BannerImageFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerImageFields';
import AvatarsField from '../../containers/GenericHeroBannerForm/AvatarsField';

// resources
import useHomepageSettings from 'hooks/useHomepageSettings';
import {
  IHomepageSettingsAttributes,
  updateHomepageSettings,
} from 'services/homepageSettings';

// utils
import { forOwn, isEqual } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import HelmetIntl from 'components/HelmetIntl';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../../containers/GenericHeroBannerForm/messages';

export type HomepageBannerSettingKeyType = Extract<
  keyof IHomepageSettingsAttributes,
  | 'banner_cta_signed_in_text_multiloc'
  | 'banner_cta_signed_in_url'
  | 'banner_cta_signed_in_type'
  | 'banner_cta_signed_out_text_multiloc'
  | 'banner_cta_signed_out_url'
  | 'banner_cta_signed_out_type'
>;

const EditHomepageHeroBannerForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSignedInCTAMultilocApiError, setHasSignedInCTAMultilocApiError] =
    useState(false);
  const [hasSignedOutCTAMultilocApiError, setHasSignedOutCTAMultilocApiError] =
    useState(false);
  const [hasSignedInCTAUrlApiError, setHasSignedInCTAUrlApiError] =
    useState(false);
  const [hasSignedOutCTAUrlApiError, setHasSignedOutCTAUrlApiError] =
    useState(false);
  const [formStatus, setFormStatus] = useState<ISubmitState>('disabled');
  const [localSettings, setLocalSettings] =
    useState<IHomepageSettingsAttributes | null>(null);

  const homepageSettings = useHomepageSettings();

  useEffect(() => {
    if (!isNilOrError(homepageSettings)) {
      setLocalSettings({
        ...homepageSettings.attributes,
      });
    }
  }, [homepageSettings]);

  // disable form if there's no header image when local settings change
  useEffect(() => {
    if (!localSettings?.header_bg) {
      setFormStatus('disabled');
    }
  }, [localSettings]);

  if (isNilOrError(homepageSettings)) {
    return null;
  }

  const handleSave = async () => {
    // only update the page settings if they have changed
    const diffedValues = {};
    forOwn(localSettings, (value, key) => {
      if (!isEqual(value, homepageSettings.attributes[key])) {
        diffedValues[key] = value;
      }
    });

    setIsLoading(true);
    setFormStatus('disabled');
    setHasSignedOutCTAMultilocApiError(false);
    setHasSignedInCTAMultilocApiError(false);
    setHasSignedOutCTAUrlApiError(false);
    setHasSignedInCTAUrlApiError(false);
    try {
      await updateHomepageSettings(diffedValues);
      setIsLoading(false);
      setFormStatus('success');
    } catch (error) {
      const apiErrors = error.json.errors;

      if (apiErrors) {
        if (apiErrors['banner_cta_signed_out_text_multiloc']) {
          setHasSignedOutCTAMultilocApiError(true);
        }

        if (apiErrors['banner_cta_signed_in_text_multiloc']) {
          setHasSignedInCTAMultilocApiError(true);
        }

        if (apiErrors['banner_cta_signed_out_url']) {
          setHasSignedOutCTAUrlApiError(true);
        }

        if (apiErrors['banner_cta_signed_in_url']) {
          setHasSignedInCTAUrlApiError(true);
        }
      }
      setIsLoading(false);
      setFormStatus('error');
    }
  };

  // signed in handlers
  const handleBannerSignedInMultilocOnChange = (
    signedInHeaderMultiloc: Multiloc
  ) => {
    handleOnChange('banner_signed_in_header_multiloc', signedInHeaderMultiloc);
  };

  // signed out handlers
  const handleHeaderSignedOutMultilocOnChange = (
    signedOutHeaderMultiloc: Multiloc
  ) => {
    handleOnChange(
      'banner_signed_out_header_multiloc',
      signedOutHeaderMultiloc
    );
  };
  const handleSubheaderSignedOutMultilocOnChange = (
    signedOutSubheaderMultiloc: Multiloc
  ) => {
    handleOnChange(
      'banner_signed_out_subheader_multiloc',
      signedOutSubheaderMultiloc
    );
  };
  const handleOverlayColorOnChange = (color: string) => {
    handleOnChange('banner_signed_out_header_overlay_color', color);
  };
  const handleOverlayOpacityOnChange = (opacity: number) => {
    handleOnChange('banner_signed_out_header_overlay_opacity', opacity);
  };

  const handleOnChangeBannerAvatarsEnabled = (
    bannerAvatarsEnabled: boolean
  ) => {
    handleOnChange('banner_avatars_enabled', bannerAvatarsEnabled);
  };

  const handleOnBannerImageAdd = (newImageBase64: string) => {
    handleOnChange('header_bg', newImageBase64);
  };

  const handleOnBannerImageRemove = () => {
    handleOnChange('header_bg', null);
  };

  const handleOnChange = (
    key: keyof IHomepageSettingsAttributes,
    value: unknown
  ) => {
    setFormStatus('enabled');

    if (!isNilOrError(localSettings)) {
      setLocalSettings({
        ...localSettings,
        [key]: value,
      });
    }
  };

  if (!isNilOrError(localSettings)) {
    return (
      <>
        <HelmetIntl title={messages.homepageMetaTitle} />
        <GenericHeroBannerForm
          onSave={handleSave}
          title={formatMessage(messages.heroBannerTitle)}
          isLoading={isLoading}
          formStatus={formStatus}
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumb.linkTo,
            },
            {
              label: formatMessage(homeBreadcrumb.label),
              linkTo: homeBreadcrumb.linkTo,
            },
            { label: formatMessage(messages.heroBannerTitle) },
          ]}
          setFormStatus={setFormStatus}
          bannerImageFieldsComponent={
            <BannerImageFields
              bannerLayout={localSettings.banner_layout}
              bannerOverlayColor={
                localSettings.banner_signed_out_header_overlay_color
              }
              bannerOverlayOpacity={
                localSettings.banner_signed_out_header_overlay_opacity
              }
              headerBg={localSettings.header_bg}
              setFormStatus={setFormStatus}
              onAddImage={handleOnBannerImageAdd}
              onRemoveImage={handleOnBannerImageRemove}
              onOverlayColorChange={handleOverlayColorOnChange}
              onOverlayOpacityChange={handleOverlayOpacityOnChange}
            />
          }
          bannerHeaderFieldsComponent={
            <BannerHeaderFields
              bannerHeaderMultiloc={
                localSettings.banner_signed_out_header_multiloc
              }
              bannerSubheaderMultiloc={
                localSettings.banner_signed_out_subheader_multiloc
              }
              onHeaderChange={handleHeaderSignedOutMultilocOnChange}
              onSubheaderChange={handleSubheaderSignedOutMultilocOnChange}
              title={formatMessage(messages.bannerTextTitle)}
              inputLabelText={formatMessage(messages.bannerHeaderSignedOut)}
              subheaderInputLabelText={formatMessage(
                messages.bannerHeaderSignedOutSubtitle
              )}
            />
          }
          outletSectionStart={
            <Outlet
              id="app.containers.Admin.settings.customize.headerSectionStart"
              bannerLayout={
                localSettings.banner_layout ?? 'full_width_banner_layout'
              }
              onChange={handleOnChange}
            />
          }
          bannerMultilocFieldComponent={
            <BannerHeaderMultilocField
              onChange={handleBannerSignedInMultilocOnChange}
              headerMultiloc={localSettings.banner_signed_in_header_multiloc}
            />
          }
          avatarsFieldComponent={
            <AvatarsField
              checked={localSettings.banner_avatars_enabled}
              onChange={handleOnChangeBannerAvatarsEnabled}
            />
          }
          outletSectionEnd={
            <Outlet
              id="app.containers.Admin.settings.customize.headerSectionEnd"
              localHomepageSettings={localSettings}
              onChange={handleOnChange}
              hasSignedOutCTAMultilocError={hasSignedOutCTAMultilocApiError}
              hasSignedInCTAMultilocError={hasSignedInCTAMultilocApiError}
              hasSignedOutCTAUrlError={hasSignedOutCTAUrlApiError}
              hasSignedInCTAUrlError={hasSignedInCTAUrlApiError}
            />
          }
        />
      </>
    );
  }

  return null;
};

export default injectIntl(EditHomepageHeroBannerForm);
