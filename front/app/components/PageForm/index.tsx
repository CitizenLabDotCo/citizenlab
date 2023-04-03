import React from 'react';

// types
import { Multiloc, UploadFile } from 'typings';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, mixed } from 'yup';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import FileUploader from 'components/HookForm/FileUploader';
import Feedback from 'components/HookForm/Feedback';
import { SectionField } from 'components/admin/Section';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

// intl
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// components
import { IconTooltip, Label, Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import NavbarTitleField from './NavbarTitleField';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useCustomPage from 'hooks/useCustomPage';
import useRemoteFiles from 'hooks/useRemoteFiles';

export interface FormValues {
  nav_bar_item_title_multiloc?: Multiloc;
  title_multiloc: Multiloc;
  top_info_section_multiloc: Multiloc;
  local_page_files: UploadFile[] | null;
}

interface Props {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
  pageId: string | null;
}

const PageForm = ({ onSubmit, defaultValues, pageId }: Props) => {
  const { formatMessage } = useIntl();
  const page = useCustomPage({ customPageId: pageId });
  const remoteFiles = useRemoteFiles({
    resourceId: pageId,
    resourceType: 'page',
  });
  const schema = object({
    title_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.titleMissingOneLanguageError)
    ),
    top_info_section_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.descriptionMissingOneLanguageError)
    ),
    ...(pageId &&
      !isNilOrError(page) &&
      page.relationships.nav_bar_item.data && {
        nav_bar_item_title_multiloc: validateAtLeastOneLocale(
          formatMessage(messages.titleMissingOneLanguageError)
        ),
      }),
    local_page_files: mixed(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <SectionField>
          <Feedback
            successMessage={formatMessage(messages.savePageSuccessMessage)}
          />
        </SectionField>
        <NavbarTitleField
          pageId={pageId}
          navbarItemId={
            !isNilOrError(page) && page.relationships.nav_bar_item.data
              ? page.relationships.nav_bar_item.data.id
              : null
          }
        />
        <SectionField>
          <InputMultilocWithLocaleSwitcher
            label={formatMessage(messages.pageTitle)}
            type="text"
            name="title_multiloc"
          />
        </SectionField>
        <SectionField>
          <QuillMultilocWithLocaleSwitcher
            name="top_info_section_multiloc"
            label={formatMessage(messages.editContent)}
          />
        </SectionField>
        <SectionField>
          <Label htmlFor="local_page_files">
            <FormattedMessage {...messages.fileUploadLabel} />
            <IconTooltip
              content={
                <FormattedMessage {...messages.fileUploadLabelTooltip} />
              }
            />
          </Label>
          <FileUploader name="local_page_files" remoteFiles={remoteFiles} />
        </SectionField>
        <Box display="flex">
          <Button type="submit" processing={methods.formState.isSubmitting}>
            {formatMessage(messages.savePage)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default PageForm;
