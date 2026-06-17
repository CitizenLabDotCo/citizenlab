import React from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object } from 'yup';

import useAddCustomPage from 'api/custom_pages/useAddCustomPage';

import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { useParams } from 'utils/router';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from '../messages';

interface FormValues {
  title_multiloc: Multiloc;
}

const NewProjectPage = () => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { mutateAsync: createPage } = useAddCustomPage();

  const schema = object({
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.titleError)
    ),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ title_multiloc }: FormValues) => {
    try {
      const { data } = await createPage({
        title_multiloc,
        project_id: projectId,
      });
      clHistory.push(`/admin/projects/${projectId}/pages/${data.id}`);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <Box background={colors.white} p="40px">
      <Title variant="h2">{formatMessage(messages.newPageTitle)}</Title>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Feedback />
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              name="title_multiloc"
              label={formatMessage(messages.titleLabel)}
            />
          </SectionField>
          <ButtonWithLink
            type="submit"
            processing={methods.formState.isSubmitting}
            bgColor={colors.blue500}
            data-cy="e2e-create-project-page"
          >
            {formatMessage(messages.createButton)}
          </ButtonWithLink>
        </form>
      </FormProvider>
    </Box>
  );
};

export default NewProjectPage;
