import React, { useEffect } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object, string } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAddNavbarItem from 'api/navbar/useAddNavbarItem';
import useProjects from 'api/projects/useProjects';
import useProjectFolders from 'api/project_folders/useProjectFolders';

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
  itemId: string;
  titleMultiloc: Multiloc;
}

type Props = {
  opened: boolean;
  onClose: () => void;
};

const AddProjectOrFolderNavbarItemModal = ({ opened, onClose }: Props) => {
  const { mutateAsync: addNavbarItem } = useAddNavbarItem();
  const { data: projects } = useProjects({
    publicationStatuses: ['published', 'draft', 'archived'],
  });
  const { data: projectFolders } = useProjectFolders({});

  const folderExists = !!(
    projectFolders?.data && projectFolders.data.length > 0
  );

  const { data: appConfig } = useAppConfiguration();

  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();

  const schema = object({
    itemId: string().required(
      folderExists
        ? formatMessage(messages.emptyProjectOrFolderError)
        : formatMessage(messages.emptyProjectError)
    ),
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
      const selectedProject = projects?.data.find(
        (project) => project.id === formValues.itemId
      );
      const selectedFolder = projectFolders?.data.find(
        (folder) => folder.id === formValues.itemId
      );

      let payload: IItemNotInNavbar;

      if (selectedProject) {
        payload = {
          ...formValues,
          type: 'project',
          itemId: selectedProject.id, // <-- send project_id
          slug: selectedProject.attributes.slug,
        };
      } else if (selectedFolder) {
        payload = {
          ...formValues,
          type: 'folder',
          itemId: selectedFolder.id, // <-- send folder_id
          slug: selectedFolder.attributes.slug,
        };
      } else {
        throw new Error('Selected item is not a valid project or folder');
      }

      await addNavbarItem(payload);
      handleOnClose();
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const projectAndFolderOptions = [
    ...(projects?.data.map((project) => ({
      value: project.id,
      label: localize(project.attributes.title_multiloc),
    })) || []),
    ...(projectFolders?.data.map((folder) => ({
      value: folder.id,
      label: localize(folder.attributes.title_multiloc),
    })) || []),
  ].sort((a, b) => a.label.localeCompare(b.label));

  const handleOnClose = () => {
    methods.reset();
    onClose();
  };

  const itemId = methods.watch('itemId');

  const getSelectedItem = () => {
    const project = projects?.data.find((project) => project.id === itemId);
    if (project) return { ...project, type: 'project' };
    const folder = projectFolders?.data.find((folder) => folder.id === itemId);
    if (folder) return { ...folder, type: 'folder' };
    return null;
  };

  const selectedItem = getSelectedItem();

  // Automatically fill out the title multiloc field when a project is selected
  useEffect(() => {
    const titleMultiloc = selectedItem?.attributes.title_multiloc || {};
    methods.setValue('titleMultiloc', titleMultiloc);
  }, [selectedItem?.attributes.title_multiloc, methods]);

  const hostName = appConfig?.data.attributes.host;

  const slug = selectedItem?.attributes.slug;
  const previewUrl = selectedItem
    ? selectedItem.type === 'project'
      ? `${hostName}/${locale}/projects/${slug}`
      : `${hostName}/${locale}/folders/${slug}`
    : '';

  return (
    <Modal
      opened={opened}
      close={handleOnClose}
      header={
        folderExists
          ? formatMessage(messages.title)
          : formatMessage(messages.titleProjectOnly)
      }
    >
      <Box p="24px">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onFormSubmit)}>
            <Box display="flex" gap="32px" flexDirection="column">
              <Select
                name="itemId"
                label={
                  folderExists
                    ? formatMessage(messages.projectOrFolder)
                    : formatMessage(messages.project)
                }
                options={projectAndFolderOptions}
              />
              <Box>
                <InputMultilocWithLocaleSwitcher
                  name="titleMultiloc"
                  label={formatMessage(messages.navbarItemName)}
                />
                {itemId && (
                  <Text fontStyle="italic" mt="4px" mb="0px">
                    {formatMessage(messages.resultingUrl)}: {previewUrl}
                  </Text>
                )}
              </Box>
              <Warning>
                {folderExists
                  ? formatMessage(messages.warning)
                  : formatMessage(messages.warningProjectOnly)}
              </Warning>
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

export default AddProjectOrFolderNavbarItemModal;
