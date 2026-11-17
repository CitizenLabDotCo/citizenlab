import React, { useState, useCallback } from 'react';

import {
  Box,
  Label,
  Button,
  LocaleSwitcher,
  Icon,
  Input,
} from '@citizenlab/cl2-component-library';
import { cloneDeep, get } from 'lodash-es';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { SupportedLocale, CLError, RHFErrors, Multiloc } from 'typings';

import { IOptionsType } from 'api/custom_fields/types';

import { List } from 'components/admin/ResourceList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import { SectionField } from 'components/admin/Section';
import Error, { TFieldName } from 'components/UI/Error';

import { isNilOrError, generateTempId } from 'utils/helperUtils';

export type Option = {
  id?: string;
  temp_id?: string;
  title_multiloc: Multiloc;
};

interface Props {
  name: string;
  onSelectedLocaleChange?: (locale: SupportedLocale) => void;
  locales: SupportedLocale[];
  allowDeletingAllOptions?: boolean;
  platformLocale: SupportedLocale;
  fieldLabel: string | JSX.Element | null;
  addButtonLabel: string | JSX.Element | undefined;
}

const OptionList = ({
  onSelectedLocaleChange,
  name,
  locales,
  allowDeletingAllOptions = false,
  platformLocale,
  fieldLabel,
  addButtonLabel,
}: Props) => {
  const {
    control,
    formState: { errors: formContextErrors },
    setValue,
    trigger,
  } = useFormContext();
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale | null>(
    platformLocale
  );

  // Handles locale change
  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: SupportedLocale) => {
      setSelectedLocale(newSelectedLocale);
      onSelectedLocaleChange?.(newSelectedLocale);
    },
    [onSelectedLocaleChange]
  );

  // Handle option change
  type HandleOptionChangeProps = {
    value: string;
    options: IOptionsType;
    index: number;
    name: string;
    selectedLocale: SupportedLocale;
  };

  const handleOptionChange = ({
    value,
    options,
    index,
    name,
    selectedLocale,
  }: HandleOptionChangeProps) => {
    const updatedOptions = cloneDeep(options);
    updatedOptions[index].title_multiloc[selectedLocale] = value;
    if (!updatedOptions[index].id && !updatedOptions[index].temp_id) {
      updatedOptions[index].temp_id = generateTempId();
    }
    setValue(name, updatedOptions);
  };

  // Handles drag and drop
  const { move } = useFieldArray({
    name,
  });
  const handleDragRow = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
  };

  // Handles add option
  const handleAddOption = (value: Array<Option>, name: string) => {
    const newValues = value;
    newValues.push({
      temp_id: generateTempId(),
      title_multiloc: {},
    });
    setValue(name, newValues);
  };

  // Handles remove option
  const handleRemoveOption = (
    value: Array<Option>,
    name: string,
    index: number
  ) => {
    const newValues = value;
    newValues.splice(index, 1);
    setValue(name, newValues);
  };

  const defaultOptionValues = [];
  const errors = get(formContextErrors, name) as RHFErrors;
  const apiError = errors?.error && ([errors] as CLError[]);
  const validationError = errors?.message;

  if (isNilOrError(locales)) {
    return null;
  }

  if (selectedLocale) {
    return (
      <>
        <Controller
          name={name}
          control={control}
          defaultValue={defaultOptionValues}
          render={({ field: { ref: _ref, value: options, onBlur } }) => {
            const canDeleteLastOption =
              allowDeletingAllOptions || options.length > 1;
            const validatedValues = options.map((option: Option) => ({
              title_multiloc: option.title_multiloc,
            }));

            return (
              <Box
                as="fieldset"
                border="none"
                p="0"
                m="0"
                onBlur={() => {
                  onBlur();
                  trigger(name);
                }}
              >
                <SectionField>
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    marginBottom="12px"
                  >
                    <Box marginTop="4px" marginRight="8px">
                      <Label>{fieldLabel}</Label>
                    </Box>
                    <Box>
                      <LocaleSwitcher
                        onSelectedLocaleChange={handleOnSelectedLocaleChange}
                        locales={locales}
                        selectedLocale={selectedLocale}
                        values={validatedValues}
                      />
                    </Box>
                  </Box>
                  <DndProvider backend={HTML5Backend}>
                    <List key={options?.length}>
                      {options?.map((option: Option, index: number) => {
                        const optionId = option.id || option.temp_id;
                        if (!isNilOrError(optionId)) {
                          return (
                            <Box key={optionId}>
                              <SortableRow
                                id={optionId}
                                key={optionId}
                                index={index}
                                moveRow={handleDragRow}
                                dropRow={() => {
                                  // Do nothing, no need to handle dropping a row for now
                                }}
                              >
                                <Box width="100%">
                                  <Input
                                    id={`e2e-option-input-${index}`}
                                    size="small"
                                    type="text"
                                    value={
                                      // TODO: Fix this the next time the file is edited.
                                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                      option.title_multiloc &&
                                      option.title_multiloc[selectedLocale]
                                    }
                                    onChange={(value) => {
                                      handleOptionChange({
                                        value,
                                        options,
                                        index,
                                        name,
                                        selectedLocale,
                                      });
                                    }}
                                  />
                                </Box>
                                {canDeleteLastOption && (
                                  <Button
                                    type="button"
                                    margin="0px"
                                    padding="0px"
                                    buttonStyle="text"
                                    onClick={() => {
                                      handleRemoveOption(options, name, index);
                                      trigger(name);
                                    }}
                                  >
                                    <Icon
                                      name="delete"
                                      fill="coolGrey600"
                                      padding="0px"
                                    />
                                  </Button>
                                )}
                              </SortableRow>
                            </Box>
                          );
                        }
                        return null;
                      })}
                    </List>
                  </DndProvider>
                  <Button
                    icon="plus-circle"
                    type="button"
                    buttonStyle="secondary-outlined"
                    data-cy="e2e-add-answer"
                    onClick={() => handleAddOption(options, name)}
                    text={addButtonLabel}
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
                </SectionField>
              </Box>
            );
          }}
        />
      </>
    );
  }
  return null;
};

export default OptionList;
