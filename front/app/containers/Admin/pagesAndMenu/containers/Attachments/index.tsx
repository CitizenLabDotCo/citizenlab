import React from 'react';

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

// services
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';

// hooks
import useCustomPage from 'hooks/useCustomPage';
import { updateCustomPage } from 'services/customPages';
import useRemoteFiles from 'hooks/useRemoteFiles';
import { useParams } from 'react-router-dom';

// constants
import { adminCustomPageContentPath } from 'containers/Admin/pagesAndMenu/routes';
import { pagesAndMenuBreadcrumb } from '../../breadcrumbs';

// utils
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

type FormValues = {
  local_page_files: UploadFile[] | null;
};

const AttachmentsForm = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage({ customPageId });

  const remotePageFiles = useRemoteFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(customPage) ? customPage.id : null,
  });

  const handleSubmit = async (
    { local_page_files }: FormValues,
    enableSection = false
  ) => {
    const promises: Promise<any>[] = [];

    if (!isNilOrError(local_page_files)) {
      const addPromise = handleAddPageFiles(
        customPageId,
        local_page_files,
        remotePageFiles
      );
      const removePromise = handleRemovePageFiles(
        customPageId,
        local_page_files,
        remotePageFiles
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
    defaultValues: { local_page_files: remotePageFiles },
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
              <FileUploader
                name="local_page_files"
                resourceId={customPageId}
                resourceType="page"
              />
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
