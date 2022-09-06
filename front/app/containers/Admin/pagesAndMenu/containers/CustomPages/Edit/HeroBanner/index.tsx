import React, { useState } from 'react';

import { useParams } from 'react-router-dom';
import useCustomPage from 'hooks/useCustomPage';
import { updateCustomPage } from 'services/customPages';
import GenericHeroBannerForm, {
  HeroBannerInputSettings,
} from '../../../GenericHeroBannerForm';
import { isNilOrError } from 'utils/helperUtils';
// change
import messages from '../../../GenericHeroBannerForm/messages';
import { forOwn, isEqual } from 'lodash-es';

import {
  pagesAndMenuBreadcrumb,
  homeBreadcrumb,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';
// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { ISubmitState } from 'components/admin/SubmitWrapper';

const EditCustomPageHeroBannerForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<ISubmitState>('disabled');

  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);

  if (isNilOrError(customPage)) {
    return null;
  }

  const { attributes } = customPage;

  const handleSave = async (newSettings: HeroBannerInputSettings) => {
    if (!newSettings) return;

    // necessary because the CTA module uses
    const mappedSettings = {
      ...newSettings,
      ...(newSettings.banner_cta_signed_out_url && {
        banner_cta_button_url: newSettings.banner_cta_signed_out_url,
      }),
      ...(newSettings.banner_cta_signed_out_type && {
        banner_cta_button_type: newSettings.banner_cta_signed_out_type,
      }),
      ...(newSettings.banner_cta_signed_out_text_multiloc && {
        banner_cta_button_multiloc:
          newSettings.banner_cta_signed_out_text_multiloc,
      }),
    };

    // only update the page settings if they have changed
    const diffedValues = {};
    forOwn(mappedSettings, (value, key) => {
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

  const mappedInputSettings = {
    banner_layout: attributes.banner_layout,
    banner_overlay_color: attributes.banner_overlay_color,
    banner_overlay_opacity: attributes.banner_overlay_opacity,
    banner_header_multiloc: attributes.banner_header_multiloc,
    banner_subheader_multiloc: attributes.banner_subheader_multiloc,
    header_bg: attributes.header_bg,
    banner_cta_signed_out_url: attributes.banner_cta_button_url,
    banner_cta_signed_out_text_multiloc: attributes.banner_cta_button_multiloc,
    banner_cta_signed_out_type: attributes.banner_cta_button_type,
  };

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
      inputSettings={mappedInputSettings}
      setFormStatus={setFormStatus}
      hideSignedInCTASettings
      hideSignedInHeaderField
      hideAvatarsFields
    />
  );
};

export default injectIntl(EditCustomPageHeroBannerForm);
