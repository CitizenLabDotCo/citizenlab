import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';

// react hook form
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

// components
import {
  Box,
  Label,
  Button,
  IconTooltip,
  LocaleSwitcher,
  Icon,
  Input,
} from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import { List, SortableRow } from 'components/admin/ResourceList';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Multiloc, Locale } from 'typings';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
interface Props {
  name: string;
  onSelectedLocaleChange?: (locale: Locale) => void;
  locales: Locale[];
}

const ConfigMultiselectWithLocaleSwitcher = ({
  onSelectedLocaleChange,
  name,
  locales,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const {
    // formState: { errors }, // TODO: Error handling
    control,
    setValue,
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

  // Handles add and remove fields
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

  const defaultValues = [{}];

  if (selectedLocale) {
    return (
      <>
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValues}
          render={({ field: { ref: _ref, value: choices } }) => {
            return (
              <SectionField>
                <Box display="flex" flexWrap="wrap" marginBottom="12px">
                  <Box marginTop="4px" marginRight="12px">
                    <Label>
                      {formatMessage(messages.fieldLabel)}
                      <IconTooltip
                        content={formatMessage(messages.fieldTooltip)}
                      />
                    </Label>
                  </Box>
                  <Box>
                    <LocaleSwitcher
                      onSelectedLocaleChange={handleOnSelectedLocaleChange}
                      locales={!isNilOrError(locales) ? locales : []}
                      selectedLocale={selectedLocale}
                      values={{
                        input_field: choices as Multiloc,
                      }}
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
                            <Box width="300px">
                              <Input
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
                            <Button
                              margin="0px"
                              padding="0px"
                              buttonStyle="text"
                              aria-label={formatMessage(messages.removeOption)}
                              onClick={() => removeOption(choices, name, index)}
                            >
                              <Icon name="trash" fill="grey" padding="0px" />
                            </Button>
                          </SortableRow>
                        </Box>
                      );
                    })}
                  </List>
                </DndProvider>
                <Button
                  icon="plus-circle"
                  buttonStyle="secondary"
                  onClick={() => addOption(choices, name)}
                  text={formatMessage(messages.addAnswer)}
                />
              </SectionField>
            );
          }}
        />
      </>
    );
  }
  return null;
};

export default injectIntl(ConfigMultiselectWithLocaleSwitcher);
