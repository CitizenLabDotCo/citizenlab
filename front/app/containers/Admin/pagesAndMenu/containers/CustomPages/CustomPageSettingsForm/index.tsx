import React, { useState } from 'react';

// form
import { yupResolver } from '@hookform/resolvers/yup';
import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import { FormProvider, useForm } from 'react-hook-form';
import { slugRegEx } from 'utils/textUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';
import { object, string } from 'yup';
// import { handleHookFormSubmissionError } from 'utils/errorUtils';

// components
import { Box } from '@citizenlab/cl2-component-library';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import SlugInput from 'components/HookForm/SlugInput';
import Button from 'components/UI/Button';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';

// utils
import { handleHookFormSubmissionError } from 'utils/errorUtils';

// intl
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// types
import { Multiloc } from 'typings';

export interface FormValues {
  title_multiloc: Multiloc;
  nav_bar_item_title_multiloc?: Multiloc;
  slug?: string;
}

type TMode = 'new' | 'edit';
interface Props {
  defaultValues?: FormValues;
  showNavBarItemTitle?: boolean;
  mode: TMode;
  onSubmit: (formValues: FormValues) => void | Promise<void>;
}

const CustomPageSettingsForm = ({
  defaultValues,
  showNavBarItemTitle,
  intl: { formatMessage },
  mode,
  onSubmit,
}: Props & WrappedComponentProps) => {
  const [_titleErrors, _setTitleErrors] = useState<Multiloc>({});
  const schema = object({
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.titleMultilocError)
    ),
    ...(showNavBarItemTitle && {
      nav_bar_item_title_multiloc: validateMultilocForEveryLocale(
        formatMessage(messages.titleMultilocError)
      ),
    }),
    ...(mode === 'edit' && {
      slug: string()
        .matches(slugRegEx, formatMessage(messages.slugRegexError))
        .required(formatMessage(messages.slugRequiredError)),
    }),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });
  const slug = methods.watch('slug');

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onFormSubmit)}
        data-testid="customPageSettingsForm"
      >
        <SectionFormWrapper flatTopBorder>
          <SectionField>
            <Feedback
              successMessage={
                mode === 'edit'
                  ? formatMessage(messages.messageEditSuccess)
                  : formatMessage(messages.messageCreatedSuccess)
              }
            />
            <Box mb="20px">
              <InputMultilocWithLocaleSwitcher
                name="title_multiloc"
                label={formatMessage(messages.titleLabel)}
                type="text"
              />
            </Box>
            {showNavBarItemTitle && (
              <Box mb="20px">
                <InputMultilocWithLocaleSwitcher
                  label={formatMessage(messages.navbarItemTitle)}
                  type="text"
                  name="nav_bar_item_title_multiloc"
                />
              </Box>
            )}
            {mode === 'edit' && (
              <SlugInput slug={slug} pathnameWithoutSlug="pages" />
            )}
            <Box display="flex">
              <Button
                data-cy="e2e-submit-custom-page"
                type="submit"
                processing={methods.formState.isSubmitting}
              >
                {formatMessage(messages.saveButton)}
              </Button>
            </Box>
          </SectionField>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default injectIntl(CustomPageSettingsForm);
