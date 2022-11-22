import React from 'react';

// types
import { Multiloc, UploadFile } from 'typings';

// form
import { yupResolver } from '@hookform/resolvers/yup';
import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import FileUploader from 'components/HookForm/FileUploader';
import Input from 'components/HookForm/Input';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import { FormProvider, useForm } from 'react-hook-form';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';
import { mixed, object, string } from 'yup';

// intl
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import {
  Box,
  IconTooltip,
  Label,
  Text,
} from '@citizenlab/cl2-component-library';
import Outlet from 'components/Outlet';
import Button from 'components/UI/Button';
import Warning from 'components/UI/Warning';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { slugRegEx } from 'utils/textUtils';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import useCustomPage from 'hooks/useCustomPage';
import useAppConfiguration from 'hooks/useAppConfiguration';

export interface FormValues {
  nav_bar_item_title_multiloc?: Multiloc;
  title_multiloc: Multiloc;
  top_info_section_multiloc: Multiloc;
  slug?: string;
  local_page_files: UploadFile[] | null;
}

type PageFormProps = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
  pageId: string | null;
  hideSlugInput?: boolean;
} & WrappedComponentProps;

const PageForm = ({
  intl: { formatMessage },
  onSubmit,
  defaultValues,
  pageId,
  hideSlugInput = false,
}: PageFormProps) => {
  const locale = useLocale();
  const page = useCustomPage({ customPageId: pageId });
  const appConfig = useAppConfiguration();

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
    ...(!hideSlugInput && {
      slug: string()
        .matches(slugRegEx, formatMessage(messages.slugRegexError))
        .required(formatMessage(messages.blankSlugError)),
      local_page_files: mixed(),
    }),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(appConfig)) return null;

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
        <Outlet
          id="app.components.PageForm.index.top"
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
        {!hideSlugInput && (
          <SectionField>
            <Label htmlFor="slug">
              <FormattedMessage {...messages.pageUrl} />
              {!isNilOrError(page) && (
                <IconTooltip
                  content={
                    <FormattedMessage
                      {...messages.slugLabelTooltip}
                      values={{
                        currentPageURL: (
                          <em>
                            <b>
                              {appConfig.attributes.host}/{locale}
                              /pages/{page.attributes.slug}
                            </b>
                          </em>
                        ),
                        currentPageSlug: (
                          <em>
                            <b>{page.attributes.slug}</b>
                          </em>
                        ),
                      }}
                    />
                  }
                />
              )}
            </Label>
            {!isNilOrError(page) && (
              <Box mb="16px">
                <Warning>
                  <FormattedMessage {...messages.brokenURLWarning} />
                </Warning>
              </Box>
            )}
            <Input id="slug" name="slug" type="text" />
            <Text>
              <b>
                <FormattedMessage {...messages.resultingPageURL} />
              </b>
              : {appConfig.attributes.host}/{locale}/pages/
              {methods.getValues('slug')}
            </Text>
          </SectionField>
        )}
        <SectionField>
          <Label htmlFor="local_page_files">
            <FormattedMessage {...messages.fileUploadLabel} />
            <IconTooltip
              content={
                <FormattedMessage {...messages.fileUploadLabelTooltip} />
              }
            />
          </Label>
          <FileUploader
            name="local_page_files"
            resourceId={pageId}
            resourceType="page"
          />
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

export default injectIntl(PageForm);
