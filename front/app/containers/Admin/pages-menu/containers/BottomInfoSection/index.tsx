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

const BottomInfoSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const homepageSettings = useHomepageSettings();
  const theme: any = useTheme();

  const [bottomInfoSectionMultilocState, setBottomInfoSectionMultilocState] =
    useState<Multiloc | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);
  const [formStatus, setFormStatus] = useState<ISubmitState>('disabled');

  useEffect(() => {
    if (!isNilOrError(homepageSettings)) {
      setBottomInfoSectionMultilocState(
        homepageSettings.data.attributes.bottom_info_section_multiloc
      );
    }
  }, [homepageSettings]);

  const handleCustomSectionMultilocOnChange = (
    bottomInfoMultiloc: Multiloc
  ) => {
    if (formStatus !== 'enabled') {
      setFormStatus('enabled');
    }

    setBottomInfoSectionMultilocState(bottomInfoMultiloc);

    if (isEmptyMultiloc(bottomInfoMultiloc)) {
      setFormStatus('disabled');
    }
  };

  const onSave = async () => {
    setIsLoading(true);
    setFormStatus('disabled');
    try {
      if (bottomInfoSectionMultilocState) {
        await updateHomepageSettings({
          bottom_info_section_multiloc: bottomInfoSectionMultilocState,
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
        { label: formatMessage(messages.pageTitle) },
      ]}
      title={formatMessage(messages.pageTitle)}
    >
      <Box maxWidth={`${theme.maxPageWidth - 100}px`} mb="24px">
        <QuillMultilocWithLocaleSwitcher
          id="custom-section"
          label={formatMessage(messages.contentEditorTitle)}
          labelTooltipText={formatMessage(
            homepageMessages.bottomInfoSectionTooltip
          )}
          valueMultiloc={bottomInfoSectionMultilocState}
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
          buttonSave: messages.saveButton,
          buttonSuccess: messages.buttonSuccess,
          messageSuccess: messages.messageSuccess,
          messageError: messages.error,
        }}
      />
    </SectionFormWrapper>
  );
};

export default injectIntl(BottomInfoSection);
