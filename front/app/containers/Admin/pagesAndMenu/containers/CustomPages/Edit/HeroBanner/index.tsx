import { ISubmitState } from 'components/admin/SubmitWrapper';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
import CTAButtonFields from 'containers/Admin/pagesAndMenu/containers/CustomPages/Edit/HeroBanner/CTAButtonFields';
import { PAGES_MENU_CUSTOM_PATH } from 'containers/Admin/pagesAndMenu/routes';

import BannerHeaderFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerHeaderFields';
import BannerImageFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerImageFields';
import LayoutSettingField from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/LayoutSettingField';
import useCustomPage from 'hooks/useCustomPage';
import { forOwn, isEqual } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  ICustomPageAttributes,
  TCustomPageBannerLayout,
  TCustomPageCTAType,
  updateCustomPage,
} from 'services/customPages';
import { isNilOrError } from 'utils/helperUtils';
import GenericHeroBannerForm from '../../../GenericHeroBannerForm';
import messages from '../../../GenericHeroBannerForm/messages';

import HelmetIntl from 'components/HelmetIntl';
import useLocalize from 'hooks/useLocalize';
import { Multiloc } from 'typings';
import { injectIntl } from 'utils/cl-intl';

export type CustomPageBannerSettingKeyType = Extract<
  keyof ICustomPageAttributes,
  | 'banner_cta_button_multiloc'
  | 'banner_cta_button_url'
  | 'banner_cta_button_type'
>;

const EditCustomPageHeroBannerForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const localize = useLocalize();
  const [isLoading, setIsLoading] = useState(false);
  const [hasCTAMultilocError, setHasCTAMultilocError] = useState(false);
  const [hasCTAUrlError, setHasCTAUrlError] = useState(false);
  const [formStatus, setFormStatus] = useState<ISubmitState>('disabled');
  const [localSettings, setLocalSettings] =
    useState<ICustomPageAttributes | null>(null);

  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);

  useEffect(() => {
    if (!isNilOrError(customPage)) {
      setLocalSettings({
        ...customPage.attributes,
      });
    }
  }, [customPage]);

  // disable form if there's no header image when local settings change
  useEffect(() => {
    if (!localSettings?.header_bg) {
      setFormStatus('disabled');
    }
  }, [localSettings]);

  if (isNilOrError(customPage)) {
    return null;
  }

  const handleSave = async () => {
    // only update the page settings if they have changed
    const diffedValues = {};
    forOwn(localSettings, (value, key) => {
      if (!isEqual(value, customPage.attributes[key])) {
        diffedValues[key] = value;
      }
    });

    setIsLoading(true);
    setFormStatus('disabled');
    setHasCTAMultilocError(false);
    setHasCTAUrlError(false);
    try {
      await updateCustomPage(customPageId, diffedValues);
      setIsLoading(false);
      setFormStatus('success');
    } catch (error) {
      const apiErrors = error.json.errors;
      if (apiErrors) {
        if (apiErrors['banner_cta_button_multiloc']) {
          setHasCTAMultilocError(true);
        }

        if (apiErrors['banner_cta_button_url']) {
          setHasCTAUrlError(true);
        }
      }
      setIsLoading(false);
      setFormStatus('error');
    }
  };

  const handleSignedOutMultilocHeaderOnChange = (
    signedOutHeaderMultiloc: Multiloc
  ) => {
    handleOnChange('banner_header_multiloc', signedOutHeaderMultiloc);
  };

  const handleSignedOutMultilocSubheaderOnChange = (
    signedOutSubheaderMultiloc: Multiloc
  ) => {
    handleOnChange('banner_subheader_multiloc', signedOutSubheaderMultiloc);
  };

  const handleOnBannerImageAdd = (newImageBase64: string) => {
    handleOnChange('header_bg', newImageBase64);
  };
  const handleOnBannerImageRemove = () => {
    handleOnChange('header_bg', null);
  };

  const handleOverlayColorOnChange = (color: string) => {
    handleOnChange('banner_overlay_color', color);
  };
  const handleOverlayOpacityOnChange = (opacity: number) => {
    handleOnChange('banner_overlay_opacity', opacity);
  };

  const handleLayoutOnChange = (bannerLayout: TCustomPageBannerLayout) => {
    handleOnChange('banner_layout', bannerLayout);
  };

  const handleCTAButtonTypeOnChange = (ctaType: TCustomPageCTAType) => {
    handleOnChange('banner_cta_button_type', ctaType);
  };

  const handleCTAButtonTextMultilocOnChange = (
    buttonTextMultiloc: Multiloc
  ) => {
    handleOnChange('banner_cta_button_multiloc', buttonTextMultiloc);
  };

  const handleCTAButtonUrlOnChange = (url: string) => {
    handleOnChange('banner_cta_button_url', url);
  };

  const handleOnChange = (key: keyof ICustomPageAttributes, value: unknown) => {
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
        <HelmetIntl title={messages.customPageMetaTitle} />
        <GenericHeroBannerForm
          onSave={handleSave}
          formStatus={formStatus}
          isLoading={isLoading}
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumb.linkTo,
            },
            {
              label: localize(customPage.attributes.title_multiloc),
              linkTo: `${PAGES_MENU_CUSTOM_PATH}/${customPageId}/content`,
            },
            { label: formatMessage(messages.heroBannerTitle) },
          ]}
          title={formatMessage(messages.heroBannerTitle)}
          setFormStatus={setFormStatus}
          layoutSettingFieldComponent={
            <LayoutSettingField
              bannerLayout={localSettings.banner_layout}
              onChange={handleLayoutOnChange}
            />
          }
          bannerImageFieldsComponent={
            <BannerImageFields
              bannerLayout={localSettings.banner_layout}
              bannerOverlayColor={localSettings.banner_overlay_color}
              bannerOverlayOpacity={localSettings.banner_overlay_opacity}
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
              bannerHeaderMultiloc={localSettings.banner_header_multiloc}
              bannerSubheaderMultiloc={localSettings.banner_subheader_multiloc}
              onHeaderChange={handleSignedOutMultilocHeaderOnChange}
              onSubheaderChange={handleSignedOutMultilocSubheaderOnChange}
              title={formatMessage(messages.bannerTextTitle)}
              inputLabelText={formatMessage(messages.bannerHeader)}
              subheaderInputLabelText={formatMessage(
                messages.bannerHeaderSubtitle
              )}
            />
          }
          ctaButtonFieldsComponent={
            <CTAButtonFields
              id="custom"
              currentCtaType={localSettings.banner_cta_button_type}
              ctaButtonMultiloc={localSettings.banner_cta_button_multiloc}
              ctaButtonUrl={localSettings.banner_cta_button_url}
              handleCTAButtonTypeOnChange={handleCTAButtonTypeOnChange}
              handleCTAButtonTextMultilocOnChange={
                handleCTAButtonTextMultilocOnChange
              }
              handleCTAButtonUrlOnChange={handleCTAButtonUrlOnChange}
              title={formatMessage(messages.buttonTitle)}
              hasCTAMultilocError={hasCTAMultilocError}
              hasCTAUrlError={hasCTAUrlError}
            />
          }
        />
      </>
    );
  }

  return null;
};

export default injectIntl(EditCustomPageHeroBannerForm);
