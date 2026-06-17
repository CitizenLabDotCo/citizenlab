import React, { useEffect, useMemo } from 'react';

import {
  Box,
  colors,
  Label,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import ReactSelect from 'react-select';
import styled, { useTheme } from 'styled-components';
import { Multiloc } from 'typings';
import { object, string } from 'yup';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useCustomPages from 'api/custom_pages/useCustomPages';
import useAddNavbarItem from 'api/navbar/useAddNavbarItem';
import { INavbarDropdownChild, INavbarItem } from 'api/navbar/types';
import useNavbarItems from 'api/navbar/useNavbarItems';
import useUpsertNavbarDropdown from 'api/navbar/useUpsertNavbarDropdown';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Select from 'components/HookForm/Select';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';
import selectStyles from 'components/UI/MultipleSelect/styles';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import {
  buildAvailableItems,
  getUsedPublicationIds,
  MenuItemType,
} from './availableItems';
import DropdownForm from './DropdownForm';
import messages from './messages';

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
  // When present, the modal edits this dropdown ('menu') item.
  editItem?: INavbarItem;
};

const NewMenuItemModal = ({ opened, onClose, editItem }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();
  const theme = useTheme();

  const { mutateAsync: addNavbarItem } = useAddNavbarItem();
  const { mutateAsync: upsertDropdown, isLoading: dropdownProcessing } =
    useUpsertNavbarDropdown();
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

  const isEditing = !!editItem;
  const [activeTab, setActiveTab] = React.useState<'single' | 'dropdown'>(
    isEditing ? 'dropdown' : 'single'
  );

  const flattenedAdminPublications: IAdminPublicationData[] =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    adminPublications?.pages?.flatMap((page) => page.data) ?? [];

  const usedPublicationIds = useMemo(
    () => getUsedPublicationIds(navbarItems?.data ?? []),
    [navbarItems]
  );

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

  const availableItems = useMemo(() => {
    if (!navbarItems || !removedDefaultItems || !pages) return [];
    return buildAvailableItems({
      type,
      navbarItems: navbarItems.data,
      removedDefaultItems: removedDefaultItems.data,
      pages: pages.data,
      adminPublications: flattenedAdminPublications,
      usedPublicationIds,
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
    setActiveTab(isEditing ? 'dropdown' : 'single');
    onClose();
  };

  const onSingleSubmit = async (formValues: { titleMultiloc: Multiloc }) => {
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

  const onDropdownSubmit = async (values: {
    title_multiloc: Multiloc;
    children: INavbarDropdownChild[];
  }) => {
    await upsertDropdown({ id: editItem?.id, ...values });
    handleClose();
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
      header={formatMessage(
        isEditing ? messages.dropdownMenu : messages.modalTitle
      )}
    >
      <Box p="24px">
        {!isEditing && (
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
        )}

        {activeTab === 'single' && !isEditing ? (
          <Box mt="24px">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSingleSubmit)}>
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
                        <ReactSelect
                          value={
                            itemOptions.find((o) => o.value === itemId) ?? null
                          }
                          options={itemOptions}
                          onChange={(option) =>
                            methods.setValue('itemId', option?.value ?? '', {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          isSearchable
                          isClearable
                          blurInputOnSelect
                          placeholder={formatMessage(
                            messages.selectItemPlaceholder
                          )}
                          menuPosition="fixed"
                          menuPlacement="auto"
                          styles={{
                            ...selectStyles(theme),
                            menuPortal: (base) => ({ ...base, zIndex: 1001 }),
                            control: (base, { isFocused }) => ({
                              ...base,
                              minHeight: `${stylingConsts.inputHeight}px`,
                              borderWidth: isFocused ? '2px' : '1px',
                              borderColor: isFocused
                                ? theme.colors.tenantPrimary
                                : colors.borderDark,
                              boxShadow: 'none',
                              '&:hover': {
                                borderColor: isFocused
                                  ? theme.colors.tenantPrimary
                                  : colors.black,
                              },
                            }),
                            placeholder: (base) => ({
                              ...base,
                              color: colors.placeholder,
                            }),
                          }}
                        />
                      </Box>
                    </Box>
                    {methods.formState.errors.itemId && (
                      <Error
                        marginTop="8px"
                        text={methods.formState.errors.itemId.message}
                      />
                    )}
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
          <DropdownForm
            editItem={editItem}
            onSubmit={onDropdownSubmit}
            processing={dropdownProcessing}
          />
        )}
      </Box>
    </Modal>
  );
};

export default NewMenuItemModal;
