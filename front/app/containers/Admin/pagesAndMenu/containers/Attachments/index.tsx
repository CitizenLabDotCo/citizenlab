import React from 'react';

// components
import SectionFormWrapper from '../../components/SectionFormWrapper';
import {
  IconTooltip,
  Label,
  Button,
  Box,
} from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';

// i18n
import messages from './messages';
import useLocalize from 'hooks/useLocalize';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, mixed } from 'yup';
import FileUploader from 'components/HookForm/FileUploader';
import Feedback from 'components/HookForm/Feedback';

// typings
import { UploadFile } from 'typings';

// services
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';

// hooks
import { useParams } from 'react-router-dom';
import useRemoteFiles from 'hooks/useRemoteFiles';
import useCustomPage from 'hooks/useCustomPage';

// constants
import { PAGES_MENU_CUSTOM_PATH } from '../../routes';
import { pagesAndMenuBreadcrumb } from '../../breadcrumbs';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

type FormValues = {
  local_page_files: UploadFile[] | null;
};

const AttachmentsForm = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);

  const remotePageFiles = useRemoteFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(customPage) ? customPage.id : null,
  });

  const handleSubmit = async ({ local_page_files }: FormValues) => {
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

    await Promise.all(promises);
  };

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await handleSubmit(formValues);
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <SectionFormWrapper
          title={formatMessage(messages.pageTitle)}
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumb.linkTo,
            },
            {
              label: localize(customPage.attributes.title_multiloc),
              linkTo: `${PAGES_MENU_CUSTOM_PATH}/${customPageId}/content`,
            },
            {
              label: formatMessage(messages.pageTitle),
            },
          ]}
        >
          <SectionField>
            <Feedback successMessage={formatMessage(messages.messageSuccess)} />
          </SectionField>
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
            <Button type="submit" processing={methods.formState.isSubmitting}>
              <FormattedMessage {...messages.saveButton} />
            </Button>
          </Box>
        </SectionFormWrapper>
      </form>
    </FormProvider>
  );
};

export default injectIntl(AttachmentsForm);
