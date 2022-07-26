import React, { useState, useEffect } from 'react';
import { useTheme } from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import Error from 'components/UI/Error';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import homepageMessages from '../../EditHomepage/messages';

// typings
import { Multiloc, CLError } from 'typings';

// constants
import { pagesAndMenuBreadcrumb, homeBreadcrumb } from '../../breadcrumbs';

// services and hooks
import useHomepageSettings from 'hooks/useHomepageSettings';
import { updateHomepageSettings } from 'services/homepageSettings';

// utils
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

const TopInfoSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const homepageSettings = useHomepageSettings();
  const theme: any = useTheme();

  const [topInfoSectionMultiloc, setTopInfoSectionMultiloc] = useState<
    Multiloc | null | undefined
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);
  const [formStatus, setFormStatus] = useState<ISubmitState>('disabled');

  useEffect(() => {
    if (!isNilOrError(homepageSettings)) {
      setTopInfoSectionMultiloc(
        homepageSettings.data.attributes.top_info_section_multiloc
      );
    }
  }, [homepageSettings]);

  const handleCustomSectionMultilocOnChange = (
    multilocFromEditor: Multiloc
  ) => {
    if (formStatus !== 'enabled') {
      setFormStatus('enabled');
    }

    setTopInfoSectionMultiloc(multilocFromEditor);

    if (isEmptyMultiloc(multilocFromEditor)) {
      setFormStatus('disabled');
    }
  };

  const onSave = async () => {
    setIsLoading(true);
    setFormStatus('disabled');
    try {
      if (topInfoSectionMultiloc) {
        await updateHomepageSettings({
          top_info_section_multiloc: topInfoSectionMultiloc,
        });
      }
      setIsLoading(false);
      setFormStatus('success');
    } catch (error) {
      setIsLoading(false);
      setFormStatus('error');
      if (isCLErrorJSON(error)) {
        setApiErrors(error.json.errors);
      } else {
        setApiErrors(error);
      }
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
        { label: formatMessage(messages.topInfoPageTitle) },
      ]}
      title={formatMessage(messages.topInfoPageTitle)}
    >
      <Box maxWidth={`${theme.maxPageWidth - 100}px`} mb="24px">
        <QuillMultilocWithLocaleSwitcher
          id="custom-section"
          label={formatMessage(messages.topInfoContentEditorTitle)}
          labelTooltipText={formatMessage(
            homepageMessages.topInfoSectionTooltip
          )}
          valueMultiloc={topInfoSectionMultiloc}
          onChange={handleCustomSectionMultilocOnChange}
          withCTAButton
        />
      </Box>
      <Error apiErrors={apiErrors} />
      <SubmitWrapper
        status={formStatus}
        buttonStyle="primary"
        loading={isLoading}
        onClick={onSave}
        messages={{
          buttonSave: messages.topInfoSaveButton,
          buttonSuccess: messages.topInfoButtonSuccess,
          messageSuccess: messages.topInfoMessageSuccess,
          messageError: messages.topInfoError,
        }}
        testId="top-info-section-submit"
      />
    </SectionFormWrapper>
  );
};

export default injectIntl(TopInfoSection);
