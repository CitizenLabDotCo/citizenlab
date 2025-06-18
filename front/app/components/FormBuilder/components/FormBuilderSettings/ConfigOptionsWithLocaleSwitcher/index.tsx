import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Label,
  Button,
  LocaleSwitcher,
  Toggle,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { SupportedLocale, CLError, RHFErrors } from 'typings';

import { useCustomFieldOptionImages } from 'api/content_field_option_images/useCustomFieldOptionImage';
import { ICustomFieldInputType, IOptionsType } from 'api/custom_fields/types';

import usePrevious from 'hooks/usePrevious';

import { List, Row } from 'components/admin/ResourceList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import { SectionField } from 'components/admin/Section';
import Error, { TFieldName } from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { generateTempId, isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import SelectFieldOption, { OptionImageType } from './SelectFieldOption';
import {
  getAddButtonText,
  getFieldLabelText,
  ListType,
  allowMultilinePaste,
  updateFormOnMultlinePaste,
  inputTypesNoOther,
} from './utils';

interface Props {
  name: string;
  onSelectedLocaleChange?: (locale: SupportedLocale) => void;
  locales: SupportedLocale[];
  allowDeletingAllOptions?: boolean;
  platformLocale: SupportedLocale;
  inputType: ICustomFieldInputType;
  listType?: ListType;
}

const ConfigSelectWithLocaleSwitcher = ({
  onSelectedLocaleChange,
  name,
  locales,
  allowDeletingAllOptions = false,
  listType = 'default',
  platformLocale,
  inputType,
}: Props) => {
  const {
    control,
    formState: { errors: formContextErrors },
    trigger,
  } = useFormContext();

  // Handles drag and drop
  const { move, update, append, remove, insert } = useFieldArray({
    name,
  });

  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale | null>(
    platformLocale
  );
  const { formatMessage } = useIntl();
  const selectOptions = useWatch({ name });

  const imageIds = selectOptions
    .filter((selectOption) => selectOption?.image_id)
    .map((selectOption) => selectOption?.image_id);
  const customFieldOptionImages = useCustomFieldOptionImages(imageIds);
  const prevImageQueries = usePrevious(customFieldOptionImages);
  const [optionImages, setOptionImages] = useState<OptionImageType>();

  useEffect(() => {
    if (
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      customFieldOptionImages &&
      customFieldOptionImages.length !== prevImageQueries?.length
    ) {
      (async () => {
        const promises = customFieldOptionImages.map(
          async (customFieldOptionImage) => {
            if (
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              !customFieldOptionImage?.data?.data.attributes.versions.medium
            ) {
              return;
            }
            const imageData = await convertUrlToUploadFile(
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              customFieldOptionImage?.data?.data.attributes.versions.medium
            );
            return { [customFieldOptionImage.data.data.id]: imageData };
          }
        );
        const optionImageArray = await Promise.all(promises);
        const optionImagesObject = Object.assign({}, ...optionImageArray);
        setOptionImages(optionImagesObject);
      })();
    }
  }, [customFieldOptionImages, prevImageQueries]);

  // Handles locale change
  useEffect(() => {
    setSelectedLocale(platformLocale);
    onSelectedLocaleChange?.(platformLocale);
  }, [platformLocale, onSelectedLocaleChange]);

  const addOption = useCallback(() => {
    const otherOptionIndex = selectOptions.findIndex(
      (choice) => choice.other === true
    );
    const hasOtherOption = otherOptionIndex !== -1;

    const insertIndex = hasOtherOption
      ? otherOptionIndex
      : selectOptions.length;

    const newOption = {
      title_multiloc: {},
      ...(inputType === 'multiselect_image' && { image_id: '' }),
    };

    insert(insertIndex, newOption);
    document.getElementById(`e2e-option-input-${insertIndex}`)?.focus();
  }, [insert, inputType, selectOptions]);

  // Handles adding an option when pressing enter
  // It only works when the focus is on the input fields
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        document
          .getElementById('select-options')
          ?.contains(document.activeElement) &&
        event.key === 'Enter'
      ) {
        addOption();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [addOption]);

  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: SupportedLocale) => {
      setSelectedLocale(newSelectedLocale);
      onSelectedLocaleChange?.(newSelectedLocale);
    },
    [onSelectedLocaleChange]
  );

  const handleDragRow = useCallback(
    (fromIndex: number, toIndex: number) => {
      move(fromIndex, toIndex);
    },
    [move]
  );

  const removeOption = useCallback(
    (index: number) => {
      remove(index);
      trigger();
    },
    [remove, trigger]
  );

  const addOtherOption = useCallback(() => {
    append({
      title_multiloc: { [platformLocale]: formatMessage(messages.other) },
      other: true,
    });
  }, [append, platformLocale, formatMessage]);

  const updateChoice = (choice: IOptionsType, index: number) => {
    update(index, {
      ...choice,
      ...(!choice.id && !choice.temp_id ? { temp_id: generateTempId() } : {}),
    });
  };

  const handleMultilinePaste = useCallback(
    (lines, index) => {
      if (!selectedLocale) return;
      if (lines.length > 20) return;

      updateFormOnMultlinePaste({
        update,
        append,
        locale: selectedLocale,
        lines,
        index,
        options: selectOptions,
      });
    },
    [update, append, selectOptions, selectedLocale]
  );

  const defaultOptionValues = [{}];
  const errors = get(formContextErrors, name) as RHFErrors;
  const apiError = errors?.error && ([errors] as CLError[]);
  const validationError = errors?.message;

  const toggleOtherOption = useCallback(() => {
    const hasOtherOption = selectOptions.some(
      (choice) => choice.other === true
    );
    if (hasOtherOption) {
      removeOption(selectOptions.length - 1);
    } else {
      addOtherOption();
    }
  }, [selectOptions, addOtherOption, removeOption]);

  if (!selectedLocale) {
    return null;
  }

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultOptionValues}
        render={({ field: { ref: _ref, value: options, onBlur } }) => {
          const choices: IOptionsType[] = options;
          const hasOtherOption = choices.some(
            (choice) => choice.other === true
          );

          const canDeleteLastOption =
            allowDeletingAllOptions || choices.length > 1;
          const validatedValues = choices.map((choice) => ({
            title_multiloc: choice.title_multiloc,
          }));

          return (
            <Box
              as="fieldset"
              border="none"
              p="0"
              m="0"
              onBlur={() => {
                onBlur();
                trigger();
              }}
              id="select-options"
            >
              <SectionField>
                <Box
                  display="flex"
                  flexWrap="wrap"
                  justifyContent="space-between"
                  marginBottom="12px"
                >
                  <Box marginTop="4px" marginRight="8px">
                    <Label>{formatMessage(getFieldLabelText(listType))}</Label>
                  </Box>
                  <Box>
                    <LocaleSwitcher
                      onSelectedLocaleChange={handleOnSelectedLocaleChange}
                      locales={!isNilOrError(locales) ? locales : []}
                      selectedLocale={selectedLocale}
                      values={validatedValues}
                    />
                  </Box>
                </Box>
                <DndProvider backend={HTML5Backend}>
                  {/* TODO: Fix this the next time the file is edited. */}
                  {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                  <List key={choices?.length}>
                    {choices // TODO: Fix this the next time the file is edited.
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                      ?.sort((a, b) => {
                        const aValue = a.other ? 1 : 0;
                        const bValue = b.other ? 1 : 0;

                        return aValue - bValue;
                      })
                      .map((choice, index) => {
                        const multilinePasteAllowed = allowMultilinePaste({
                          options,
                          index,
                          locale: selectedLocale,
                        });

                        return (
                          <Box key={index}>
                            {choice.other === true ? (
                              <Row
                                key={choice.id || choice.temp_id}
                                isLastItem={true}
                              >
                                <SelectFieldOption
                                  choice={choice}
                                  index={index}
                                  locale={selectedLocale}
                                  inputType={inputType}
                                  canDeleteLastOption={canDeleteLastOption}
                                  removeOption={removeOption}
                                  onChoiceUpdate={updateChoice}
                                  optionImages={optionImages}
                                />
                              </Row>
                            ) : (
                              <SortableRow
                                id={
                                  choice.temp_id
                                    ? `${choice.temp_id}-${index}`
                                    : `${choice.id}-${index}`
                                }
                                index={index}
                                moveRow={handleDragRow}
                                dragByHandle
                              >
                                <SelectFieldOption
                                  choice={choice}
                                  index={index}
                                  locale={selectedLocale}
                                  inputType={inputType}
                                  canDeleteLastOption={canDeleteLastOption}
                                  optionImages={optionImages}
                                  removeOption={removeOption}
                                  onChoiceUpdate={updateChoice}
                                  onMultilinePaste={
                                    multilinePasteAllowed
                                      ? handleMultilinePaste
                                      : undefined
                                  }
                                />
                              </SortableRow>
                            )}
                          </Box>
                        );
                      })}
                  </List>
                </DndProvider>
                <Button
                  icon="plus-circle"
                  buttonStyle="secondary-outlined"
                  data-cy="e2e-add-answer"
                  onClick={addOption}
                  text={formatMessage(getAddButtonText(listType))}
                  type="button"
                />

                {validationError && (
                  <Error
                    marginTop="8px"
                    marginBottom="8px"
                    text={validationError}
                    scrollIntoView={false}
                  />
                )}
                {apiError && (
                  <Error
                    fieldName={name as TFieldName}
                    apiErrors={apiError}
                    marginTop="8px"
                    marginBottom="8px"
                    scrollIntoView={false}
                  />
                )}

                {!inputTypesNoOther.includes(inputType) && (
                  <Box mt="24px" data-cy="e2e-other-option-toggle">
                    <Toggle
                      label={
                        <Box display="flex">
                          {formatMessage(messages.otherOption)}
                          <Box pl="4px">
                            <IconTooltip
                              placement="top-start"
                              content={formatMessage(
                                messages.otherOptionTooltip
                              )}
                            />
                          </Box>
                        </Box>
                      }
                      checked={hasOtherOption}
                      onChange={toggleOtherOption}
                    />
                  </Box>
                )}
              </SectionField>
            </Box>
          );
        }}
      />
    </>
  );
};

export default ConfigSelectWithLocaleSwitcher;
