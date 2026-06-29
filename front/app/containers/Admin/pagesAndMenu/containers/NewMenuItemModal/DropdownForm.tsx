import React, { useMemo, useState } from 'react';

import {
  Badge,
  Box,
  Button,
  colors,
  IconButton,
  Label,
  Select,
  Text,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { array, object, string } from 'yup';

import {
  INavbarChild,
  INavbarDropdownChild,
  INavbarItem,
} from 'api/navbar/types';

import useLocalize from 'hooks/useLocalize';

import { TextCell } from 'components/admin/ResourceList';
import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import SearchSelect from 'components/HookForm/SearchSelect';
import T from 'components/T';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { IItemNotInNavbar } from 'utils/navbar';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';
import useAvailableItems, {
  DROPDOWN_CHILD_TYPES,
  MenuItemType,
} from './useAvailableItems';

const MAX_ITEMS = 5;

type ChildKind = 'page' | 'project' | 'folder';

interface LocalChild {
  id: string; // target id, unique within the list
  titleMultiloc: Multiloc;
  kind: ChildKind;
  payload: INavbarDropdownChild;
}

// Single source of truth for the kind ↔ payload-field correspondence, used
// both to build a payload (kind → field) and to detect a kind (field → kind).
const KINDS = ['page', 'project', 'folder'] as const;
const PAYLOAD_KEY: Record<ChildKind, keyof INavbarDropdownChild> = {
  page: 'static_page_id',
  project: 'project_id',
  folder: 'project_folder_id',
};

const makeLocalChild = (
  kind: ChildKind,
  id: string,
  titleMultiloc: Multiloc
): LocalChild => ({
  id,
  titleMultiloc,
  kind,
  payload: { [PAYLOAD_KEY[kind]]: id },
});

// Maps an addable item (IItemNotInNavbar) to a local dropdown child.
const itemToLocalChild = (item: IItemNotInNavbar): LocalChild | null => {
  if (item.type === 'page') {
    return makeLocalChild('page', item.pageId, item.titleMultiloc);
  }
  if (item.type === 'project' || item.type === 'folder') {
    return makeLocalChild(item.type, item.itemId, item.titleMultiloc);
  }
  return null;
};

// Maps a persisted dropdown child (from the API) to a local child.
const navbarChildToLocalChild = (child: INavbarChild): LocalChild => {
  const kind = KINDS.find((k) => child[PAYLOAD_KEY[k]]) ?? 'folder';
  return makeLocalChild(
    kind,
    child[PAYLOAD_KEY[kind]] ?? '',
    child.title_multiloc
  );
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

  const [selectedType, setSelectedType] = useState<MenuItemType>('custom_page');

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(
      object({
        titleMultiloc: validateAtLeastOneLocale(
          formatMessage(messages.emptyNameError)
        ),
        children: array().min(1, formatMessage(messages.emptyDropdownError)),
        // UI-only field that drives the picker below; not validated.
        itemPicker: string(),
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
  const watchedChildren = methods.watch('children');
  const children = useMemo(
    () => (watchedChildren ?? []) as LocalChild[],
    [watchedChildren]
  );
  const setChildren = (next: LocalChild[]) =>
    methods.setValue('children', next, { shouldValidate: true });

  const excludeStaticPageIds = useMemo(
    () => new Set(children.filter((c) => c.kind === 'page').map((c) => c.id)),
    [children]
  );
  const excludePublicationIds = useMemo(
    () => new Set(children.filter((c) => c.kind !== 'page').map((c) => c.id)),
    [children]
  );

  const availableItems = useAvailableItems({
    type: selectedType,
    editItem,
    excludeStaticPageIds,
    excludePublicationIds,
  });

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
    const available = availableItems.at(Number(option.value));
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

  const tagFor = (kind: ChildKind) =>
    formatMessage(
      {
        page: messages.pageTag,
        project: messages.projectTag,
        folder: messages.folderTag,
      }[kind]
    );

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

            <Warning>{formatMessage(messages.upToFiveItems)}</Warning>

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
                              <Badge className="inverse">
                                {tagFor(item.kind)}
                              </Badge>
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
