import React, { useState, useEffect } from 'react';
import { useTheme } from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import Error from 'components/UI/Error';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import sectionToggleMessages from '../../components/SectionToggle/messages';

// typings
import { Multiloc, CLError } from 'typings';

// constants
import { pagesAndMenuBreadcrumb } from '../../breadcrumbs';

// services and hooks
import { ICustomPageData } from 'services/customPages';
import { IHomepageSettingsData } from 'services/homepageSettings';

// utils
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

interface Props {
  pageData: IHomepageSettingsData | ICustomPageData;
  updatePage: (data: { top_info_section_multiloc: Multiloc }) => Promise<any>;
  breadcrumbs: TBreadcrumbs;
}

const GenericTopInfoSection = ({
  pageData,
  updatePage,
  breadcrumbs,
  intl: { formatMessage },
}: InjectedIntlProps & Props) => {
  const theme: any = useTheme();

  const [topInfoSectionMultiloc, setTopInfoSectionMultiloc] = useState<
    Multiloc | null | undefined
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);
  const [formStatus, setFormStatus] = useState<ISubmitState>('disabled');

  useEffect(() => {
    if (!isNilOrError(pageData)) {
      setTopInfoSectionMultiloc(pageData.attributes.top_info_section_multiloc);
    }
  }, [pageData]);

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
        await updatePage({
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
        ...breadcrumbs,
        { label: formatMessage(messages.topInfoPageTitle) },
      ]}
      title={formatMessage(messages.topInfoPageTitle)}
    >
      <Box maxWidth={`${theme.maxPageWidth - 100}px`} mb="24px">
        <QuillMultilocWithLocaleSwitcher
          id="custom-section"
          label={formatMessage(messages.topInfoContentEditorTitle)}
          labelTooltipText={formatMessage(
            sectionToggleMessages.topInfoSectionTooltip
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
      />
    </SectionFormWrapper>
  );
};

export default injectIntl(GenericTopInfoSection);
