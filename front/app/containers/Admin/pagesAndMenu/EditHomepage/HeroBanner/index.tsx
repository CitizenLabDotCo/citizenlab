import React, { useEffect, useState } from 'react';
import { CLErrors, Multiloc } from 'typings';

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
import { isNilOrError } from 'utils/helperUtils';

// i18n
import HelmetIntl from 'components/HelmetIntl';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../../containers/GenericHeroBannerForm/messages';

const EditHomepageHeroBannerForm = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLErrors | null>(null);
  const [formStatus, setFormStatus] = useState<ISubmitState>('enabled');
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

  if (isNilOrError(homepageSettings)) {
    return null;
  }

  const handleSave = async () => {
    if (localSettings?.header_bg == null) {
      setFormStatus('error');
      return;
    }

    // this is a hack. If both objects have a "large" key under header_bg with a null value,
    // it means the image was initialized (with the large: null value) on the server
    // and hasn't been updated by the user locally. we set the whole value to null
    // to trigger the FE error message. the  triple equals is on purpose, we want to
    // only trigger this when the value is explicitly null and not undefined
    if (
      localSettings.header_bg?.large === null &&
      homepageSettings.attributes.header_bg?.large === null
    ) {
      setLocalSettings({
        ...localSettings,
        header_bg: null,
      });
      setFormStatus('error');
      return;
    }

    setIsLoading(true);
    setApiErrors(null);
    try {
      await updateHomepageSettings(localSettings);
      setIsLoading(false);
      setFormStatus('success');
    } catch (error) {
      const apiErrors = error.json.errors;

      if (apiErrors) {
        setApiErrors(apiErrors);
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
              apiErrors={apiErrors}
            />
          }
        />
      </>
    );
  }

  return null;
};

export default injectIntl(EditHomepageHeroBannerForm);
