import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { WrappedComponentProps } from 'react-intl';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';
import { object } from 'yup';

import { ICustomPageData } from 'api/custom_pages/types';

import Feedback from 'components/HookForm/Feedback';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { injectIntl } from 'utils/cl-intl';
import { type TypedLinkProps } from 'utils/cl-router/Link';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import {
  pagesAndMenuBreadcrumb,
  pagesAndMenuBreadcrumbLink,
} from '../../breadcrumbs';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import ShownOnPageBadge from '../../components/ShownOnPageBadge';
import ViewCustomPageButton from '../CustomPages/Edit/ViewCustomPageButton';

import messages from './messages';

interface Props {
  pageData: ICustomPageData;
  updatePage: (data: {
    bottom_info_section_multiloc: Multiloc;
  }) => Promise<any>;
  updatePageAndEnableSection: (data: {
    bottom_info_section_multiloc: Multiloc;
  }) => Promise<any>;
  breadcrumbs: TBreadcrumbs;
  viewPageLink?: TypedLinkProps;
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
  viewPageLink,
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
              link: pagesAndMenuBreadcrumbLink,
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
            viewPageLink ? <ViewCustomPageButton {...viewPageLink} /> : null
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
            <ButtonWithLink
              type="submit"
              processing={methods.formState.isSubmitting}
              data-cy={`e2e-bottom-info-section-submit`}
            >
              {formatMessage(messages.saveButton)}
            </ButtonWithLink>
            {!pageData.attributes.bottom_info_section_enabled && (
              <ButtonWithLink
                ml="30px"
                type="button"
                buttonStyle="primary-outlined"
                onClick={methods.handleSubmit(onFormSubmitAndEnable)}
                processing={methods.formState.isSubmitting}
                data-cy={`e2e-bottom-info-section-secondary-submit`}
              >
                {formatMessage(messages.saveAndEnableButton)}
              </ButtonWithLink>
            )}
          </Box>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default injectIntl(GenericBottomInfoSection);
