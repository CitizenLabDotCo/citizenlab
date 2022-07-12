import React from 'react';

// types
import { Multiloc, UploadFile } from 'typings';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import RHFInputMultilocWithLocaleSwitcher from 'components/UI/RHFInputMultilocWithLocaleSwitcher';
import RHFQuillMultilocWithLocaleSwitcher from 'components/UI/RHFQuillMultilocWithLocaleSwitcher';
import RHFSubmit from 'components/UI/RHFSubmit';
import RHFInput from 'components/UI/RHFInput';
import RHFFileUploader from 'components/UI/RHFFileUploader';
import {
  SectionFieldPageContent,
  SectionField,
} from 'components/admin/Section';

// intl
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// components
import {
  IconTooltip,
  Label,
  Box,
  Text,
} from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { slugRexEx } from 'utils/textUtils';

// hooks
import useLocale from 'hooks/useLocale';
import usePage from 'hooks/usePage';
import useAppConfiguration from 'hooks/useAppConfiguration';

// local_page_files: remotePageFiles,

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug?: string;
  local_page_files: UploadFile[] | null;
}

type PageFormProps = {
  onSubmit: (formValues: FormValues) => void;
  defaultValues: FormValues;
  pageId: string | null;
} & InjectedIntlProps;

const PageForm = ({
  intl: { formatMessage },
  onSubmit,
  defaultValues,
  pageId,
}: PageFormProps) => {
  const locale = useLocale();
  const page = usePage({ pageId });
  const appConfig = useAppConfiguration();

  const schema = yup
    .object({
      title_multiloc: yup.lazy((obj) => {
        const keys = Object.keys(obj);

        return yup.object(
          keys.reduce(
            (acc, curr) => (
              (acc[curr] = yup
                .string()
                .required(formatMessage(messages.emptyTitleError))),
              acc
            ),
            {}
          )
        );
      }),
      body_multiloc: yup.lazy((obj) => {
        const keys = Object.keys(obj);

        return yup.object(
          keys.reduce(
            (acc, curr) => (
              (acc[curr] = yup
                .string()
                .required(formatMessage(messages.emptyDescriptionError))),
              acc
            ),
            {}
          )
        );
      }),
      slug: yup
        .string()
        .matches(slugRexEx, formatMessage(messages.slugRegexError))
        .required(formatMessage(messages.emptySlugError)),
      local_page_files: yup.mixed(),
    })
    .required();

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(appConfig)) return null;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <SectionField>
          <RHFInputMultilocWithLocaleSwitcher
            label={formatMessage(messages.pageTitle)}
            type="text"
            name="title_multiloc"
          />
        </SectionField>
        <SectionFieldPageContent>
          <RHFQuillMultilocWithLocaleSwitcher
            name="body_multiloc"
            label={formatMessage(messages.editContent)}
          />
        </SectionFieldPageContent>
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
                            {appConfig.data.attributes.host}/{locale}
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
          <RHFInput id="slug" name="slug" type="text" />
          <Text>
            <b>
              <FormattedMessage {...messages.resultingPageURL} />
            </b>
            : {appConfig.data.attributes.host}/{locale}/pages/
            {methods.getValues('slug')}
          </Text>
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
          <RHFFileUploader
            name="local_page_files"
            resourceId={pageId}
            resourceType="page"
          />
        </SectionField>
        <RHFSubmit />
      </form>
    </FormProvider>
  );
};

export default injectIntl(PageForm);
