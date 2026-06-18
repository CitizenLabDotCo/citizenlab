import React, { useMemo, useState } from 'react';

import {
  Box,
  Button,
  colors,
  Label,
  Select,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import ReactSelect from 'react-select';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';
import { object, string } from 'yup';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useCustomPages from 'api/custom_pages/useCustomPages';
import useNavbarItems from 'api/navbar/useNavbarItems';

import useLocalize from 'hooks/useLocalize';

import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Error from 'components/UI/Error';
import selectStyles from 'components/UI/MultipleSelect/styles';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { IItemNotInNavbar } from 'utils/navbar';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import {
  buildAvailableItems,
  getUsedPublicationIds,
  MenuItemType,
} from './availableItems';
import messages from './messages';

type Props = {
  onSubmit: (item: IItemNotInNavbar) => Promise<void>;
  processing: boolean;
};

const SingleItemForm = ({ onSubmit, processing }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const theme = useTheme();

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
        itemId: string().required(formatMessage(messages.emptyItemError)),
        // Leaving titleMultiloc unseeded lets InputMultilocWithLocaleSwitcher
        // seed every configured locale, so this enforces "at least one locale".
        titleMultiloc: validateAtLeastOneLocale(
          formatMessage(messages.emptyNameError)
        ),
      })
    ),
    defaultValues: {
      itemId: '',
    },
  });

  const itemId = methods.watch('itemId');

  const availableItems = useMemo(() => {
    const flattenedAdminPublications: IAdminPublicationData[] =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      adminPublications?.pages?.flatMap((page) => page.data) ?? [];
    if (!navbarItems || !removedDefaultItems || !pages) return [];
    return buildAvailableItems({
      type: selectedType,
      navbarItems: navbarItems.data,
      removedDefaultItems: removedDefaultItems.data,
      pages: pages.data,
      adminPublications: flattenedAdminPublications,
      usedPublicationIds: getUsedPublicationIds(navbarItems.data),
    });
  }, [
    selectedType,
    navbarItems,
    removedDefaultItems,
    pages,
    adminPublications,
  ]);

  // itemId holds the index into availableItems (as a string). Binding the
  // dropdown to the array index sidesteps any unreliable/duplicate data ids.
  const selectedItem =
    itemId === '' ? undefined : availableItems[Number(itemId)];

  const handleTypeChange = (type: MenuItemType) => {
    setSelectedType(type);
    // The previous selection no longer maps to a valid index once the type
    // (and therefore the available list) changes, so clear it.
    methods.setValue('itemId', '');
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

  const isProjectOrFolder =
    selectedType === 'project' || selectedType === 'folder';

  // Reached only when the schema passes (title + a selected item).
  const handleSubmit = async ({
    titleMultiloc,
  }: {
    titleMultiloc?: Multiloc;
  }) => {
    if (!selectedItem) return;
    try {
      await onSubmit({
        ...selectedItem.item,
        titleMultiloc: titleMultiloc ?? {},
      });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <Box mt="24px">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box display="flex" flexDirection="column" gap="24px">
            <Box>
              <InputMultilocWithLocaleSwitcher
                name="titleMultiloc"
                label={formatMessage(messages.navbarItemName)}
              />
            </Box>

            <Box>
              <Label htmlFor="type">{formatMessage(messages.selectType)}</Label>
              <Box display="flex" gap="16px">
                <Box flex="1">
                  <Select
                    value={selectedType}
                    options={typeOptions}
                    onChange={(option) =>
                      handleTypeChange(option.value as MenuItemType)
                    }
                  />
                </Box>
                <Box flex="1">
                  <ReactSelect
                    value={itemOptions.find((o) => o.value === itemId) ?? null}
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
                    placeholder={formatMessage(messages.selectItemPlaceholder)}
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

            {isProjectOrFolder && (
              <Warning>{formatMessage(messages.accessWarning)}</Warning>
            )}

            <Box display="flex">
              <Button
                type="submit"
                icon="plus-circle"
                processing={processing || methods.formState.isSubmitting}
              >
                {formatMessage(messages.addButton)}
              </Button>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default SingleItemForm;
