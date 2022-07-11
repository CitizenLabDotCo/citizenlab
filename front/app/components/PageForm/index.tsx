import React from 'react';

import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// typings
import { Multiloc, UploadFile } from 'typings';

import RHFInputMultilocWithLocaleSwitcher from 'components/UI/RHFInputMultilocWithLocaleSwitcher';

import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// body_multiloc: page.attributes.body_multiloc,
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

const PageForm = ({ intl: { formatMessage } }: InjectedIntlProps) => {
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
    })
    .required();

  const methods = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => console.log(data);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <RHFInputMultilocWithLocaleSwitcher type="text" name="title_multiloc" />
        <input type="submit" />
      </form>
    </FormProvider>
  );
};

export default injectIntl(PageForm);
