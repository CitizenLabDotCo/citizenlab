import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useCustomPage from 'hooks/useCustomPage';
import { updateCustomPage, ICustomPageAttributes } from 'services/customPages';
import GenericHeroBannerForm from '../../../GenericHeroBannerForm';
import { isNilOrError } from 'utils/helperUtils';
import messages from '../../../GenericHeroBannerForm/messages';
import { forOwn, isEqual } from 'lodash-es';
import BannerHeaderFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerHeaderFields';
import BannerImageFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerImageFields';
import {
  pagesAndMenuBreadcrumb,
  homeBreadcrumb,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';
// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { ISubmitState } from 'components/admin/SubmitWrapper';
import { Multiloc } from 'typings';

const EditCustomPageHeroBannerForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const [isLoading, setIsLoading] = useState(false);
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
    try {
      await updateCustomPage(customPageId, diffedValues);
      setIsLoading(false);
      setFormStatus('success');
    } catch (error) {
      setIsLoading(false);
      setFormStatus('error');
    }
  };

  const handleHeaderSignedOutMultilocOnChange = (
    signedOutHeaderMultiloc: Multiloc
  ) => {
    handleOnChange('banner_header_multiloc', signedOutHeaderMultiloc);
  };

  const handleSubheaderSignedOutMultilocOnChange = (
    signedOutHeaderMultiloc: Multiloc
  ) => {
    handleOnChange('banner_subheader_multiloc', signedOutHeaderMultiloc);
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
            label: formatMessage(homeBreadcrumb.label),
            linkTo: homeBreadcrumb.linkTo,
          },
          { label: formatMessage(messages.heroBannerTitle) },
        ]}
        title={formatMessage(messages.heroBannerTitle)}
        setFormStatus={setFormStatus}
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
            onHeaderChange={handleHeaderSignedOutMultilocOnChange}
            onSubheaderChange={handleSubheaderSignedOutMultilocOnChange}
            titleMessage={messages.bannerTextTitle}
            inputLabelMessage={messages.bannerHeaderSignedOut}
          />
        }
      />
    );
  }

  return null;
};

export default injectIntl(EditCustomPageHeroBannerForm);
