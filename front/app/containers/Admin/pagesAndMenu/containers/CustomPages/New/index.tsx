import React, { useState } from 'react';

// typings
import { Multiloc } from 'typings';

// form
import Feedback from 'components/HookForm/Feedback';
import { FormProvider, useForm } from 'react-hook-form';
import { SectionField } from 'components/admin/Section';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string } from 'yup';
import validateMultiloc from 'utils/yup/validateMultiloc';
import { slugRegEx } from 'utils/textUtils';
// import { handleHookFormSubmissionError } from 'utils/errorUtils';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import Button from 'components/UI/Button';
import Input from 'components/HookForm/Input';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { Box } from '@citizenlab/cl2-component-library';

// constants
import { pagesAndMenuBreadcrumb } from '../../../breadcrumbs';

// intl
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// services
import { createCustomPageStream } from 'services/customPages';

interface CreateCustomPageFormValues {
  title_multiloc: Multiloc;
  slug: string;
}

interface Props {
  defaultValues?: CreateCustomPageFormValues;
}

const CreateCustomPageHookForm = ({
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  // types still to change
  const [_error, setError] = useState({});
  const schema = object({
    title_multiloc: validateMultiloc(formatMessage(messages.multilocError)),
    slug: string()
      .matches(slugRegEx, formatMessage(messages.slugRegexError))
      .required(formatMessage(messages.slugRequiredError)),
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: CreateCustomPageFormValues) => {
    try {
      createCustomPageStream(formValues);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <SectionFormWrapper
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumb.linkTo,
            },
            {
              label: formatMessage(messages.createCustomPage),
            },
          ]}
          title={formatMessage(messages.pageTitle)}
          stickyMenuContents={
            <Button type="submit" processing={methods.formState.isSubmitting}>
              {formatMessage(messages.saveButton)}
            </Button>
          }
        >
          <SectionField>
            <Feedback successMessage={formatMessage(messages.pageTitle)} />
            <Box mb="20px">
              <InputMultilocWithLocaleSwitcher
                name="title_multiloc"
                label={formatMessage(messages.titleLabel)}
                type="text"
              />
            </Box>
            <Input
              label={formatMessage(messages.slugLabel)}
              labelTooltipText={formatMessage(messages.slugTooltip)}
              name="slug"
              type="text"
            />
          </SectionField>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default injectIntl(CreateCustomPageHookForm);
