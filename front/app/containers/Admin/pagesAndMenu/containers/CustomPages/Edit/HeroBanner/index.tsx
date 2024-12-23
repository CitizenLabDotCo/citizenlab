import React, { useEffect, useState } from 'react';

import { WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { CLErrors } from 'typings';

import { ICustomPageAttributes } from 'api/custom_pages/types';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';

import useLocalize from 'hooks/useLocalize';

import {
  pagesAndMenuBreadcrumb,
  pagesAndMenuBreadcrumbLinkTo,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';
import ShownOnPageBadge from 'containers/Admin/pagesAndMenu/components/ShownOnPageBadge';
import CTAButtonFields from 'containers/Admin/pagesAndMenu/containers/CustomPages/Edit/HeroBanner/CTAButtonFields';
import BannerHeaderFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerHeaderFields';
import BannerImageFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerImageFields';
import LayoutSettingField from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/LayoutSettingField';
import { adminCustomPageContentPath } from 'containers/Admin/pagesAndMenu/routes';

import { ISubmitState } from 'components/admin/SubmitWrapper';
import HelmetIntl from 'components/HelmetIntl';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError, isNil } from 'utils/helperUtils';

import GenericHeroBannerForm from '../../../GenericHeroBannerForm';
import messages from '../../../GenericHeroBannerForm/messages';

export type CustomPageBannerSettingKeyType = Extract<
  keyof ICustomPageAttributes,
  | 'banner_cta_button_multiloc'
  | 'banner_cta_button_url'
  | 'banner_cta_button_type'
>;

const EditCustomPageHeroBannerForm = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const { mutateAsync: updateCustomPage } = useUpdateCustomPage();
  const localize = useLocalize();
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLErrors | null>(null);

  const [formStatus, setFormStatus] = useState<ISubmitState>('enabled');
  const [localSettings, setLocalSettings] =
    useState<ICustomPageAttributes | null>(null);

  const { customPageId } = useParams() as { customPageId: string };
  const { data: customPage } = useCustomPageById(customPageId);

  useEffect(() => {
    if (!isNilOrError(customPage)) {
      setLocalSettings({
        ...customPage.data.attributes,
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
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      localSettings.header_bg?.large === null &&
      customPage.data.attributes.header_bg?.large === null
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
      await updateCustomPage({ id: customPageId, ...settingsToUpdate });
      setIsLoading(false);
      setFormStatus('success');
    } catch (error) {
      const apiErrors = error.errors;
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
    signedOutHeaderMultiloc: ICustomPageAttributes['banner_header_multiloc']
  ) => {
    handleOnChange('banner_header_multiloc', signedOutHeaderMultiloc);
  };

  const handleSignedOutMultilocSubheaderOnChange = (
    signedOutSubheaderMultiloc: ICustomPageAttributes['banner_subheader_multiloc']
  ) => {
    handleOnChange('banner_subheader_multiloc', signedOutSubheaderMultiloc);
  };

  const handleOnBannerImageAdd = (newImageBase64: string) => {
    handleOnChange('header_bg', newImageBase64);
  };
  const handleOnBannerImageRemove = () => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        header_bg: null,
        banner_overlay_color: null,
        banner_overlay_opacity: null,
      });
    }
  };

  const handleOnOverlayChange = (
    opacity: number | null,
    color: string | null
  ) => {
    if (!isNilOrError(localSettings)) {
      setFormStatus('enabled');

      setLocalSettings({
        ...localSettings,
        banner_overlay_color: color,
        banner_overlay_opacity: opacity,
      });
    }
  };

  const handleLayoutOnChange = (
    bannerLayout: ICustomPageAttributes['banner_layout']
  ) => {
    handleOnChange('banner_layout', bannerLayout);
  };

  const handleCTAButtonTypeOnChange = (
    ctaType: ICustomPageAttributes['banner_cta_button_type']
  ) => {
    handleOnChange('banner_cta_button_type', ctaType);
  };

  const handleCTAButtonTextMultilocOnChange = (
    buttonTextMultiloc: ICustomPageAttributes['banner_cta_button_multiloc']
  ) => {
    handleOnChange('banner_cta_button_multiloc', buttonTextMultiloc);
  };

  const handleCTAButtonUrlOnChange = (
    url: ICustomPageAttributes['banner_cta_button_url']
  ) => {
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
          linkToViewPage={`/pages/${customPage.data.attributes.slug}`}
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumbLinkTo,
            },
            {
              label: localize(customPage.data.attributes.title_multiloc),
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
              onAddImage={handleOnBannerImageAdd}
              onRemoveImage={handleOnBannerImageRemove}
              onOverlayChange={handleOnOverlayChange}
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
