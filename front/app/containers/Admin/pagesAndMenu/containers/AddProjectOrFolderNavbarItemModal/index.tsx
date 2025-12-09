import React, { useEffect } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object, string } from 'yup';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAddNavbarItem from 'api/navbar/useAddNavbarItem';

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

  const { data: adminPublications } = useAdminPublications({
    remove_all_unlisted: true,
    sort: 'title_multiloc',
  });

  const flattenedAdminPublications: IAdminPublicationData[] =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    adminPublications?.pages?.flatMap((page) => page.data) ?? [];

  const anyFolderExists = flattenedAdminPublications.some(
    (adminPublication) =>
      adminPublication.relationships.publication.data.type === 'folder'
  );

  const { data: appConfig } = useAppConfiguration();

  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();

  const schema = object({
    itemId: string().required(
      anyFolderExists
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
      const selectedAdminPublication = flattenedAdminPublications.find(
        (adminPublication) => adminPublication.id === formValues.itemId
      );

      const type =
        selectedAdminPublication?.relationships.publication.data.type;
      const id = selectedAdminPublication?.relationships.publication.data.id;
      const titleMultiloc = formValues.titleMultiloc;

      await addNavbarItem({
        itemId: id,
        type,
        titleMultiloc,
      } as IItemNotInNavbar);

      handleOnClose();
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const projectAndFolderOptions = flattenedAdminPublications.map((item) => ({
    value: item.id,
    label: localize(item.attributes.publication_title_multiloc),
  }));

  const handleOnClose = () => {
    methods.reset({
      itemId: '',
      titleMultiloc: {},
    });
    onClose();
  };

  const itemId = methods.watch('itemId');

  const getSelectedItem = () => {
    const selectedAdminPublication = flattenedAdminPublications.find(
      (adminPublication) => adminPublication.id === itemId
    );
    if (!selectedAdminPublication) return null;

    const type = selectedAdminPublication.relationships.publication.data.type;

    return {
      ...selectedAdminPublication,
      type,
    };
  };

  const selectedItem = getSelectedItem();

  // When the selected item changes, update the titleMultiloc fields
  // to the item's current titleMultiloc values.
  useEffect(() => {
    const titleMultiloc =
      selectedItem?.attributes.publication_title_multiloc || {};
    methods.setValue('titleMultiloc', titleMultiloc);
  }, [selectedItem?.attributes.publication_title_multiloc, methods]);

  const hostName = appConfig?.data.attributes.host;

  const slug = selectedItem?.attributes.publication_slug;
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
        anyFolderExists
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
                  anyFolderExists
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
                {anyFolderExists
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
