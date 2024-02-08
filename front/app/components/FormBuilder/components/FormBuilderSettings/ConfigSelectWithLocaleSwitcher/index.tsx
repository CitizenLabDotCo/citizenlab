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
  Icon,
  Input,
} from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import { List, Row, SortableRow } from 'components/admin/ResourceList';
import Error, { TFieldName } from 'components/UI/Error';
import ImagesDropzone from "components/UI/ImagesDropzone";

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// Typings
import {Locale, CLError, RHFErrors } from 'typings';

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
  const addOption = (value, name, hasOtherOption) => {
    const newValues = value;
    const optionIndex = hasOtherOption ? value.length - 1 : value.length;
    newValues.splice(optionIndex, 0, {
      title_multiloc: {},
    });
    setValue(name, newValues);
  };
  const removeOption = (value, name, index) => {
    const newValues = value;
    newValues.splice(index, 1);
    setValue(name, newValues);
  };
  const addOtherOption = (value, name) => {
    const newValues = value;
    newValues.push({
      title_multiloc: { en: 'Other' },
      other: true,
    });
    setValue(name, newValues);
  };

  const defaultOptionValues = [{}];
  const errors = get(formContextErrors, name) as RHFErrors;
  const apiError = errors?.error && ([errors] as CLError[]);
  const validationError = errors?.message;

  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    // We want to prevent the form builder from being closed when enter is pressed
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  if (selectedLocale) {
    return (
      <>
        <Controller
          name={name}
          control={control}
          defaultValue={defaultOptionValues}
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

            const eachOption = (choice, index) => {
              return (
                <>
                  <Box width="100%" pl={choice.other === true ? '30px' : '0'}>
                    <Input
                      id={`e2e-option-input-${index}`}
                      size="small"
                      type="text"
                      value={choice.title_multiloc[selectedLocale]}
                      onKeyDown={handleKeyDown}
                      onChange={(value) => {
                        const updatedChoices = choices;
                        updatedChoices[index].title_multiloc[selectedLocale] =
                          value;
                        if (
                          !updatedChoices[index].id &&
                          !updatedChoices[index].temp_id
                        ) {
                          updatedChoices[index].temp_id = generateTempId();
                        }
                        setValue(name, updatedChoices);
                      }}
                    />

                    <ImagesDropzone
                      id={`e2e-option-image-${index}`}
                      images={choice.image}
                      imagePreviewRatio={135 / 298}
                      acceptedFileTypes={{
                        'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
                      }}
                      onAdd={(images) => {
                        console.log(images[0].base64);
                      }}
                      onRemove={() => {
                        console.log('Removing image');
                      }}
                    />

                  </Box>
                  {canDeleteLastOption && (
                    <Button
                      margin="0px"
                      padding="0px"
                      buttonStyle="text"
                      aria-label={formatMessage(messages.removeAnswer)}
                      onClick={() => {
                        removeOption(choices, name, index);
                        trigger();
                      }}
                    >
                      <Icon name="delete" fill="coolGrey600" padding="0px" />
                    </Button>
                  )}
                </>
              );
            };

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
                        ?.sort((a, b) => a.other - b.other)
                        .map((choice, index) => {
                          return (
                            <Box key={choice.id}>
                              {choice.other === true ? (
                                <Row key={choice.id} isLastItem={true}>
                                  {eachOption(choice, index)}
                                </Row>
                              ) : (
                                <SortableRow
                                  id={choice.id}
                                  index={index}
                                  moveRow={
                                    choice.other === true
                                      ? () => {}
                                      : handleDragRow
                                  }
                                  dropRow={() => {
                                    // Do nothing, no need to handle dropping a row for now
                                  }}
                                >
                                  {eachOption(choice, index)}
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

export default injectIntl(ConfigSelectWithLocaleSwitcher);
