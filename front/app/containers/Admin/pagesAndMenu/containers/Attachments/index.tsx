import React, { useEffect } from 'react';

// components
import {
  Box,
  Button,
  IconTooltip,
  Label,
} from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import ShownOnPageBadge from '../../components/ShownOnPageBadge';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import ViewCustomPageButton from '../CustomPages/Edit/ViewCustomPageButton';

// i18n
import HelmetIntl from 'components/HelmetIntl';
import useLocalize from 'hooks/useLocalize';
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// form
import { yupResolver } from '@hookform/resolvers/yup';
import Feedback from 'components/HookForm/Feedback';
import FileUploader from 'components/HookForm/FileUploader';
import { FormProvider, useForm } from 'react-hook-form';
import { mixed, object } from 'yup';

// typings
import { UploadFile } from 'typings';

// hooks
import useCustomPage from 'hooks/useCustomPage';
import { updateCustomPage } from 'services/customPages';
import { useParams } from 'react-router-dom';

// constants
import { adminCustomPageContentPath } from 'containers/Admin/pagesAndMenu/routes';
import { pagesAndMenuBreadcrumb } from '../../breadcrumbs';

// utils
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError, isString } from 'utils/helperUtils';
import {
  getFilesToRemove,
  getFilesToAdd,
  convertUrlToUploadFile,
} from 'utils/fileUtils';
import useAddPagesFile from 'api/page_files/useAddPageFile';
import useDeletePageFile from 'api/page_files/useDeletePageFile';
import usePageFiles from 'api/page_files/usePageFiles';

type FormValues = {
  local_page_files: UploadFile[] | null;
};

const AttachmentsForm = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const { data: remoteFiles } = usePageFiles(customPageId);
  const { mutateAsync: addPageFile } = useAddPagesFile();
  const { mutateAsync: deletePageFile } = useDeletePageFile();
  const [files, setFiles] = React.useState<UploadFile[]>([]);

  useEffect(() => {
    async function getFiles() {
      let files: UploadFile[] = [];

      if (remoteFiles) {
        files = (await Promise.all(
          remoteFiles.data.map(async (file) => {
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
  }, [remoteFiles]);

  const customPage = useCustomPage({ customPageId });

  function getPageFilesToRemovePromises(
    pageId: string,
    localPageFiles: UploadFile[],
    remotePageFiles: UploadFile[] | null
  ) {
    // localPageFiles = local state of files
    // This means those previously uploaded + files that have been added/removed
    // remotePageFiles = last saved state of files (remote)
    if (!isNilOrError(localPageFiles) && !isNilOrError(remotePageFiles)) {
      const filesToRemove = getFilesToRemove(localPageFiles, remotePageFiles);
      const filesToRemovePromises = filesToRemove
        .filter((fileToRemove) => isString(fileToRemove.id))
        .map((fileToRemove) => {
          return deletePageFile({ pageId, fileId: fileToRemove.id as string });
        });

      return filesToRemovePromises;
    }

    return null;
  }

  function getPageFilesToAddPromises(
    pageId: string,
    localPageFiles: UploadFile[],
    remotePageFiles: UploadFile[] | null
  ) {
    // localPageFiles = local state of files
    // This means those previously uploaded + files that have been added/removed
    // remotePageFiles = last saved state of files (remote)

    if (!isNilOrError(localPageFiles)) {
      const filesToAdd = getFilesToAdd(localPageFiles, remotePageFiles);
      const filesToAddPromises = filesToAdd.map((fileToAdd) =>
        addPageFile({
          pageId,
          file: { base64: fileToAdd.base64, name: fileToAdd.name },
        })
      );

      return filesToAddPromises;
    }

    return null;
  }

  async function handleAddPageFiles(
    pageId: string,
    localPageFiles: UploadFile[],
    remotePageFiles: UploadFile[] | null
  ) {
    const filesToAddPromises = getPageFilesToAddPromises(
      pageId,
      localPageFiles,
      remotePageFiles
    );

    if (filesToAddPromises) {
      await Promise.all(filesToAddPromises);
    }
  }

  async function handleRemovePageFiles(
    pageId: string,
    localPageFiles: UploadFile[],
    remotePageFiles: UploadFile[] | null
  ) {
    const filesToRemovePromises = getPageFilesToRemovePromises(
      pageId,
      localPageFiles,
      remotePageFiles
    );

    if (filesToRemovePromises) {
      await Promise.all(filesToRemovePromises);
    }
  }

  const handleSubmit = async (
    { local_page_files }: FormValues,
    enableSection = false
  ) => {
    const promises: Promise<any>[] = [];

    if (!isNilOrError(local_page_files)) {
      const addPromise = handleAddPageFiles(
        customPageId,
        local_page_files,
        files
      );
      const removePromise = handleRemovePageFiles(
        customPageId,
        local_page_files,
        files
      );

      promises.push(addPromise, removePromise);
    }

    if (enableSection) {
      const enableSectionPromise = updateCustomPage(customPageId, {
        files_section_enabled: true,
      });
      promises.push(enableSectionPromise);
    }

    await Promise.all(promises);
  };

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await handleSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const onFormSubmitAndEnable = async (formValues: FormValues) => {
    try {
      await handleSubmit(formValues, true);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const schema = object({
    local_page_files: mixed(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: { local_page_files: files },
    resolver: yupResolver(schema),
  });

  if (isNilOrError(customPage)) {
    return null;
  }

  const isSectionEnabled = customPage.attributes.files_section_enabled;

  return (
    <>
      <HelmetIntl title={messages.pageMetaTitle} />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onFormSubmit)}>
          <SectionFormWrapper
            title={formatMessage(messages.pageTitle)}
            badge={<ShownOnPageBadge shownOnPage={isSectionEnabled} />}
            breadcrumbs={[
              {
                label: formatMessage(pagesAndMenuBreadcrumb.label),
                linkTo: pagesAndMenuBreadcrumb.linkTo,
              },
              {
                label: localize(customPage.attributes.title_multiloc),
                linkTo: adminCustomPageContentPath(customPageId),
              },
              {
                label: formatMessage(messages.pageTitle),
              },
            ]}
            rightSideCTA={
              <ViewCustomPageButton
                linkTo={`/pages/${customPage.attributes.slug}`}
              />
            }
          >
            <Feedback successMessage={formatMessage(messages.messageSuccess)} />
            <SectionField>
              <Label htmlFor="local_page_files">
                <FormattedMessage {...messages.attachmentUploadLabel} />
                <IconTooltip
                  content={
                    <FormattedMessage {...messages.attachmentUploadTooltip} />
                  }
                />
              </Label>
              <FileUploader name="local_page_files" remoteFiles={files} />
            </SectionField>
            <Box display="flex">
              <Button
                data-cy={`e2e-attachments-section-submit`}
                type="submit"
                processing={methods.formState.isSubmitting}
              >
                <FormattedMessage {...messages.saveButton} />
              </Button>
              {!isSectionEnabled && (
                <Button
                  ml="30px"
                  type="button"
                  buttonStyle="primary-outlined"
                  onClick={methods.handleSubmit(onFormSubmitAndEnable)}
                  processing={methods.formState.isSubmitting}
                >
                  {formatMessage(messages.saveAndEnableButton)}
                </Button>
              )}
            </Box>
          </SectionFormWrapper>
        </form>
      </FormProvider>
    </>
  );
};

export default injectIntl(AttachmentsForm);
