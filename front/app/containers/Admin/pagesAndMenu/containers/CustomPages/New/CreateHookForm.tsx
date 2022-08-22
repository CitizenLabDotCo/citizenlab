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

// styling
import styled from 'styled-components';

// constants
import { pagesAndMenuBreadcrumb } from '../../../breadcrumbs';

// intl
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

export interface CreateCustomPageFormValues {
  title_multiloc: Multiloc;
  slug: string;
}

const StyledMultilocInput = styled(InputMultilocWithLocaleSwitcher)`
  margin-bottom: 20px;
`;

type CreateCustomPageFormProps = {
  onSubmit: (formValues: CreateCustomPageFormValues) => void | Promise<void>;
  defaultValues?: CreateCustomPageFormValues;
} & InjectedIntlProps;

const CreateCustomPageHookForm = ({
  onSubmit,
  defaultValues,
  intl: { formatMessage },
}: CreateCustomPageFormProps) => {
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
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: CreateCustomPageFormValues) => {
    try {
      await onSubmit(formValues);
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
            <StyledMultilocInput
              name="title_multiloc"
              label={formatMessage(messages.titleLabel)}
              type="text"
              labelTooltipText={formatMessage(messages.titleTooltip)}
            />
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
