import React, { useState } from 'react';

import { useParams } from 'react-router-dom';
import useCustomPage from 'hooks/useCustomPage';
import { updateCustomPage } from 'services/customPages';
import GenericHeroBannerForm, {
  HeroBannerInputSettings,
} from '../../../GenericHeroBannerForm';
import { isNilOrError } from 'utils/helperUtils';
// change
import messages from '../../../HeroBanner/messages';
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
    // only update the page settings if they have changed
    const diffedValues = {};
    forOwn(newSettings, (value, key) => {
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

  return (
    <GenericHeroBannerForm
      onSave={handleSave}
      type="customPage"
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
      banner_layout={attributes.banner_layout}
      banner_overlay_color={attributes.banner_overlay_color}
      banner_overlay_opacity={attributes.banner_overlay_opacity}
      banner_header_multiloc={attributes.banner_header_multiloc}
      banner_subheader_multiloc={attributes.banner_subheader_multiloc}
      header_bg={attributes.header_bg}
      setFormStatus={setFormStatus}
    />
  );
};

export default injectIntl(EditCustomPageHeroBannerForm);
