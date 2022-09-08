import React, { useState, useEffect } from 'react';
import { Multiloc } from 'typings';

// components
import GenericHeroBannerForm from '../../containers/GenericHeroBannerForm';
import {
  pagesAndMenuBreadcrumb,
  homeBreadcrumb,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';
import AvatarsField from '../../containers/GenericHeroBannerForm/AvatarsField';
import BannerHeaderMultilocField from '../../containers/GenericHeroBannerForm/BannerHeaderMultilocField';
import Outlet from 'components/Outlet';
import BannerHeaderFields from '../../containers/GenericHeroBannerForm/BannerHeaderFields';
import BannerImageFields from '../../containers/GenericHeroBannerForm/BannerImageFields';
import { ISubmitState } from 'components/admin/SubmitWrapper';

// resources
import useHomepageSettings from 'hooks/useHomepageSettings';
import {
  IHomepageSettingsAttributes,
  updateHomepageSettings,
} from 'services/homepageSettings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { forOwn, isEqual } from 'lodash-es';

// i18n
import messages from '../../containers/GenericHeroBannerForm/messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

const EditHomepageHeroBannerForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const [isLoading, setIsLoading] = useState(false);
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
    try {
      await updateHomepageSettings(diffedValues);
      setIsLoading(false);
      setFormStatus('success');
    } catch (error) {
      setIsLoading(false);
      setFormStatus('error');
    }
  };

  const handleBannerSignedInMultilocOnChange = (
    signedInHeaderMultiloc: Multiloc
  ) => {
    handleOnChange('banner_signed_in_header_multiloc', signedInHeaderMultiloc);
  };

  const handleHeaderSignedOutMultilocOnChange = (
    signedOutHeaderMultiloc: Multiloc
  ) => {
    handleOnChange(
      'banner_signed_out_header_multiloc',
      signedOutHeaderMultiloc
    );
  };

  const handleSubheaderSignedOutMultilocOnChange = (
    signedOutHeaderMultiloc: Multiloc
  ) => {
    handleOnChange(
      'banner_signed_out_subheader_multiloc',
      signedOutHeaderMultiloc
    );
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

  const handleOverlayColorOnChange = (color: string) => {
    handleOnChange('banner_signed_out_header_overlay_color', color);
  };
  const handleOverlayOpacityOnChange = (opacity: number) => {
    handleOnChange('banner_signed_out_header_overlay_opacity', opacity);
  };

  const handleOnChange = (
    key: keyof IHomepageSettingsAttributes,
    value: unknown
  ) => {
    if (!isNilOrError(localSettings)) {
      setLocalSettings({
        ...localSettings,
        [key]: value,
      });
    }
  };

  if (!isNilOrError(localSettings)) {
    return (
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
            titleMessage={messages.bannerTextTitle}
            inputLabelMessage={messages.bannerHeaderSignedOut}
          />
        }
        outletSectionStart={
          <Outlet
            id="app.containers.Admin.settings.customize.headerSectionStart"
            bannerLayout={localSettings.banner_layout ?? 'two_column_layout'}
            handleOnChange={handleOnChange}
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
            banner_cta_signed_in_text_multiloc={
              localSettings.banner_cta_signed_in_text_multiloc
            }
            banner_cta_signed_in_url={localSettings.banner_cta_signed_in_url}
            banner_cta_signed_in_type={localSettings.banner_cta_signed_in_type}
            banner_cta_signed_out_text_multiloc={
              localSettings.banner_cta_signed_out_text_multiloc
            }
            banner_cta_signed_out_url={localSettings.banner_cta_signed_out_url}
            banner_cta_signed_out_type={
              localSettings.banner_cta_signed_out_type
            }
            handleOnChange={handleOnChange}
          />
        }
      />
    );
  }

  return null;
};

export default injectIntl(EditHomepageHeroBannerForm);
