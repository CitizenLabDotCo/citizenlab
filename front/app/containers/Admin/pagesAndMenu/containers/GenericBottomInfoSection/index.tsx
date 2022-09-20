import React from 'react';
import { useTheme } from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import Button from 'components/UI/Button';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object } from 'yup';
import Feedback from 'components/HookForm/Feedback';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { Multiloc } from 'typings';

// constants
import { pagesAndMenuBreadcrumb } from '../../breadcrumbs';

// services and hooks
import { IHomepageSettingsData } from 'services/homepageSettings';
import { ICustomPageData } from 'services/customPages';

// utils
import validateMultiloc from 'utils/yup/validateMultiloc';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

interface Props {
  pageData: IHomepageSettingsData | ICustomPageData;
  updatePage: (data: {
    bottom_info_section_multiloc: Multiloc;
  }) => Promise<any>;
  breadcrumbs: TBreadcrumbs;
}

interface FormValues {
  bottom_info_section_multiloc: Multiloc;
}

const GenericBottomInfoSection = ({
  pageData,
  updatePage,
  breadcrumbs,
  intl: { formatMessage },
}: InjectedIntlProps & Props) => {
  const theme: any = useTheme();

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await updatePage(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const schema = object({
    bottom_info_section_multiloc: validateMultiloc(
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
            <Button type="submit" processing={methods.formState.isSubmitting}>
              {formatMessage(messages.saveButton)}
            </Button>
          </Box>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default injectIntl(GenericBottomInfoSection);
