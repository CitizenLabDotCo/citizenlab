import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { RouteType } from 'routes';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';
import { object } from 'yup';

import { ICustomPageData } from 'api/custom_pages/types';

import HelmetIntl from 'components/HelmetIntl';
import Feedback from 'components/HookForm/Feedback';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import {
  pagesAndMenuBreadcrumb,
  pagesAndMenuBreadcrumbLinkTo,
} from '../../breadcrumbs';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import ShownOnPageBadge from '../../components/ShownOnPageBadge';
import ViewCustomPageButton from '../CustomPages/Edit/ViewCustomPageButton';

import messages from './messages';

interface Props {
  pageData: ICustomPageData;
  updatePage: (data: { top_info_section_multiloc: Multiloc }) => Promise<any>;
  updatePageAndEnableSection: (data: {
    top_info_section_multiloc: Multiloc;
  }) => Promise<any>;
  breadcrumbs: TBreadcrumbs;
  linkToViewPage?: RouteType;
}

interface FormValues {
  top_info_section_multiloc: Multiloc;
}

const GenericTopInfoSection = ({
  pageData,
  updatePage,
  updatePageAndEnableSection,
  breadcrumbs,
  linkToViewPage,
}: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await updatePage(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const onFormSubmitAndEnable = async (formValues: FormValues) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!updatePageAndEnableSection) return;

    try {
      await updatePageAndEnableSection(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const schema = object({
    top_info_section_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.missingOneLocaleError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      top_info_section_multiloc: pageData.attributes.top_info_section_multiloc,
    },
    resolver: yupResolver(schema),
  });

  return (
    <div data-cy="e2e-top-info-form">
      <HelmetIntl title={messages.topInfoMetaTitle} />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onFormSubmit)}>
          <SectionFormWrapper
            badge={
              <ShownOnPageBadge
                shownOnPage={pageData.attributes.top_info_section_enabled}
              />
            }
            breadcrumbs={[
              {
                label: formatMessage(pagesAndMenuBreadcrumb.label),
                linkTo: pagesAndMenuBreadcrumbLinkTo,
              },
              ...breadcrumbs,
              { label: formatMessage(messages.topInfoPageTitle) },
            ]}
            title={formatMessage(messages.topInfoPageTitle)}
            rightSideCTA={
              linkToViewPage ? (
                <ViewCustomPageButton linkTo={linkToViewPage} />
              ) : null
            }
          >
            <Feedback
              successMessage={formatMessage(messages.topInfoMessageSuccess)}
            />
            <Box maxWidth={`${theme.maxPageWidth - 100}px`} mb="24px">
              <QuillMultilocWithLocaleSwitcher
                name="top_info_section_multiloc"
                label={formatMessage(messages.topInfoContentEditorTitle)}
                withCTAButton
              />
            </Box>
            <Box display="flex">
              <ButtonWithLink
                type="submit"
                processing={methods.formState.isSubmitting}
                data-cy={`e2e-top-info-section-submit`}
              >
                {formatMessage(messages.topInfoSaveButton)}
              </ButtonWithLink>
              {!pageData.attributes.top_info_section_enabled && (
                <ButtonWithLink
                  ml="30px"
                  type="button"
                  buttonStyle="primary-outlined"
                  onClick={methods.handleSubmit(onFormSubmitAndEnable)}
                  processing={methods.formState.isSubmitting}
                  data-cy={`e2e-top-info-section-secondary-submit`}
                >
                  {formatMessage(messages.topInfoSaveAndEnableButton)}
                </ButtonWithLink>
              )}
            </Box>
          </SectionFormWrapper>
        </form>
      </FormProvider>
    </div>
  );
};

export default GenericTopInfoSection;
