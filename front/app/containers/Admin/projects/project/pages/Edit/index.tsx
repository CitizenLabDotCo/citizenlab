import React, { useEffect, useState } from 'react';

import { Box, Title, Label, colors } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc, UploadFile } from 'typings';
import { mixed, object } from 'yup';

import { ICustomPageData } from 'api/custom_pages/types';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';
import useAddPageFile from 'api/page_files/useAddPageFile';
import useDeletePageFile from 'api/page_files/useDeletePageFile';
import usePageFiles from 'api/page_files/usePageFiles';
import { handleAddPageFiles, handleRemovePageFiles } from 'api/page_files/util';
import { IProjectData } from 'api/projects/types';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import FileUploader from 'components/HookForm/FileUploader';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'utils/router';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from '../messages';

interface FormValues {
  title_multiloc: Multiloc;
  top_info_section_multiloc: Multiloc;
  local_page_files: UploadFile[] | null;
}

interface FormProps {
  page: ICustomPageData;
  project: IProjectData;
}

// Inner form, mounted only once the page is loaded, so defaultValues are correct.
const EditProjectPageForm = ({ page, project }: FormProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: remoteFiles } = usePageFiles(page.id);
  const { mutateAsync: updateCustomPage } = useUpdateCustomPage();
  const { mutateAsync: addPageFile } = useAddPageFile();
  const { mutateAsync: deletePageFile } = useDeletePageFile();
  const [files, setFiles] = useState<UploadFile[]>([]);

  useEffect(() => {
    async function getFiles() {
      const loaded = remoteFiles
        ? ((
            await Promise.all(
              remoteFiles.data.map((file) =>
                convertUrlToUploadFile(
                  file.attributes.file.url,
                  file.id,
                  file.attributes.name
                )
              )
            )
          ).filter(Boolean) as UploadFile[])
        : [];
      setFiles(loaded);
    }

    getFiles();
  }, [remoteFiles]);

  const schema = object({
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.titleError)
    ),
    top_info_section_multiloc: mixed(),
    local_page_files: mixed(),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    // yup's inferred schema type doesn't line up with FormValues for the
    // mixed() fields; cast as in the sibling CustomPageSettingsForm.
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title_multiloc: page.attributes.title_multiloc,
      top_info_section_multiloc: page.attributes.top_info_section_multiloc,
      local_page_files: files,
    },
  });

  const onSubmit = async ({
    title_multiloc,
    top_info_section_multiloc,
    local_page_files,
  }: FormValues) => {
    try {
      await updateCustomPage({
        id: page.id,
        title_multiloc,
        top_info_section_multiloc,
        // Project pages render their body via the top info section.
        top_info_section_enabled: true,
        files_section_enabled: true,
      });

      if (!isNilOrError(local_page_files)) {
        await Promise.all([
          handleAddPageFiles(page.id, local_page_files, files, addPageFile),
          handleRemovePageFiles(
            page.id,
            local_page_files,
            files,
            deletePageFile
          ),
        ]);
      }
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <Box background={colors.white} p="40px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="16px"
      >
        <Title variant="h2">{localize(page.attributes.title_multiloc)}</Title>
        <ButtonWithLink
          buttonStyle="secondary-outlined"
          icon="eye"
          openLinkInNewTab
          to="/projects/$slug/pages/$pageSlug"
          params={{
            slug: project.attributes.slug,
            pageSlug: page.attributes.slug,
          }}
        >
          {formatMessage(messages.viewPage)}
        </ButtonWithLink>
      </Box>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Feedback successMessage={formatMessage(messages.saveSuccess)} />
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              name="title_multiloc"
              label={formatMessage(messages.titleLabel)}
            />
          </SectionField>
          <SectionField>
            <QuillMultilocWithLocaleSwitcher
              name="top_info_section_multiloc"
              label={formatMessage(messages.contentLabel)}
              withCTAButton
            />
          </SectionField>
          <SectionField>
            <Label>{formatMessage(messages.attachmentsLabel)}</Label>
            <FileUploader name="local_page_files" remoteFiles={files} />
          </SectionField>
          <ButtonWithLink
            type="submit"
            processing={methods.formState.isSubmitting}
            bgColor={colors.blue500}
            data-cy="e2e-save-project-page"
          >
            {formatMessage(messages.saveButton)}
          </ButtonWithLink>
        </form>
      </FormProvider>
    </Box>
  );
};

const EditProjectPage = () => {
  const { projectId, customPageId } = useParams({ strict: false }) as {
    projectId: string;
    customPageId: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: customPage } = useCustomPageById(customPageId);

  if (isNilOrError(customPage) || !project) {
    return null;
  }

  return <EditProjectPageForm page={customPage.data} project={project.data} />;
};

export default EditProjectPage;
