import React, { useState } from 'react';
import { Multiloc } from 'typings';

// form
import Feedback from 'components/HookForm/Feedback';
import { FormProvider, useForm } from 'react-hook-form';
import { SectionField } from 'components/admin/Section';
import { yupResolver } from '@hookform/resolvers/yup';
import { object } from 'yup';
import validateMultiloc from 'utils/yup/validateMultiloc';
// import { handleHookFormSubmissionError } from 'utils/errorUtils';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import Button from 'components/UI/Button';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { Box } from '@citizenlab/cl2-component-library';

// intl
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// services
import { createCustomPageStream } from 'services/customPages';

interface CreateCustomPageFormValues {
  title_multiloc: Multiloc;
}

interface Props {}

const CustomPageSettingsForm = ({
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  // types still to change
  const [_error, setError] = useState({});
  const schema = object({
    title_multiloc: validateMultiloc(
      formatMessage(messages.titleMultilocError)
    ),
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
          stickyMenuContents={
            <Button type="submit" processing={methods.formState.isSubmitting}>
              {formatMessage(messages.saveButton)}
            </Button>
          }
        >
          <SectionField>
            <Feedback
              successMessage={formatMessage(messages.newCustomPagePageTitle)}
            />
            <Box mb="20px">
              <InputMultilocWithLocaleSwitcher
                name="title_multiloc"
                label={formatMessage(messages.titleLabel)}
                type="text"
              />
            </Box>
          </SectionField>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default injectIntl(CustomPageSettingsForm);
