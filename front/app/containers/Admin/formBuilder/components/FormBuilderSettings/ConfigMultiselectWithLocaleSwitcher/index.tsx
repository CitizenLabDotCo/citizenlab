import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';

// react hook form
import { Controller, useFormContext } from 'react-hook-form';

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

// intl
import { Multiloc, Locale } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  name: string;
  locales: Locale[];
  onSelectedLocaleChange?: (locale: Locale) => void;
}

export interface ISelectValue {
  id: string;
  title_multiloc: Multiloc;
}

const ConfigMultiselectWithLocaleSwitcher = ({
  locales,
  onSelectedLocaleChange,
  name,
}: Props) => {
  const {
    // formState: { errors }, // TODO: Error handling
    control,
    setValue,
  } = useFormContext();

  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

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

  // // TODO: Refactor to work with React hook forms
  // const handleDragRow = (fromIndex: number, toIndex: number) => {
  //   if (!isNilOrError(value)) {
  //     const newValues = clone(value);
  //     const [removed] = newValues.splice(fromIndex, 1);
  //     newValues.splice(toIndex, 0, removed);
  //     setValue(name, newValues);
  //   }
  // };

  // // TODO: Refactor to work with React hook forms
  const handleDropRow = (fieldId: string, toIndex: number) => {
    if (!isNilOrError(value)) {
      const newValues = clone(value);
      const [removed] = newValues.splice(
        newValues.findIndex((field) => field.id === fieldId),
        1
      );
      newValues.splice(toIndex, 0, removed);
      setValue(name, newValues);
    }
  };

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

  const defaultValsTemp = [
    {
      title_multiloc: {
        en: 'Option 1 EN',
        'nl-BE': 'Option 1 NL-BE',
        'fr-BE': 'Option 1 FR-BE',
      },
    },
  ];

  if (selectedLocale) {
    return (
      <>
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValsTemp}
          render={({ field: { ref: _ref, value: options } }) => {
            return (
              <SectionField>
                <Box display="flex" flexWrap="wrap" marginBottom="12px">
                  <Box marginRight="12px">
                    <Label>
                      Answer choices {/* // TODO Add to messages */}
                      <IconTooltip content="Tooltip content" />
                    </Label>
                  </Box>
                  <Box>
                    <LocaleSwitcher
                      onSelectedLocaleChange={handleOnSelectedLocaleChange}
                      locales={!isNilOrError(locales) ? locales : []}
                      selectedLocale={selectedLocale}
                      values={{
                        input_field: options as Multiloc,
                      }}
                    />
                  </Box>
                </Box>
                <DndProvider backend={HTML5Backend}>
                  <List key={options?.length}>
                    {options?.map((option, index) => {
                      return (
                        <Box key={option.id}>
                          <SortableRow
                            id={option.id}
                            index={index}
                            moveRow={() => {}} // TODO: Refactor move function
                            dropRow={() => {}} // TODO: Refactor drop function
                          >
                            <Box minWidth="80%">
                              {/* // TODO: Set width better */}
                              <Input
                                size="small"
                                type="text"
                                value={option.title_multiloc[selectedLocale]}
                                onChange={(value) => {
                                  const newValues = options;
                                  newValues[index].title_multiloc[
                                    selectedLocale
                                  ] = value;
                                  setValue(name, newValues);
                                }}
                              />
                            </Box>
                            <Button // TODO: Add aria-label
                              margin="0px"
                              padding="0px"
                              buttonStyle="text"
                              onClick={() => removeOption(options, name, index)}
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
                  buttonStyle="secondary"
                  onClick={() => addOption(options, name)}
                >
                  Add answer
                </Button>
                {/* // TODO Add to messages + add functionality */}
              </SectionField>
            );
          }}
        />
      </>
    );
  }

  return <></>;
};

export default ConfigMultiselectWithLocaleSwitcher;
