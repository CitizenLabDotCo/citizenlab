import React, { useState } from 'react';

import {
  Box,
  Button,
  Icon,
  IOption,
  Label,
  Select,
  Text,
} from '@citizenlab/cl2-component-library';
import { ControlProps, UISchemaElement } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import styled, { useTheme } from 'styled-components';

import {
  Drag,
  DragAndDrop,
  Drop,
} from 'components/FormBuilder/components/DragAndDrop';
import { DragAndDropResult } from 'components/FormBuilder/edit/utils';
import { FormLabel } from 'components/UI/FormComponents';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getOptions, getSubtextElement } from './controlUtils';
import messages from './messages';

const StyledSelect = styled(Select)`
  min-width: 52px;
  margin-right: 12px;
  margin-top: auto;
  margin-bottom: auto;

  select {
    padding: 4px;
    border: solid 1px ${(props) => props.theme.colors.tenantPrimary};
    color: ${(props) => props.theme.colors.tenantPrimary};
  }

  svg {
    fill: ${(props) => props.theme.colors.tenantPrimary} !important;
    width: 16px;
  }
`;

const Ul = styled.ul`
  padding: 0;
  margin-top: 4px;
  list-style-type: none;
`;

const RankingControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  uischema,
  required,
  id,
}: ControlProps) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const [didBlur, setDidBlur] = useState(false);

  // If form data present, get options in that ranking order.
  // Otherwise, get option order from the JSON schema.
  const optionsFromSchema = getOptions(schema, 'ranking');
  const optionsFromData = data?.map((optionKey: string) => {
    return optionsFromSchema?.find(
      (option: IOption) => option.value === optionKey
    );
  });

  const options = optionsFromData || optionsFromSchema;

  // updateData: Function to update the form data with a specific option order.
  const updateData = (newOptionOrder: IOption[] | undefined) => {
    handleChange(
      path,
      // In form data we only store an array of option keys
      newOptionOrder?.map((option: IOption) => option.value)
    );
    setDidBlur(true);
  };

  // reorderFieldsAfterDrag: Function to reorder and save the options after a drag and drop.
  const reorderFieldsAfterDrag = (result: DragAndDropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    moveOptionInArray(sourceIndex, destinationIndex);
  };

  // getRankOfOption: Function to get the rank of a specific option in the current options array.
  const getRankOfOption = (currentOption: IOption) => {
    return data
      ? options.findIndex(
          (option: IOption) => option.value === currentOption.value
        ) + 1
      : '';
  };

  // moveOptionInArray: Function to move an option in the array to a new index & update the form data.
  const moveOptionInArray = (sourceIndex: number, destinationIndex: number) => {
    const updatedOptions = [...options];
    const [removed] = updatedOptions.splice(sourceIndex, 1);
    updatedOptions.splice(destinationIndex, 0, removed);
    updateData(updatedOptions);
  };

  // rankDropdownOptions: For the select dropdown, generate the rank number options.
  const rankDropdownOptions = options.map(
    (_option: IOption, index: number) => ({
      value: index + 1,
      label: `${index + 1}`,
    })
  );

  return (
    <>
      <FormLabel
        htmlFor={errors ? sanitizeForClassname(id) : undefined}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
        id={`ranking-question-label-${id}`}
      />
      <Box
        display="flex"
        flexDirection="row"
        flexGrow={1}
        id="e2e-ranking-control"
      >
        <Box flexGrow={1}>
          <DragAndDrop
            onDragEnd={(result: DragAndDropResult) => {
              reorderFieldsAfterDrag(result);
            }}
          >
            <Drop id="droppable" type="rankOptions">
              <Text m="0px" aria-hidden color="tenantPrimary">
                {formatMessage(messages.rankingInstructions)}
              </Text>
              <Ul aria-labelledby={`ranking-question-label-${id}`}>
                {options.map((option: IOption, index: number) => (
                  <li key={option.value} aria-roledescription="sortable">
                    <Drag
                      index={index}
                      useBorder={false}
                      id={`ranking-item-${option.value}`}
                    >
                      <Box
                        style={{ cursor: 'grab' }}
                        mb="12px"
                        background={theme.colors.tenantPrimaryLighten95}
                        borderRadius={theme.borderRadius}
                        border={`1px solid ${theme.colors.tenantPrimary}`}
                      >
                        <Box
                          padding="18px 20px 18px 20px"
                          display="flex"
                          justifyContent="space-between"
                        >
                          <Box display="flex">
                            <ScreenReaderOnly>
                              <Label>
                                {`${option.label}. ${
                                  getRankOfOption(option)
                                    ? formatMessage(messages.currentRank)
                                    : formatMessage(messages.noRankSelected)
                                }`}
                              </Label>
                            </ScreenReaderOnly>

                            <StyledSelect
                              options={rankDropdownOptions}
                              value={getRankOfOption(option)}
                              onChange={(selectedOption) => {
                                moveOptionInArray(
                                  index,
                                  selectedOption.value - 1
                                );

                                // For a11y, focus the list item again after reordering.
                                (
                                  document.querySelector(
                                    `[data-rbd-drag-handle-draggable-id="ranking-item-${option.value}"]`
                                  ) as HTMLElement
                                ).focus();
                              }}
                            />
                            <Text
                              maxWidth="80%"
                              my="auto"
                              color="tenantPrimary"
                              p="0px"
                              m="0px"
                              aria-hidden
                            >
                              {option.label}
                            </Text>
                          </Box>

                          <Box flexShrink={0} my="auto" pl="8px">
                            <Icon
                              height="18px"
                              name="drag-handle"
                              fill={theme.colors.tenantPrimary}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Drag>
                  </li>
                ))}
              </Ul>
            </Drop>
          </DragAndDrop>
          {data !== undefined && (
            <Box display="flex">
              <Button
                p="0px"
                buttonStyle="text"
                textColor={theme.colors.tenantPrimary}
                textDecoration="underline"
                text={formatMessage(messages.clearAll)}
                onClick={() => {
                  updateData(undefined);
                  setDidBlur(true);
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
      <Box mt="4px">
        <ErrorDisplay
          inputId={sanitizeForClassname(id)}
          ajvErrors={errors}
          fieldPath={path}
          didBlur={didBlur}
        />
      </Box>
    </>
  );
};

export default withJsonFormsControlProps(RankingControl);

export const rankingControlTester = (uiSchema: UISchemaElement) => {
  if (uiSchema.options?.input_type === 'ranking') {
    return 1000;
  }
  return -1;
};
