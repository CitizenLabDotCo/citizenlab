import React, { useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object, string } from 'yup';

import useAddNavbarItem from 'api/navbar/useAddNavbarItem';
import useProjects from 'api/projects/useProjects';

import useLocalize from 'hooks/useLocalize';

import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Select from 'components/HookForm/Select';
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';

export interface FormValues {
  projectId: string;
  titleMultiloc: Multiloc;
}

type Props = {
  opened: boolean;
  onClose: () => void;
};

const AddProjectNavbarItemModal = ({ opened, onClose }: Props) => {
  const { mutateAsync: addNavbarItem } = useAddNavbarItem();
  const { data: projects } = useProjects({
    publicationStatuses: ['published', 'draft', 'archived'],
  });

  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const schema = object({
    projectId: string().required(formatMessage(messages.emptyProjectError)),
    titleMultiloc: validateAtLeastOneLocale(
      formatMessage(messages.emptyTitleError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await addNavbarItem({ ...formValues, type: 'project' });
      handleOnClose();
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const projectOptions =
    projects?.data.map((project) => ({
      value: project.id,
      label: localize(project.attributes.title_multiloc),
    })) || [];

  const handleOnClose = () => {
    methods.reset();
    onClose();
  };

  const projectId = methods.watch('projectId');

  useEffect(() => {
    methods.setValue(
      'titleMultiloc',
      projects?.data.find((project) => project.id === projectId)?.attributes
        .title_multiloc || {}
    );
  }, [projects, projectId, methods]);

  return (
    <Modal opened={opened} close={handleOnClose}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onFormSubmit)}>
          <SectionField>
            <Select name="projectId" label="Project" options={projectOptions} />
          </SectionField>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              name="titleMultiloc"
              label={formatMessage(messages.navbarItemTitle)}
            />
          </SectionField>
          <Box display="flex">
            <Button type="submit" processing={methods.formState.isSubmitting}>
              {formatMessage(messages.savePage)}
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default AddProjectNavbarItemModal;
