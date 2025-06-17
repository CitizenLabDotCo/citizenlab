import React, { useEffect } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object, string } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAddNavbarItem from 'api/navbar/useAddNavbarItem';
import useProjects from 'api/projects/useProjects';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Select from 'components/HookForm/Select';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { IItemNotInNavbar } from 'utils/navbar';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

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
  const { data: appConfig } = useAppConfiguration();

  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();

  const schema = object({
    projectId: string().required(formatMessage(messages.emptyProjectError)),
    titleMultiloc: validateMultilocForEveryLocale(
      formatMessage(messages.emptyNameError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await addNavbarItem({
        ...formValues,
        type: 'project',
      } as IItemNotInNavbar);
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

  // Automatically fill out the title multiloc field when a project is selected
  const projectId = methods.watch('projectId');
  useEffect(() => {
    methods.setValue(
      'titleMultiloc',
      projects?.data.find((project) => project.id === projectId)?.attributes
        .title_multiloc || {}
    );
  }, [projects, projectId, methods]);

  const hostName = appConfig?.data.attributes.host;
  const slug = projects?.data.find((project) => project.id === projectId)
    ?.attributes.slug;
  const previewUrl = `${hostName}/${locale}/projects/${slug}`;

  return (
    <Modal
      opened={opened}
      close={handleOnClose}
      header={formatMessage(messages.title)}
    >
      <Box p="24px">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onFormSubmit)}>
            <Box display="flex" gap="32px" flexDirection="column">
              <Select
                name="projectId"
                label={formatMessage(messages.project)}
                options={projectOptions}
              />
              <Box>
                <InputMultilocWithLocaleSwitcher
                  name="titleMultiloc"
                  label={formatMessage(messages.navbarItemName)}
                />
                {projectId && (
                  <Text fontStyle="italic" mt="4px" mb="0px">
                    {formatMessage(messages.resultingUrl)}: {previewUrl}
                  </Text>
                )}
              </Box>
              <Warning>{formatMessage(messages.warning)}</Warning>
              <Box display="flex">
                <ButtonWithLink
                  type="submit"
                  processing={methods.formState.isSubmitting}
                >
                  {formatMessage(messages.savePage)}
                </ButtonWithLink>
              </Box>
            </Box>
          </form>
        </FormProvider>
      </Box>
    </Modal>
  );
};

export default AddProjectNavbarItemModal;
