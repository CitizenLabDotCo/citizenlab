import React, { useState } from 'react';

// form
import Feedback from 'components/HookForm/Feedback';
import { FormProvider, useForm } from 'react-hook-form';
import { SectionField } from 'components/admin/Section';
import { yupResolver } from '@hookform/resolvers/yup';
// import { object, string } from 'yup';
import { object } from 'yup';
import validateMultiloc from 'utils/yup/validateMultiloc';
// import { slugRegEx } from 'utils/textUtils';
// import { handleHookFormSubmissionError } from 'utils/errorUtils';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import Button from 'components/UI/Button';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import SlugInput from 'components/HookForm/SlugInput';
import { Box } from '@citizenlab/cl2-component-library';

// intl
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// services
import { createCustomPageStream } from 'services/customPages';

// utils
import clHistory from 'utils/cl-router/history';

// types
import { Multiloc } from 'typings';

interface FormValues {
  title_multiloc: Multiloc;
  slug?: string;
}

interface Props {
  defaultValues?: FormValues;
  hideSlugInput?: boolean;
}

const CustomPageSettingsForm = ({
  defaultValues,
  intl: { formatMessage },
  hideSlugInput = false,
}: Props & InjectedIntlProps) => {
  const [_titleErrors, _setTitleErrors] = useState<Multiloc>({});
  // types still to change
  const [_error, setError] = useState({});
  const schema = object({
    title_multiloc: validateMultiloc(
      formatMessage(messages.titleMultilocError)
    ),
    // slug: string()
    // .matches(slugRegEx, formatMessage(messages.slugRegexError))
    // .required(formatMessage(messages.slugRequiredError)),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });
  const slug = methods.watch('slug');

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      const { data } = await createCustomPageStream(formValues);
      clHistory.push(`/admin/pages-menu/custom/${data.id}/content`);
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
            {!hideSlugInput && (
              <SlugInput slug={slug} pathnameWithoutSlug="pages" />
            )}
          </SectionField>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default injectIntl(CustomPageSettingsForm);
