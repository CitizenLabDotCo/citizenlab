import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useCustomPage from 'hooks/useCustomPage';
import { updateCustomPage, ICustomPageAttributes } from 'services/customPages';
import GenericHeroBannerForm from '../../../GenericHeroBannerForm';
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

  const { attributes } = customPage;

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
      setFormStatus={setFormStatus}
      
    />
  );
};

export default injectIntl(EditCustomPageHeroBannerForm);

export interface CustomPageHeroBannerInputSettings {
  banner_layout: ICustomPageAttributes['banner_layout'];
  banner_overlay_opacity: ICustomPageAttributes['banner_overlay_opacity'];
  banner_overlay_color: ICustomPageAttributes['banner_overlay_color'];
  banner_header_multiloc: ICustomPageAttributes['banner_header_multiloc'];
  banner_subheader_multiloc: ICustomPageAttributes['banner_header_multiloc'];
  header_bg: ICustomPageAttributes['header_bg'];
}
