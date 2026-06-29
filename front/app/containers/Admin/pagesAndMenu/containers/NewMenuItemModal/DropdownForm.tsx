import React, { useMemo, useState } from 'react';

import {
  Box,
  Button,
  colors,
  Icon,
  IconButton,
  Label,
  Select,
  Text,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { array, object } from 'yup';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useCustomPages from 'api/custom_pages/useCustomPages';
import { INavbarDropdownChild, INavbarItem } from 'api/navbar/types';
import useNavbarItems from 'api/navbar/useNavbarItems';

import useLocalize from 'hooks/useLocalize';

import { TextCell } from 'components/admin/ResourceList';
import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import SearchSelect from 'components/HookForm/SearchSelect';
import T from 'components/T';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { IItemNotInNavbar } from 'utils/navbar';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import {
  buildAvailableItems,
  DROPDOWN_CHILD_TYPES,
  getUsedPublicationIds,
  MenuItemType,
} from './availableItems';
import messages from './messages';

const MAX_ITEMS = 5;

type ChildKind = 'page' | 'project' | 'folder';

interface LocalChild {
  id: string; // target id, unique within the list
  titleMultiloc: Multiloc;
  kind: ChildKind;
  payload: INavbarDropdownChild;
}

const InfoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${colors.teal50};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 12px 16px;
`;

const Tag = styled.span`
  color: ${colors.textSecondary};
  font-size: 14px;
`;

// Maps an addable item (IItemNotInNavbar) to a local dropdown child.
const itemToLocalChild = (item: IItemNotInNavbar): LocalChild | null => {
  if (item.type === 'page') {
    return {
      id: item.pageId,
      titleMultiloc: item.titleMultiloc,
      kind: 'page',
      payload: { static_page_id: item.pageId },
    };
  }
  if (item.type === 'project') {
    return {
      id: item.itemId,
      titleMultiloc: item.titleMultiloc,
      kind: 'project',
      payload: { project_id: item.itemId },
    };
  }
  if (item.type === 'folder') {
    return {
      id: item.itemId,
      titleMultiloc: item.titleMultiloc,
      kind: 'folder',
      payload: { project_folder_id: item.itemId },
    };
  }
  return null;
};

// Maps a persisted dropdown child (from the API) to a local child.
const navbarChildToLocalChild = (
  child: INavbarItem['attributes']['children'][number]
): LocalChild => {
  if (child.static_page_id) {
    return {
      id: child.static_page_id,
      titleMultiloc: child.title_multiloc,
      kind: 'page',
      payload: { static_page_id: child.static_page_id },
    };
  }
  if (child.project_id) {
    return {
      id: child.project_id,
      titleMultiloc: child.title_multiloc,
      kind: 'project',
      payload: { project_id: child.project_id },
    };
  }
  return {
    id: child.project_folder_id ?? '',
    titleMultiloc: child.title_multiloc,
    kind: 'folder',
    payload: { project_folder_id: child.project_folder_id ?? '' },
  };
};

type Props = {
  editItem?: INavbarItem;
  onSubmit: (values: {
    title_multiloc: Multiloc;
    children: INavbarDropdownChild[];
  }) => Promise<void>;
  processing: boolean;
};

const DropdownForm = ({ editItem, onSubmit, processing }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data: navbarItems } = useNavbarItems();
  const { data: removedDefaultItems } = useNavbarItems({
    onlyRemovedDefaultItems: true,
  });
  const { data: pages } = useCustomPages();
  const { data: adminPublications } = useAdminPublications({
    remove_all_unlisted: true,
    sort: 'title_multiloc',
  });

  const [selectedType, setSelectedType] = useState<MenuItemType>('custom_page');

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(
      object({
        // Leaving titleMultiloc unseeded lets InputMultilocWithLocaleSwitcher
        // seed every configured locale, so this enforces "at least one locale".
        titleMultiloc: validateAtLeastOneLocale(
          formatMessage(messages.emptyNameError)
        ),
        children: array().min(1, formatMessage(messages.emptyDropdownError)),
      })
    ),
    defaultValues: {
      titleMultiloc: editItem?.attributes.title_multiloc,
      children: (editItem?.attributes.children ?? []).map(
        navbarChildToLocalChild
      ),
      // Drives the picker below; cleared again after each selection is added.
      itemPicker: '',
    },
  });

  // The child list lives in the form so react-hook-form validates it natively.
  const children = (methods.watch('children') ?? []) as LocalChild[];
  const setChildren = (next: LocalChild[]) =>
    methods.setValue('children', next, { shouldValidate: true });

  const flattenedAdminPublications: IAdminPublicationData[] =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    adminPublications?.pages?.flatMap((page) => page.data) ?? [];

  // When editing, ignore this dropdown's own children in the "used" computation
  // so that removing one locally makes it addable again.
  const navbarItemsForExclusion = useMemo(
    () =>
      (navbarItems?.data ?? []).map((item) =>
        item.id === editItem?.id
          ? { ...item, attributes: { ...item.attributes, children: [] } }
          : item
      ),
    [navbarItems, editItem]
  );

  const excludeStaticPageIds = useMemo(
    () => new Set(children.filter((c) => c.kind === 'page').map((c) => c.id)),
    [children]
  );
  const excludePublicationIds = useMemo(
    () => new Set(children.filter((c) => c.kind !== 'page').map((c) => c.id)),
    [children]
  );

  const usedPublicationIds = useMemo(
    () => getUsedPublicationIds(navbarItemsForExclusion),
    [navbarItemsForExclusion]
  );

  const availableItems = useMemo(() => {
    if (!navbarItems || !removedDefaultItems || !pages) return [];
    return buildAvailableItems({
      type: selectedType,
      navbarItems: navbarItemsForExclusion,
      removedDefaultItems: removedDefaultItems.data,
      pages: pages.data,
      adminPublications: flattenedAdminPublications,
      usedPublicationIds,
      excludeStaticPageIds,
      excludePublicationIds,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedType,
    navbarItemsForExclusion,
    removedDefaultItems,
    pages,
    usedPublicationIds,
    excludeStaticPageIds,
    excludePublicationIds,
  ]);

  const typeOptions = [
    { value: 'custom_page', label: formatMessage(messages.typeCustomPage) },
    { value: 'folder', label: formatMessage(messages.typeFolder) },
    { value: 'project', label: formatMessage(messages.typeProject) },
  ].filter((o) => DROPDOWN_CHILD_TYPES.includes(o.value as MenuItemType));

  const itemOptions = availableItems.map((item, index) => ({
    value: String(index),
    label: localize(item.titleMultiloc),
  }));

  const isFull = children.length >= MAX_ITEMS;

  // Items are added immediately on selection; the select then clears itself.
  const handleSelect = (option: { value: string; label: string } | null) => {
    if (!option || isFull) return;
    const available = availableItems[Number(option.value)];
    const child = available && itemToLocalChild(available.item);
    if (!child) return;
    setChildren([...children, child]);
  };

  const handleRemove = (id: string) => {
    setChildren(children.filter((c) => c.id !== id));
  };

  const handleReorder = (id: string, newOrder: number) => {
    const idx = children.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const next = [...children];
    const [moved] = next.splice(idx, 1);
    next.splice(newOrder, 0, moved);
    setChildren(next);
  };

  const tagFor = (kind: ChildKind) => {
    if (kind === 'page') return formatMessage(messages.pageTag);
    if (kind === 'project') return formatMessage(messages.projectTag);
    return formatMessage(messages.folderTag);
  };

  const sortableItems = children.map((child, index) => ({
    ...child,
    attributes: { ordering: index },
  }));

  // Reached only when the schema passes (title + at least one item).
  const handleSubmit = async ({
    titleMultiloc,
  }: {
    titleMultiloc?: Multiloc;
  }) => {
    try {
      await onSubmit({
        title_multiloc: titleMultiloc ?? {},
        children: children.map((c) => c.payload),
      });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <Box mt="24px">
      <Text color="textSecondary" mt="0px">
        {formatMessage(messages.dropdownSubtitle)}
      </Text>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box display="flex" flexDirection="column" gap="24px">
            <InputMultilocWithLocaleSwitcher
              name="titleMultiloc"
              label={formatMessage(messages.nameInNavbar)}
            />

            <Box>
              <Label>{formatMessage(messages.addItems)}</Label>
              <Box display="flex" gap="16px" alignItems="flex-start">
                <Box flex="1">
                  <Select
                    value={selectedType}
                    options={typeOptions}
                    onChange={(option) =>
                      setSelectedType(option.value as MenuItemType)
                    }
                  />
                </Box>
                <Box flex="1">
                  <SearchSelect
                    name="itemPicker"
                    options={itemOptions}
                    isDisabled={isFull}
                    placeholder={formatMessage(messages.selectItemPlaceholder)}
                    // Selecting an option adds it to the list, then clears the
                    // picker so it's ready for the next selection.
                    onChange={(option) => {
                      handleSelect(option);
                      methods.setValue('itemPicker', '');
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <InfoBox>
              <Icon
                name="info-outline"
                width="20px"
                height="20px"
                fill={colors.teal500}
              />
              <Text m="0px" color="textSecondary">
                {formatMessage(messages.upToFiveItems)}
              </Text>
            </InfoBox>

            {children.length > 0 && (
              <Box>
                <Label>{formatMessage(messages.inThisMenu)}</Label>
                <SortableList items={sortableItems} onReorder={handleReorder}>
                  {({ itemsList, handleDragRow, handleDropRow }) => (
                    <>
                      {itemsList.map((item, i) => (
                        <SortableRow
                          key={item.id}
                          id={item.id}
                          index={i}
                          moveRow={handleDragRow}
                          dropRow={handleDropRow}
                          isLastItem={i === itemsList.length - 1}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            width="100%"
                          >
                            <TextCell className="expand">
                              <T value={item.titleMultiloc} />
                            </TextCell>
                            <Box display="flex" alignItems="center" gap="16px">
                              <Tag>{tagFor(item.kind)}</Tag>
                              <IconButton
                                iconName="close"
                                onClick={() => handleRemove(item.id)}
                                a11y_buttonActionMessage={formatMessage(
                                  messages.removeItem
                                )}
                                iconColor={colors.textSecondary}
                                iconColorOnHover={colors.red600}
                                iconWidth="16px"
                                iconHeight="16px"
                              />
                            </Box>
                          </Box>
                        </SortableRow>
                      ))}
                    </>
                  )}
                </SortableList>
              </Box>
            )}

            {methods.formState.errors.children && (
              <Error
                text={
                  (methods.formState.errors.children as { message?: string })
                    .message
                }
              />
            )}

            <Box display="flex">
              <Button
                type="submit"
                processing={processing || methods.formState.isSubmitting}
              >
                {formatMessage(messages.saveButton)}
              </Button>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default DropdownForm;
