import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// react hook form
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

// components
import {
  Box,
  Label,
  Button,
  LocaleSwitcher,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import { List, Row, SortableRow } from 'components/admin/ResourceList';
import Error, { TFieldName } from 'components/UI/Error';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { Locale, CLError, RHFErrors } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';
import { ICustomFieldInputType } from 'api/custom_fields/types';
import SelectFieldOption from './SelectFieldOption';

interface Props {
  name: string;
  onSelectedLocaleChange?: (locale: Locale) => void;
  locales: Locale[];
  allowDeletingAllOptions?: boolean;
  platformLocale: Locale;
  inputType: ICustomFieldInputType;
}

const ConfigSelectWithLocaleSwitcher = ({
  onSelectedLocaleChange,
  name,
  locales,
  allowDeletingAllOptions = false,
  platformLocale,
  inputType,
}: Props) => {
  const {
    control,
    formState: { errors: formContextErrors },
    setValue,
    trigger,
  } = useFormContext();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(
    platformLocale
  );
  const { formatMessage } = useIntl();

  // Handles locale change
  useEffect(() => {
    setSelectedLocale(platformLocale);
    onSelectedLocaleChange?.(platformLocale);
  }, [platformLocale, onSelectedLocaleChange]);
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
  const addOption = (value, name: string, hasOtherOption: boolean) => {
    console.log('value', value);
    const newValues = value;
    const optionIndex = hasOtherOption ? value.length - 1 : value.length;
    newValues.splice(optionIndex, 0, {
      title_multiloc: {},
      ...(inputType === 'multiselect_image' && { image_id: '' }),
    });
    setValue(name, newValues);
  };

  const removeOption = (value, name: string, index: number) => {
    const newValues = value;
    newValues.splice(index, 1);
    setValue(name, newValues);
  };

  const addOtherOption = (value, name: string) => {
    const newValues = value;
    newValues.push({
      title_multiloc: { en: 'Other' },
      other: true,
    });
    setValue(name, newValues);
  };

  const defaultOptionValues: string[] = [];
  const errors = get(formContextErrors, name) as RHFErrors;
  const apiError = errors?.error && ([errors] as CLError[]);
  const validationError = errors?.message;

  if (selectedLocale) {
    return (
      <>
        <Controller
          name={name}
          control={control}
          defaultValue={defaultOptionValues}
          // TODO: Try to enforce types in choices
          render={({ field: { ref: _ref, value: choices, onBlur } }) => {
            const hasOtherOption = choices.some(
              (choice) => choice.other === true
            );
            const toggleOtherOption = (value, name) => {
              if (hasOtherOption) {
                removeOption(value, name, value.length - 1);
              } else {
                addOtherOption(value, name);
              }
            };

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
                      {choices
                        ?.sort((a, b) => (a?.other || 0) - (b?.other || 0))
                        .map((choice, index) => {
                          return (
                            <Box key={choice.id}>
                              {choice.other === true ? (
                                <Row key={choice.id} isLastItem={true}>
                                  <SelectFieldOption
                                    choice={choice}
                                    index={index}
                                    name={name}
                                    choices={choices}
                                    locale={selectedLocale}
                                    removeOption={removeOption}
                                    inputType={inputType}
                                    canDeleteLastOption={canDeleteLastOption}
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
                                  moveRow={
                                    choice?.other ? () => {} : handleDragRow
                                  }
                                  dropRow={() => {
                                    // Do nothing, no need to handle dropping a row for now
                                  }}
                                >
                                  <SelectFieldOption
                                    choice={choice}
                                    index={index}
                                    name={name}
                                    choices={choices}
                                    locale={selectedLocale}
                                    removeOption={removeOption}
                                    inputType={inputType}
                                    canDeleteLastOption={canDeleteLastOption}
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
                    buttonStyle="secondary"
                    data-cy="e2e-add-answer"
                    onClick={() => addOption(choices, name, hasOtherOption)}
                    text={formatMessage(messages.addAnswer)}
                  />

                  <Box mt="24px" data-cy="e2e-other-option-toggle">
                    <Toggle
                      label={formatMessage(messages.otherOption)}
                      checked={hasOtherOption}
                      onChange={() => toggleOtherOption(choices, name)}
                    />
                  </Box>

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

export default ConfigSelectWithLocaleSwitcher;
