import React, { useEffect } from 'react';

import {
  Box,
  Button,
  IconTooltip,
  Label,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { UploadFile } from 'typings';
import { mixed, object } from 'yup';

import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';
import useAddPagesFile from 'api/page_files/useAddPageFile';
import useDeletePageFile from 'api/page_files/useDeletePageFile';
import usePageFiles from 'api/page_files/usePageFiles';
import { handleAddPageFiles, handleRemovePageFiles } from 'api/page_files/util';

import useLocalize from 'hooks/useLocalize';

import { adminCustomPageContentPath } from 'containers/Admin/pagesAndMenu/routes';

import { SectionField } from 'components/admin/Section';
import HelmetIntl from 'components/HelmetIntl';
import Feedback from 'components/HookForm/Feedback';
import FileUploader from 'components/HookForm/FileUploader';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';

import {
  pagesAndMenuBreadcrumb,
  pagesAndMenuBreadcrumbLinkTo,
} from '../../breadcrumbs';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import ShownOnPageBadge from '../../components/ShownOnPageBadge';
import ViewCustomPageButton from '../CustomPages/Edit/ViewCustomPageButton';

import messages from './messages';

type FormValues = {
  local_page_files: UploadFile[] | null;
};

const AttachmentsForm = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const { mutateAsync: updateCustomPage } = useUpdateCustomPage();
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };

  const { data: customPage } = useCustomPageById(customPageId);
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

  const handleSubmit = async (
    { local_page_files }: FormValues,
    enableSection = false
  ) => {
    const promises: Promise<any>[] = [];

    if (!isNilOrError(local_page_files)) {
      const addPromise = handleAddPageFiles(
        customPageId,
        local_page_files,
        files,
        addPageFile
      );
      const removePromise = handleRemovePageFiles(
        customPageId,
        local_page_files,
        files,
        deletePageFile
      );

      promises.push(addPromise, removePromise);
    }

    if (enableSection) {
      const enableSectionPromise = updateCustomPage({
        id: customPageId,
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

  const isSectionEnabled = customPage.data.attributes.files_section_enabled;

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
                linkTo: pagesAndMenuBreadcrumbLinkTo,
              },
              {
                label: localize(customPage.data.attributes.title_multiloc),
                linkTo: adminCustomPageContentPath(customPageId),
              },
              {
                label: formatMessage(messages.pageTitle),
              },
            ]}
            rightSideCTA={
              <ViewCustomPageButton
                linkTo={`/pages/${customPage.data.attributes.slug}`}
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
