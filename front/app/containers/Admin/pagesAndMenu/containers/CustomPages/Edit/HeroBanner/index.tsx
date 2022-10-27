import React, { useEffect, useState } from 'react';

// types
import { ISubmitState } from 'components/admin/SubmitWrapper';
import { CLErrors, Multiloc } from 'typings';

// components
import CTAButtonFields from 'containers/Admin/pagesAndMenu/containers/CustomPages/Edit/HeroBanner/CTAButtonFields';
import BannerHeaderFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerHeaderFields';
import BannerImageFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerImageFields';
import LayoutSettingField from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/LayoutSettingField';
import GenericHeroBannerForm from '../../../GenericHeroBannerForm';
import ShownOnPageBadge from 'containers/Admin/pagesAndMenu/components/ShownOnPageBadge';

// utils
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
import { isNilOrError, isNil } from 'utils/helperUtils';

// resources
import { adminCustomPageContentPath } from 'containers/Admin/pagesAndMenu/routes';
import { WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import useCustomPage from 'hooks/useCustomPage';
import {
  ICustomPageAttributes,
  TCustomPageBannerLayout,
  TCustomPageCTAType,
  updateCustomPage,
} from 'services/customPages';

// i18n
import messages from '../../../GenericHeroBannerForm/messages';
import HelmetIntl from 'components/HelmetIntl';
import useLocalize from 'hooks/useLocalize';
import { injectIntl } from 'utils/cl-intl';

export type CustomPageBannerSettingKeyType = Extract<
  keyof ICustomPageAttributes,
  | 'banner_cta_button_multiloc'
  | 'banner_cta_button_url'
  | 'banner_cta_button_type'
>;

const EditCustomPageHeroBannerForm = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const localize = useLocalize();
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLErrors | null>(null);

  const [formStatus, setFormStatus] = useState<ISubmitState>('enabled');
  const [localSettings, setLocalSettings] =
    useState<ICustomPageAttributes | null>(null);

  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage({ customPageId });

  useEffect(() => {
    if (!isNilOrError(customPage)) {
      setLocalSettings({
        ...customPage.attributes,
      });
    }
  }, [customPage]);

  if (isNilOrError(customPage)) {
    return null;
  }

  const saveCustomPage = async (enableHeroBanner = false) => {
    if (isNil(localSettings)) {
      return;
    }

    // if the header_bg is null, the user has removed it, and
    // the form cannot be saved
    if (localSettings.header_bg == null) {
      setFormStatus('error');
      return;
    }

    // this is a hack. If both objects have a "large" key under header_bg with a null value,
    // it means the image was initialized (with the large: null value) on the server
    // and hasn't been updated by the user locally. we set the whole value to null
    // to trigger the FE error message. the triple equals is on purpose, we want to
    // only trigger this when the value is explicitly null and not undefined
    if (
      localSettings.header_bg?.large === null &&
      customPage.attributes.header_bg?.large === null
    ) {
      setLocalSettings({
        ...localSettings,
        header_bg: null,
      });
      setFormStatus('error');
      return;
    }

    const settingsToUpdate = {
      ...localSettings,
    };

    if (enableHeroBanner) {
      settingsToUpdate.banner_enabled = true;
    }

    setIsLoading(true);
    setApiErrors(null);
    try {
      await updateCustomPage(customPageId, settingsToUpdate);
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

  const handleSave = () => {
    saveCustomPage(false);
  };

  const handleSaveAndEnable = () => {
    saveCustomPage(true);
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
          onSaveAndEnable={
            // undefined to match type for optional prop.
            // only show secondary button if banner is not enabled
            localSettings.banner_enabled ? undefined : handleSaveAndEnable
          }
          badge={
            <ShownOnPageBadge shownOnPage={localSettings.banner_enabled} />
          }
          formStatus={formStatus}
          isLoading={isLoading}
          linkToViewPage={`/pages/${customPage.attributes.slug}`}
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumb.linkTo,
            },
            {
              label: localize(customPage.attributes.title_multiloc),
              linkTo: adminCustomPageContentPath(customPageId),
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
              currentCtaType={localSettings.banner_cta_button_type}
              ctaButtonMultiloc={localSettings.banner_cta_button_multiloc}
              ctaButtonUrl={localSettings.banner_cta_button_url}
              handleCTAButtonTypeOnChange={handleCTAButtonTypeOnChange}
              handleCTAButtonTextMultilocOnChange={
                handleCTAButtonTextMultilocOnChange
              }
              handleCTAButtonUrlOnChange={handleCTAButtonUrlOnChange}
              apiErrors={apiErrors}
              buttonTextMultilocFieldName="banner_cta_button_multiloc"
              buttonUrlFieldName="banner_cta_button_url"
            />
          }
        />
      </>
    );
  }

  return null;
};

export default injectIntl(EditCustomPageHeroBannerForm);
