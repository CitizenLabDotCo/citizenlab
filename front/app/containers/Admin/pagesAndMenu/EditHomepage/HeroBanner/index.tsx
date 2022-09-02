import React, { useState } from 'react';

import useHomepageSettings from 'hooks/useHomepageSettings';
import {
  IHomepageSettingsAttributes,
  updateHomepageSettings,
} from 'services/homepageSettings';

import GenericHeroBannerForm, {
  HeroBannerInputSettings,
} from '../../containers/GenericHeroBannerForm';
import { isNilOrError } from 'utils/helperUtils';
// change
import messages from '../../containers/GenericHeroBannerForm/messages'

import { forOwn, isEqual } from 'lodash-es';

import {
  pagesAndMenuBreadcrumb,
  homeBreadcrumb,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';
// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { ISubmitState } from 'components/admin/SubmitWrapper';

const EditHomepageHeroBannerForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<ISubmitState>('disabled');

  const homepageSettings = useHomepageSettings();

  if (isNilOrError(homepageSettings)) {
    return null;
  }

  const { attributes } = homepageSettings.data;

  const handleSave = async (newSettings: HeroBannerInputSettings) => {
    if (!newSettings) return;

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

  //
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
    banner_cta_signed_out_text_multiloc: attributes.banner_cta_signed_out_text_multiloc,
    banner_cta_signed_out_url: attributes.banner_cta_signed_out_url,
    banner_cta_signed_in_type: attributes.banner_cta_signed_in_type,
    banner_cta_signed_in_text_multiloc: attributes.banner_cta_signed_in_text_multiloc,
    banner_cta_signed_in_url: attributes.banner_cta_signed_in_url,

  };

  return (
    <GenericHeroBannerForm
      type="homePage"
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
    />
  );
};

export default injectIntl(EditHomepageHeroBannerForm);
