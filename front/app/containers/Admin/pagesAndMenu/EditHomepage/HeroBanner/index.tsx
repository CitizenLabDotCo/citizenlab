import React, { useState, useEffect } from 'react';
import { Multiloc } from 'typings';

// components
import GenericHeroBannerForm, {
  HeroBannerInputSettings,
} from '../../containers/GenericHeroBannerForm';
import {
  pagesAndMenuBreadcrumb,
  homeBreadcrumb,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';
import AvatarsField from '../../containers/GenericHeroBannerForm/AvatarsField';
import BannerHeaderMultilocField from '../../containers/GenericHeroBannerForm/BannerHeaderMultilocField';
// resources
import useHomepageSettings from 'hooks/useHomepageSettings';
import {
  IHomepageSettingsAttributes,
  updateHomepageSettings,
} from 'services/homepageSettings';
import Outlet from 'components/Outlet';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { forOwn, isEqual } from 'lodash-es';

// i18n
// change
import messages from '../../containers/GenericHeroBannerForm/messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { ISubmitState } from 'components/admin/SubmitWrapper';

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

  const { attributes } = homepageSettings;

  const handleSave = async (newSettings: HeroBannerInputSettings) => {
    if (!newSettings) return;

    // some names in the generic form are different from the property on Homepage
    const propsMappedToHomepageSettingsNames: Partial<IHomepageSettingsAttributes> =
      {
        banner_signed_out_header_overlay_opacity:
          newSettings.banner_overlay_opacity,
        banner_signed_out_header_overlay_color:
          newSettings.banner_overlay_color,
        banner_signed_out_header_multiloc: newSettings.banner_header_multiloc,
        banner_signed_out_subheader_multiloc:
          newSettings.banner_subheader_multiloc,
        // the rest are the same as used in the form
        ...newSettings,
      };

    // only update the page settings if they have changed
    const diffedValues = {};
    forOwn(propsMappedToHomepageSettingsNames, (value, key) => {
      if (!isEqual(value, attributes[key])) {
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

  // this could probably be done smarter without enumerating everything, but
  // the generic form uses the keys from CustomPage and we have to map
  // the different keys from HomePage to those
  const mappedInputSettings = {
    banner_layout: attributes.banner_layout,
    banner_overlay_color: attributes.banner_signed_out_header_overlay_color,
    banner_overlay_opacity: attributes.banner_signed_out_header_overlay_opacity,
    banner_header_multiloc: attributes.banner_signed_out_header_multiloc,
    banner_subheader_multiloc: attributes.banner_signed_out_header_multiloc,
    banner_signed_in_header_multiloc:
      attributes.banner_signed_in_header_multiloc,
    banner_avatars_enabled: attributes.banner_avatars_enabled,
    header_bg: attributes.header_bg,

    // cta settings
    banner_cta_signed_out_type: attributes.banner_cta_signed_out_type,
    banner_cta_signed_out_text_multiloc:
      attributes.banner_cta_signed_out_text_multiloc,
    banner_cta_signed_out_url: attributes.banner_cta_signed_out_url,
    banner_cta_signed_in_type: attributes.banner_cta_signed_in_type,
    banner_cta_signed_in_text_multiloc:
      attributes.banner_cta_signed_in_text_multiloc,
    banner_cta_signed_in_url: attributes.banner_cta_signed_in_url,
  };

  const handleOnChangeaSignedInHeader = (headerMultiloc: Multiloc) => {
    handleOnChange('banner_signed_in_header_multiloc')(headerMultiloc);
  };

  const handleOnChangeBannerAvatarsEnabled = (
    bannerAvatarsEnabled: boolean
  ) => {
    handleOnChange('banner_avatars_enabled')(bannerAvatarsEnabled);
  };
  const handleOnChange =
    (key: keyof IHomepageSettingsAttributes) => (value: unknown) => {
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
        inputSettings={mappedInputSettings}
        setFormStatus={setFormStatus}
        bannerMultilocFieldComponent={
          <BannerHeaderMultilocField
            onChange={handleOnChangeaSignedInHeader}
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

export interface HomepageHeroBannerInputSettings {
  banner_layout: IHomepageSettingsAttributes['banner_layout'];
  banner_overlay_opacity:
    | IHomepageSettingsAttributes['banner_signed_out_header_overlay_opacity'];
  banner_overlay_color:
    | IHomepageSettingsAttributes['banner_signed_out_header_overlay_color'];
  banner_header_multiloc:
    | IHomepageSettingsAttributes['banner_signed_out_header_multiloc'];
  banner_subheader_multiloc:
    | IHomepageSettingsAttributes['banner_signed_out_header_multiloc'];
  header_bg: IHomepageSettingsAttributes['header_bg'];
  // homepage only properties, optional
  banner_signed_in_header_multiloc: IHomepageSettingsAttributes['banner_signed_in_header_multiloc'];
  banner_avatars_enabled: IHomepageSettingsAttributes['banner_avatars_enabled'];
  // cta settings, only on homepage
  banner_cta_signed_in_text_multiloc: IHomepageSettingsAttributes['banner_cta_signed_in_text_multiloc'];
  banner_cta_signed_in_type: IHomepageSettingsAttributes['banner_cta_signed_in_type'];
  banner_cta_signed_in_url: IHomepageSettingsAttributes['banner_cta_signed_in_url'];
  // cta_signed_out
  // this can be retyped since it exists on custom page too
  banner_cta_signed_out_text_multiloc: IHomepageSettingsAttributes['banner_cta_signed_out_text_multiloc'];
  banner_cta_signed_out_type: IHomepageSettingsAttributes['banner_cta_signed_out_type'];
  banner_cta_signed_out_url: IHomepageSettingsAttributes['banner_cta_signed_out_url'];
}
