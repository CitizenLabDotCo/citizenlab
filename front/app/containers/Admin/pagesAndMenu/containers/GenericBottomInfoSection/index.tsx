import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
// i18n
import { WrappedComponentProps } from 'react-intl';
import { useTheme } from 'styled-components';
// typings
import { Multiloc } from 'typings';
import { object } from 'yup';
// components
import { Box } from '@citizenlab/cl2-component-library';
// form
import { yupResolver } from '@hookform/resolvers/yup';
// services and hooks
import { ICustomPageData } from 'services/customPages';
import { IHomepageSettingsData } from 'services/homepageSettings';
import { injectIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
// utils
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import ShownOnPageBadge from '../../components/ShownOnPageBadge';
import Feedback from 'components/HookForm/Feedback';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import Button from 'components/UI/Button';
// constants
import { pagesAndMenuBreadcrumb } from '../../breadcrumbs';
import ViewCustomPageButton from '../CustomPages/Edit/ViewCustomPageButton';
import messages from './messages';

interface Props {
  pageData: IHomepageSettingsData | ICustomPageData;
  updatePage: (data: {
    bottom_info_section_multiloc: Multiloc;
  }) => Promise<any>;
  updatePageAndEnableSection: (data: {
    bottom_info_section_multiloc: Multiloc;
  }) => Promise<any>;
  breadcrumbs: TBreadcrumbs;
  linkToViewPage?: string;
}

interface FormValues {
  bottom_info_section_multiloc: Multiloc;
}

const GenericBottomInfoSection = ({
  pageData,
  updatePage,
  updatePageAndEnableSection,
  breadcrumbs,
  intl: { formatMessage },
  linkToViewPage,
}: WrappedComponentProps & Props) => {
  const theme = useTheme();

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await updatePage(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const onFormSubmitAndEnable = async (formValues: FormValues) => {
    if (!updatePageAndEnableSection) return;

    try {
      await updatePageAndEnableSection(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const schema = object({
    bottom_info_section_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.blankDescriptionError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      bottom_info_section_multiloc:
        pageData.attributes.bottom_info_section_multiloc,
    },
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <SectionFormWrapper
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumb.linkTo,
            },
            ...breadcrumbs,
            { label: formatMessage(messages.pageTitle) },
          ]}
          title={formatMessage(messages.pageTitle)}
          badge={
            <ShownOnPageBadge
              shownOnPage={pageData.attributes.bottom_info_section_enabled}
            />
          }
          rightSideCTA={
            linkToViewPage ? (
              <ViewCustomPageButton linkTo={linkToViewPage} />
            ) : null
          }
        >
          <Feedback successMessage={formatMessage(messages.messageSuccess)} />
          <Box maxWidth={`${theme.maxPageWidth - 100}px`} mb="24px">
            <QuillMultilocWithLocaleSwitcher
              name="bottom_info_section_multiloc"
              label={formatMessage(messages.contentEditorTitle)}
              withCTAButton
            />
          </Box>
          <Box display="flex">
            <Button
              type="submit"
              processing={methods.formState.isSubmitting}
              data-cy={`e2e-bottom-info-section-submit`}
            >
              {formatMessage(messages.saveButton)}
            </Button>
            {!pageData.attributes.bottom_info_section_enabled && (
              <Button
                ml="30px"
                type="button"
                buttonStyle="primary-outlined"
                onClick={methods.handleSubmit(onFormSubmitAndEnable)}
                processing={methods.formState.isSubmitting}
                data-cy={`e2e-bottom-info-section-secondary-submit`}
              >
                {formatMessage(messages.saveAndEnableButton)}
              </Button>
            )}
          </Box>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default injectIntl(GenericBottomInfoSection);
