import React, { useEffect, useState } from 'react';

import {
  Box,
  Title,
  Label,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc, UploadFile } from 'typings';
import { mixed, object, string } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { ICustomPageData } from 'api/custom_pages/types';
import useAddCustomPage from 'api/custom_pages/useAddCustomPage';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';
import useAddPageFile from 'api/page_files/useAddPageFile';
import useDeletePageFile from 'api/page_files/useDeletePageFile';
import usePageFiles from 'api/page_files/usePageFiles';
import { handleAddPageFiles, handleRemovePageFiles } from 'api/page_files/util';
import { IProjectData } from 'api/projects/types';

import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import FileUploader from 'components/HookForm/FileUploader';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import SlugInput from 'components/HookForm/SlugInput';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { defaultAdminCardPadding } from 'utils/styleConstants';
import { slugRegEx } from 'utils/textUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from './messages';

interface FormValues {
  title_multiloc: Multiloc;
  slug?: string;
  top_info_section_multiloc: Multiloc;
  local_page_files: UploadFile[] | null;
}

interface Props {
  project: IProjectData;
  // Omitted when creating a new page; the same form then doubles as the
  // create form so page creation is a single step.
  page?: ICustomPageData;
}

const ProjectPageForm = ({ project, page }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: remoteFiles } = usePageFiles(page?.id);
  const { width, containerRef } = useContainerWidthAndHeight();
  const isEditing = !!page;
  const { mutateAsync: addCustomPage } = useAddCustomPage();
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
    ...(isEditing && {
      slug: string()
        .matches(slugRegEx, formatMessage(messages.slugRegexError))
        .required(formatMessage(messages.slugRequiredError)),
    }),
    top_info_section_multiloc: mixed(),
    local_page_files: mixed(),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    // yup's inferred schema type doesn't line up with FormValues for the
    // mixed() fields; cast as in the sibling CustomPageSettingsForm.
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title_multiloc: page?.attributes.title_multiloc,
      slug: page?.attributes.slug,
      top_info_section_multiloc: page?.attributes.top_info_section_multiloc,
      local_page_files: files,
    },
  });

  const slug = methods.watch('slug');
  const slugHasChanged = slug !== page?.attributes.slug;
  const previewUrl =
    slug && appConfiguration
      ? `${appConfiguration.data.attributes.host}/${locale}/projects/${project.attributes.slug}/pages/${slug}`
      : null;

  const onSubmit = async ({
    title_multiloc,
    slug,
    top_info_section_multiloc,
    local_page_files,
  }: FormValues) => {
    try {
      // Project pages render their body via the top info section.
      const pageAttributes = {
        title_multiloc,
        top_info_section_multiloc,
        top_info_section_enabled: true,
        files_section_enabled: true,
      };

      const pageId = page
        ? (await updateCustomPage({ id: page.id, ...pageAttributes, slug }))
            .data.id
        : (
            await addCustomPage({
              project_id: project.id,
              ...pageAttributes,
            })
          ).data.id;

      if (!isNilOrError(local_page_files)) {
        // On create, `files` is empty so this only adds; on edit it diffs
        // against the page's existing files.
        await Promise.all([
          handleAddPageFiles(pageId, local_page_files, files, addPageFile),
          handleRemovePageFiles(
            pageId,
            local_page_files,
            files,
            deletePageFile
          ),
        ]);
      }

      if (!page) {
        // Move onto the saved page so further edits target the real record.
        clHistory.push(`/admin/projects/${project.id}/pages/${pageId}`);
      }
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <Box mt="44px" mx="44px">
      <Box bg={colors.white} borderRadius={stylingConsts.borderRadius} p="44px">
        <Box ref={containerRef}>
          <Box mb="16px">
            <GoBackButton
              to="/admin/projects/$projectId/pages"
              params={{ projectId: project.id }}
            />
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="16px"
          >
            <Title variant="h2">
              {isEditing
                ? localize(page.attributes.title_multiloc)
                : formatMessage(messages.newPageTitle)}
            </Title>
            {isEditing && (
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
            )}
          </Box>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Feedback
                successMessage={
                  isEditing ? formatMessage(messages.saveSuccess) : undefined
                }
              />
              <SectionField>
                <InputMultilocWithLocaleSwitcher
                  name="title_multiloc"
                  label={formatMessage(messages.titleLabel)}
                />
              </SectionField>
              {isEditing && (
                <SectionField>
                  <SlugInput
                    slug={slug}
                    showWarningMessage={slugHasChanged}
                    previewUrl={previewUrl}
                  />
                </SectionField>
              )}
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
              <Box
                position="fixed"
                borderTop={`1px solid ${colors.divider}`}
                bottom="0"
                w={`calc(${width}px + ${defaultAdminCardPadding * 2}px)`}
                ml={`-${defaultAdminCardPadding}px`}
                background={colors.white}
                display="flex"
                justifyContent="flex-start"
              >
                <Box py="8px" px={`${defaultAdminCardPadding}px`}>
                  <ButtonWithLink
                    type="submit"
                    processing={methods.formState.isSubmitting}
                    disabled={!methods.formState.isDirty}
                    bgColor={colors.blue500}
                    data-cy={
                      isEditing
                        ? 'e2e-save-project-page'
                        : 'e2e-create-project-page'
                    }
                  >
                    {isEditing
                      ? formatMessage(messages.saveButton)
                      : formatMessage(messages.createButton)}
                  </ButtonWithLink>
                </Box>
              </Box>
            </form>
          </FormProvider>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectPageForm;
