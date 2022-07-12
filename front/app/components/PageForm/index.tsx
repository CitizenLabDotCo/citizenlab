import React from 'react';

import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// typings
import { Multiloc, UploadFile } from 'typings';

import RHFInputMultilocWithLocaleSwitcher from 'components/UI/RHFInputMultilocWithLocaleSwitcher';
import RHFQuillMultilocWithLocaleSwitcher from 'components/UI/RHFQuillMultilocWithLocaleSwitcher';
import RHFSubmit from 'components/UI/RHFSubmit';

import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

import {
  SectionFieldPageContent,
  SectionField,
} from 'components/admin/Section';

// slug: page.attributes.slug,
// local_page_files: remotePageFiles,

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug?: string;
  local_page_files: UploadFile[] | null;
}

export interface Props {
  hideTitle?: boolean;
  hideSlugInput?: boolean;
  pageId: string | null;
}

const PageForm = ({
  intl: { formatMessage },
  onSubmit,
  defaultValues,
}: InjectedIntlProps & { onSubmit: any; defaultValues: FormValues }) => {
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
    })
    .required();

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

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
        <RHFSubmit />
      </form>
    </FormProvider>
  );
};

export default injectIntl(PageForm);
