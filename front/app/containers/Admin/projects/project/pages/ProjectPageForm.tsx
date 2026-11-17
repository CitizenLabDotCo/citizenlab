import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, Resolver, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object, string } from 'yup';

import { ICustomPageData } from 'api/custom_pages/types';
import useAddCustomPage from 'api/custom_pages/useAddCustomPage';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';
import { IProjectData } from 'api/projects/types';

import PageWrapper from 'components/admin/PageWrapper';
import StickyContainer from 'components/admin/StickyContainer';
import Feedback from 'components/HookForm/Feedback';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { slugRegEx } from 'utils/textUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from './messages';
import SubmitButton from './SubmitButton';
import TitleAndSlugFields from './TitleAndSlugFields';

interface FormValues {
  title_multiloc: Multiloc;
  slug?: string;
}

interface Props {
  project: IProjectData;
  // Omitted when creating; the same form then doubles as the create form.
  page?: ICustomPageData;
}

const ProjectPageForm = ({ project, page }: Props) => {
  const { formatMessage } = useIntl();
  const isEditing = !!page;
  const { mutateAsync: addCustomPage } = useAddCustomPage();
  const { mutateAsync: updateCustomPage } = useUpdateCustomPage();

  const schema = object({
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.titleError)
    ),
    slug: isEditing
      ? string()
          .matches(slugRegEx, formatMessage(messages.slugRegexError))
          .required(formatMessage(messages.slugRequiredError))
      : string(),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    // Cast: yup infers optional keys on the output side, which doesn't line up with the input side.
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      title_multiloc: page?.attributes.title_multiloc,
      slug: page?.attributes.slug,
    },
  });

  const onSubmit = async ({ title_multiloc, slug }: FormValues) => {
    try {
      if (page) {
        await updateCustomPage({ id: page.id, title_multiloc, slug });
      } else {
        await addCustomPage({ project_id: project.id, title_multiloc });
        // Created: return to the list.
        clHistory.push(`/admin/projects/${project.id}/pages`);
      }
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  // The body and files are authored in the builder, and the surrounding page shows the
  // breadcrumbs, title and view button: the form is the custom page settings card.
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <PageWrapper flatTopBorder>
          <Feedback
            successMessage={
              isEditing ? formatMessage(messages.saveSuccess) : undefined
            }
          />
          <TitleAndSlugFields project={project} page={page} />
          <StickyContainer>
            <Box display="flex">
              <SubmitButton isEditing={isEditing} />
            </Box>
          </StickyContainer>
        </PageWrapper>
      </form>
    </FormProvider>
  );
};

export default ProjectPageForm;
