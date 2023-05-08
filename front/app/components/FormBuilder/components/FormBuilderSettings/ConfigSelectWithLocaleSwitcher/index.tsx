import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd-cjs';
import { HTML5Backend } from 'react-dnd-html5-backend';

// react hook form
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

// components
import {
  Box,
  Label,
  Button,
  LocaleSwitcher,
  Icon,
  Input,
} from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import { List, SortableRow } from 'components/admin/ResourceList';
import Error, { TFieldName } from 'components/UI/Error';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// Typings
import { Locale, CLError, RHFErrors } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { generateTempId } from '../utils';
import { get } from 'lodash-es';

interface Props {
  name: string;
  onSelectedLocaleChange?: (locale: Locale) => void;
  locales: Locale[];
  allowDeletingAllOptions?: boolean;
  platformLocale: Locale;
}

const ConfigSelectWithLocaleSwitcher = ({
  onSelectedLocaleChange,
  name,
  locales,
  intl: { formatMessage },
  allowDeletingAllOptions = false,
  platformLocale,
}: Props & WrappedComponentProps) => {
  const {
    control,
    formState: { errors: formContextErrors },
    setValue,
    trigger,
  } = useFormContext();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(
    platformLocale
  );

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
                                    if (
                                      !updatedChoices[index].id &&
                                      !updatedChoices[index].temp_id
                                    ) {
                                      updatedChoices[index].temp_id =
                                        generateTempId();
                                    }
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
                                    fill="coolGrey600"
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

export default injectIntl(ConfigSelectWithLocaleSwitcher);
