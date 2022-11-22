import { get } from 'lodash-es';
import React, { useCallback, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';

// react hook form
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

// components
import {
  Box,
  Button,
  Icon,
  Input,
  Label,
  LocaleSwitcher,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { List, SortableRow } from 'components/admin/ResourceList';
import { SectionField } from 'components/admin/Section';
import Error, { TFieldName } from 'components/UI/Error';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { Locale, CLError } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  name: string;
  nameInputType: string;
  onSelectedLocaleChange?: (locale: Locale) => void;
  locales: Locale[];
  allowDeletingAllOptions?: boolean;
}

const ConfigMultiselectWithLocaleSwitcher = ({
  onSelectedLocaleChange,
  name,
  nameInputType,
  locales,
  intl: { formatMessage },
  allowDeletingAllOptions = false,
}: Props & WrappedComponentProps) => {
  const {
    control,
    formState: { errors: formContextErrors },
    setValue,
    watch,
    trigger,
  } = useFormContext();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  // Handles locale change
  useEffect(() => {
    setSelectedLocale(locales[0]);
    onSelectedLocaleChange?.(locales[0]);
  }, [locales, onSelectedLocaleChange]);
  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: Locale) => {
      setSelectedLocale(newSelectedLocale);
      onSelectedLocaleChange?.(newSelectedLocale);
    },
    [onSelectedLocaleChange]
  );

  // Handles drag and drop
  const { move } = useFieldArray({
    name,
  });
  const handleDragRow = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
  };

  // Handles add and remove options
  const addOption = (value, name) => {
    const newValues = value;
    newValues.push({
      title_multiloc: {},
    });
    setValue(name, newValues);
  };
  const removeOption = (value, name, index) => {
    const newValues = value;
    newValues.splice(index, 1);
    setValue(name, newValues);
  };

  const defaultOptionValues = [{}];
  const defaultToggleValue = false;
  const currentToggleValue = watch(nameInputType);
  const errors = get(formContextErrors, name);
  const apiError =
    (errors?.error as string | undefined) && ([errors] as unknown as CLError[]);
  const validationError = errors?.message as string | undefined;

  if (selectedLocale) {
    return (
      <>
        <Controller
          name={name}
          control={control}
          defaultValue={defaultOptionValues}
          render={({ field: { ref: _ref, value: choices, onBlur } }) => {
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
              >
                <SectionField>
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    marginBottom="12px"
                  >
                    <Box marginTop="4px" marginRight="8px">
                      <Label>{formatMessage(messages.fieldLabel)}</Label>
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
                    <List key={choices?.length}>
                      {choices?.map((choice, index) => {
                        return (
                          <Box key={choice.id}>
                            <SortableRow
                              id={choice.id}
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
                                  value={choice.title_multiloc[selectedLocale]}
                                  onChange={(value) => {
                                    const updatedChoices = choices;
                                    updatedChoices[index].title_multiloc[
                                      selectedLocale
                                    ] = value;
                                    setValue(name, updatedChoices);
                                  }}
                                />
                              </Box>
                              {canDeleteLastOption && (
                                <Button
                                  margin="0px"
                                  padding="0px"
                                  buttonStyle="text"
                                  aria-label={formatMessage(
                                    messages.removeAnswer
                                  )}
                                  onClick={() => {
                                    removeOption(choices, name, index);
                                    trigger();
                                  }}
                                >
                                  <Icon
                                    name="delete"
                                    fill="grey"
                                    padding="0px"
                                  />
                                </Button>
                              )}
                            </SortableRow>
                          </Box>
                        );
                      })}
                    </List>
                  </DndProvider>
                  <Button
                    icon="plus-circle"
                    buttonStyle="secondary"
                    data-cy="e2e-add-answer"
                    onClick={() => addOption(choices, name)}
                    text={formatMessage(messages.addAnswer)}
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
                  <Box mt="24px">
                    <Controller
                      name={nameInputType}
                      control={control}
                      defaultValue={defaultToggleValue}
                      render={({ field: { ref: _ref, value } }) => {
                        return (
                          <Toggle
                            checked={value === 'multiselect'}
                            id="e2e-multiselect-toggle"
                            onChange={() => {
                              if (currentToggleValue === 'select') {
                                setValue(nameInputType, 'multiselect');
                              } else {
                                setValue(nameInputType, 'select');
                              }
                            }}
                            label={formatMessage(messages.chooseMultipleToggle)}
                          />
                        );
                      }}
                    />
                  </Box>
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

export default injectIntl(ConfigMultiselectWithLocaleSwitcher);
