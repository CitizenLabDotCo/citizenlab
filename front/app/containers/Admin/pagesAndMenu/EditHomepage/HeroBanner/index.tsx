import React, { useState, useEffect } from 'react';
import { CLErrors } from 'typings';

// components
import { ISubmitState } from 'components/admin/SubmitWrapper';
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
import useHomepageSettings from 'api/home_page/useHomepageSettings';
import {
  IHomepageSettingsAttributes,
  THomepageBannerLayout,
  IHomepageSettings,
} from 'api/home_page/types';

// i18n
import HelmetIntl from 'components/HelmetIntl';
import { useIntl } from 'utils/cl-intl';
import messages from '../../containers/GenericHeroBannerForm/messages';
import CTASettings from '../../containers/GenericHeroBannerForm//CTASettings';
import LayoutSettingField from '../../containers/GenericHeroBannerForm/LayoutSettingField';
import useUpdateHomepageSettings from 'api/home_page/useUpdateHomepageSettings';

const EditHomepageHeroBannerFormWrapper = () => {
  const { data: homepageSettings } = useHomepageSettings();
  if (!homepageSettings) return null;

  return <EditHomepageHeroBannerForm homepageSettings={homepageSettings} />;
};

interface Props {
  homepageSettings: IHomepageSettings;
}

const EditHomepageHeroBannerForm = ({ homepageSettings }: Props) => {
  const { formatMessage } = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLErrors | null>(null);
  const [formStatus, setFormStatus] = useState<ISubmitState>('enabled');
  const [localSettings, setLocalSettings] =
    useState<IHomepageSettingsAttributes>(homepageSettings.data.attributes);
  const { mutateAsync: updateHomepageSettings } = useUpdateHomepageSettings();

  useEffect(() => {
    if (homepageSettings) {
      setLocalSettings(homepageSettings.data.attributes);
    }
  }, [homepageSettings]);

  const handleSave = async () => {
    if (localSettings.header_bg === null) {
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
      homepageSettings.data.attributes.header_bg?.large === null
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
    signedInHeaderMultiloc: IHomepageSettingsAttributes['banner_signed_in_header_multiloc']
  ) => {
    handleOnChange('banner_signed_in_header_multiloc', signedInHeaderMultiloc);
  };

  // signed out handlers
  const handleHeaderSignedOutMultilocOnChange = (
    signedOutHeaderMultiloc: IHomepageSettingsAttributes['banner_signed_out_header_multiloc']
  ) => {
    handleOnChange(
      'banner_signed_out_header_multiloc',
      signedOutHeaderMultiloc
    );
  };
  const handleSubheaderSignedOutMultilocOnChange = (
    signedOutSubheaderMultiloc: IHomepageSettingsAttributes['banner_signed_out_subheader_multiloc']
  ) => {
    handleOnChange(
      'banner_signed_out_subheader_multiloc',
      signedOutSubheaderMultiloc
    );
  };

  const handleOnOverlayChange = (
    opacity: IHomepageSettingsAttributes['banner_signed_out_header_overlay_opacity'],
    color: IHomepageSettingsAttributes['banner_signed_out_header_overlay_color']
  ) => {
    setFormStatus('enabled');

    setLocalSettings({
      ...localSettings,
      banner_signed_out_header_overlay_color: color,
      banner_signed_out_header_overlay_opacity: opacity,
    });
  };

  const handleOnChangeBannerAvatarsEnabled = (
    bannerAvatarsEnabled: IHomepageSettingsAttributes['banner_avatars_enabled']
  ) => {
    handleOnChange('banner_avatars_enabled', bannerAvatarsEnabled);
  };

  const handleOnBannerImageAdd = (newImageBase64: string) => {
    handleOnChange('header_bg', newImageBase64);
  };

  const handleOnBannerImageRemove = () => {
    handleOnChange('header_bg', null);
    handleOnOverlayChange(null, null);
  };

  const handleOnChange = (
    key: keyof IHomepageSettingsAttributes,
    value: unknown
  ) => {
    setFormStatus('enabled');

    setLocalSettings({
      ...localSettings,
      [key]: value,
    });
  };

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
            onAddImage={handleOnBannerImageAdd}
            onRemoveImage={handleOnBannerImageRemove}
            onOverlayChange={handleOnOverlayChange}
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
        layoutSettingFieldComponent={
          <LayoutSettingField
            bannerLayout={localSettings.banner_layout}
            onChange={(bannerLayout: THomepageBannerLayout) => {
              handleOnChange('banner_layout', bannerLayout);
            }}
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
        ctaSettingsComponent={
          <CTASettings
            localHomepageSettings={localSettings}
            onChange={handleOnChange}
            apiErrors={apiErrors}
          />
        }
      />
    </>
  );
};

export default EditHomepageHeroBannerFormWrapper;
