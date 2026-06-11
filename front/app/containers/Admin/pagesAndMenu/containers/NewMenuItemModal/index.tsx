import React, { useEffect, useMemo } from 'react';

import { Box, colors, Label, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { object, string } from 'yup';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { ICustomPageData, TCustomPageCode } from 'api/custom_pages/types';
import useCustomPages from 'api/custom_pages/useCustomPages';
import useAddNavbarItem from 'api/navbar/useAddNavbarItem';
import useNavbarItems from 'api/navbar/useNavbarItems';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Select from 'components/HookForm/Select';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import getItemsNotInNavbar, { IItemNotInNavbar } from 'utils/navbar';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from './messages';

type MenuItemType = 'custom_page' | 'default_page' | 'folder' | 'project';

// An option that is selectable in the second dropdown, paired with the
// IItemNotInNavbar payload used to create the navbar item.
interface AvailableItem {
  titleMultiloc: Multiloc;
  slug: string | null;
  item: IItemNotInNavbar;
}

// Policy pages (terms, privacy, cookie) are managed in Settings, not here.
const FIXED_PAGES_SET = new Set<TCustomPageCode>([
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
]);
const isNotFixedPage = (page: ICustomPageData) =>
  !FIXED_PAGES_SET.has(page.attributes.code);

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  cursor: pointer;
  padding: 12px 16px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  background: ${({ active }) => (active ? colors.primary : 'transparent')};
  color: ${({ active }) => (active ? colors.white : colors.textSecondary)};
  transition: all 80ms ease-out;
`;

const TabsBar = styled.div`
  display: flex;
  border: 1px solid ${colors.borderDark};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

type Props = {
  opened: boolean;
  onClose: () => void;
};

const NewMenuItemModal = ({ opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();

  const { mutateAsync: addNavbarItem } = useAddNavbarItem();
  const { data: navbarItems } = useNavbarItems();
  const { data: removedDefaultItems } = useNavbarItems({
    onlyRemovedDefaultItems: true,
  });
  const { data: pages } = useCustomPages();
  const { data: appConfig } = useAppConfiguration();
  const { data: adminPublications } = useAdminPublications({
    remove_all_unlisted: true,
    sort: 'title_multiloc',
  });

  const [activeTab, setActiveTab] = React.useState<'single' | 'dropdown'>(
    'single'
  );

  const flattenedAdminPublications: IAdminPublicationData[] =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    adminPublications?.pages?.flatMap((page) => page.data) ?? [];

  // Project/folder ids already present in the navbar, to filter them out.
  const usedPublicationIds = useMemo(() => {
    const ids = new Set<string>();
    navbarItems?.data.forEach((navbarItem) => {
      const projectId = navbarItem.relationships.project.data?.id;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const folderId = navbarItem.relationships.project_folder?.data?.id;
      if (projectId) ids.add(projectId);
      if (folderId) ids.add(folderId);
    });
    return ids;
  }, [navbarItems]);

  const schema = object({
    type: string().required(),
    itemId: string().required(formatMessage(messages.emptyItemError)),
    titleMultiloc: validateMultilocForEveryLocale(
      formatMessage(messages.emptyNameError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'custom_page' as MenuItemType,
      itemId: '',
      titleMultiloc: {} as Multiloc,
    },
  });

  const type = methods.watch('type');
  const itemId = methods.watch('itemId');

  // Build the list of selectable items for the currently selected type.
  const availableItems: AvailableItem[] = useMemo(() => {
    if (!navbarItems || !removedDefaultItems || !pages) return [];

    const itemsNotInNavbar = getItemsNotInNavbar(
      navbarItems.data,
      removedDefaultItems.data,
      pages.data.filter(isNotFixedPage)
    );

    if (type === 'custom_page') {
      return itemsNotInNavbar
        .filter((item) => item.type === 'page')
        .map((item) => ({
          titleMultiloc: item.titleMultiloc,
          slug: item.slug,
          item,
        }));
    }

    if (type === 'default_page') {
      return itemsNotInNavbar
        .filter((item) => item.type === 'default_item')
        .map((item) => ({
          titleMultiloc: item.titleMultiloc,
          slug: item.slug,
          item,
        }));
    }

    // project / folder
    const publicationType = type === 'project' ? 'project' : 'folder';
    return flattenedAdminPublications
      .filter(
        (publication) =>
          publication.relationships.publication.data.type === publicationType &&
          !usedPublicationIds.has(publication.relationships.publication.data.id)
      )
      .map((publication) => {
        const publicationId = publication.relationships.publication.data.id;
        const titleMultiloc = publication.attributes.publication_title_multiloc;
        return {
          titleMultiloc,
          slug: publication.attributes.publication_slug,
          item: {
            type: publicationType,
            itemId: publicationId,
            titleMultiloc,
            slug: publication.attributes.publication_slug,
          } as IItemNotInNavbar,
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, navbarItems, removedDefaultItems, pages, usedPublicationIds]);

  // itemId holds the index into availableItems (as a string). Binding the
  // dropdown to the array index sidesteps any unreliable/duplicate data ids.
  const selectedItem =
    itemId === '' ? undefined : availableItems[Number(itemId)];

  // Reset the item selection whenever the type changes.
  useEffect(() => {
    methods.setValue('itemId', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // When the selected item changes, prefill the name field with its title.
  useEffect(() => {
    methods.setValue('titleMultiloc', selectedItem?.titleMultiloc || {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const handleClose = () => {
    methods.reset({ type: 'custom_page', itemId: '', titleMultiloc: {} });
    setActiveTab('single');
    onClose();
  };

  const onFormSubmit = async (formValues: { titleMultiloc: Multiloc }) => {
    if (!selectedItem) return;
    try {
      await addNavbarItem({
        ...selectedItem.item,
        titleMultiloc: formValues.titleMultiloc,
      });
      handleClose();
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const typeOptions = [
    { value: 'custom_page', label: formatMessage(messages.typeCustomPage) },
    { value: 'default_page', label: formatMessage(messages.typeDefaultPage) },
    { value: 'folder', label: formatMessage(messages.typeFolder) },
    { value: 'project', label: formatMessage(messages.typeProject) },
  ];

  const itemOptions = availableItems.map((item, index) => ({
    value: String(index),
    label: localize(item.titleMultiloc),
  }));

  const isProjectOrFolder = type === 'project' || type === 'folder';
  const hostName = appConfig?.data.attributes.host;
  const previewUrl =
    selectedItem && isProjectOrFolder
      ? type === 'project'
        ? `${hostName}/${locale}/projects/${selectedItem.slug}`
        : `${hostName}/${locale}/folders/${selectedItem.slug}`
      : '';

  return (
    <Modal
      opened={opened}
      close={handleClose}
      header={formatMessage(messages.modalTitle)}
    >
      <Box p="24px">
        <TabsBar>
          <Tab
            type="button"
            active={activeTab === 'single'}
            onClick={() => setActiveTab('single')}
            data-cy="e2e-new-menu-item-single-tab"
          >
            {formatMessage(messages.singleItem)}
          </Tab>
          <Tab
            type="button"
            active={activeTab === 'dropdown'}
            onClick={() => setActiveTab('dropdown')}
            data-cy="e2e-new-menu-item-dropdown-tab"
          >
            {formatMessage(messages.dropdownMenu)}
          </Tab>
        </TabsBar>

        {activeTab === 'single' ? (
          <Box mt="24px">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onFormSubmit)}>
                <Box display="flex" flexDirection="column" gap="24px">
                  <Box>
                    <Label htmlFor="type">
                      {formatMessage(messages.selectType)}
                    </Label>
                    <Box display="flex" gap="16px">
                      <Box flex="1">
                        <Select name="type" options={typeOptions} />
                      </Box>
                      <Box flex="1">
                        <Select
                          name="itemId"
                          placeholder={formatMessage(
                            messages.selectItemPlaceholder
                          )}
                          options={itemOptions}
                        />
                      </Box>
                    </Box>
                    {itemOptions.length === 0 && (
                      <Text color="textSecondary" mt="8px" mb="0px">
                        {formatMessage(messages.noItemsAvailable)}
                      </Text>
                    )}
                  </Box>

                  <Box>
                    <InputMultilocWithLocaleSwitcher
                      name="titleMultiloc"
                      label={formatMessage(messages.navbarItemName)}
                    />
                    {selectedItem && isProjectOrFolder && (
                      <Text fontStyle="italic" mt="4px" mb="0px">
                        {formatMessage(messages.resultingUrl)}: {previewUrl}
                      </Text>
                    )}
                  </Box>

                  {isProjectOrFolder && (
                    <Warning>{formatMessage(messages.accessWarning)}</Warning>
                  )}

                  <Box display="flex">
                    <ButtonWithLink
                      type="submit"
                      icon="plus-circle"
                      processing={methods.formState.isSubmitting}
                    >
                      {formatMessage(messages.addButton)}
                    </ButtonWithLink>
                  </Box>
                </Box>
              </form>
            </FormProvider>
          </Box>
        ) : (
          // Dropdown menu tab — intentionally empty for now.
          <Box mt="24px" minHeight="120px" />
        )}
      </Box>
    </Modal>
  );
};

export default NewMenuItemModal;
