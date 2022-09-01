import React, { useState } from 'react';


import useHomepageSettings from 'hooks/useHomepageSettings';
import {
    IHomepageSettingsAttributes,
    updateHomepageSettings,
  } from 'services/homepageSettings';

import GenericHeroBannerForm, { HeroBannerInputSettings } from '../../containers/GenericHeroBannerForm';
import { isNilOrError } from 'utils/helperUtils';
// change
import messages from 'containers/Admin/pagesAndMenu/containers/HeroBanner/messages';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import { forOwn, isEqual } from 'lodash-es';

import {
  pagesAndMenuBreadcrumb,
  homeBreadcrumb,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';
// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';

const EditHomepageHeroBannerForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stateFromForm, setStateFromForm] =
    useState<HeroBannerInputSettings | null>(null);
  const [formStatus, setFormStatus] = useState<ISubmitState>('disabled');
  
  const homepageSettings = useHomepageSettings();

  if (isNilOrError(homepageSettings)) {
    return null;
  }

  const { attributes } = homepageSettings.data;
  const updateStateFromForm = (formState: HeroBannerInputSettings) => {
    setStateFromForm(formState);
  };

  const handleSave = async () => {
    if (!stateFromForm) return;

    const propsMappedToHomepageSettingsNames: Partial<IHomepageSettingsAttributes> = {
        banner_signed_out_header_overlay_opacity: stateFromForm.banner_overlay_opacity,
        banner_signed_out_header_overlay_color: stateFromForm.banner_overlay_color,
        banner_signed_out_header_multiloc: stateFromForm.banner_header_multiloc,
        banner_signed_out_subheader_multiloc: stateFromForm.banner_subheader_multiloc,
        // the rest are the same as used in the form
        ...stateFromForm,
    }

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

  return (
    <SectionFormWrapper
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
      stickyMenuContents={
        <SubmitWrapper
          status={formStatus}
          buttonStyle="primary"
          loading={isLoading}
          onClick={handleSave}
          messages={{
            buttonSave: messages.heroBannerSaveButton,
            buttonSuccess: messages.heroBannerButtonSuccess,
            messageSuccess: messages.heroBannerMessageSuccess,
            messageError: messages.heroBannerError,
          }}
        />
      }
    >
      <GenericHeroBannerForm
        type="customPage"
        banner_layout={attributes.banner_layout}
        banner_overlay_color={attributes.banner_signed_out_header_overlay_color}
        banner_overlay_opacity={attributes.banner_signed_out_header_overlay_opacity}
        banner_header_multiloc={attributes.banner_signed_out_header_multiloc}
        banner_subheader_multiloc={attributes.banner_signed_out_header_multiloc}
        banner_signed_in_header_multiloc={attributes.banner_signed_in_header_multiloc}
        banner_avatars_enabled={attributes.banner_avatars_enabled}
        header_bg={attributes.header_bg}
        updateStateFromForm={updateStateFromForm}
        setFormStatus={setFormStatus}
      />
    </SectionFormWrapper>
  );
};

export default injectIntl(EditHomepageHeroBannerForm);
