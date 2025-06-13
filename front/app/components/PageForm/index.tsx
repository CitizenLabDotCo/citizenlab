import React, { useEffect } from 'react';

import { IconTooltip, Label, Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { Multiloc, UploadFile } from 'typings';
import { object, mixed } from 'yup';

import useCustomPageById from 'api/custom_pages/useCustomPageById';
import usePageFiles from 'api/page_files/usePageFiles';

import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import FileUploader from 'components/HookForm/FileUploader';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';

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
  const { data: page } = useCustomPageById(pageId ?? undefined);
  const { data: remotePageFiles } = usePageFiles(
    !page ? undefined : page.data.id
  );

  const [files, setFiles] = React.useState<UploadFile[]>([]);

  useEffect(() => {
    async function getFiles() {
      let files: UploadFile[] = [];

      if (remotePageFiles) {
        files = (await Promise.all(
          remotePageFiles.data.map(async (file) => {
            const uploadFile = convertUrlToUploadFile(
              file.attributes.file.url,
              file.id,
              file.attributes.name
            );
            return uploadFile;
          })
        )) as UploadFile[];
      }
      setFiles(files);
    }

    getFiles();
  }, [remotePageFiles]);

  const schema = object({
    title_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.titleMissingOneLanguageError)
    ),
    top_info_section_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.descriptionMissingOneLanguageError)
    ),
    ...(pageId &&
      !isNilOrError(page) &&
      page.data.relationships.nav_bar_item.data && {
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
        <SectionField>
          <InputMultilocWithLocaleSwitcher
            label={formatMessage(messages.pageTitle)}
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
          <FileUploader name="local_page_files" remoteFiles={files} />
        </SectionField>
        <Box display="flex">
          <ButtonWithLink
            type="submit"
            processing={methods.formState.isSubmitting}
          >
            {formatMessage(messages.savePage)}
          </ButtonWithLink>
        </Box>
      </form>
    </FormProvider>
  );
};

export default PageForm;
