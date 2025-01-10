import React, { useState } from 'react';

import {
  Box,
  Icon,
  IOption,
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

import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getOptions, getSubtextElement } from './controlUtils';

const StyledSelect = styled(Select)`
  min-width: 52px;
  margin-right: 12px;

  select {
    padding: 4px !important;
    border: solid 1px ${(props) => props.theme.colors.tenantPrimary};
    color: ${(props) => props.theme.colors.tenantPrimary};
  }

  svg {
    fill: ${(props) => props.theme.colors.tenantPrimary} !important;
    width: 16px !important;
  }
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
  visible,
}: ControlProps) => {
  const theme = useTheme();
  const [didBlur, setDidBlur] = useState(false);

  // Generate the options:
  // If form data present, generate array of options in that ranking order.
  // Otherwise, use the option order from the JSON schema.
  const optionsFromSchema = getOptions(schema, 'ranking');
  const optionsFromData = data?.map((optionKey: string) => {
    return optionsFromSchema.find(
      (option: IOption) => option.value === optionKey
    );
  });
  const [options, setOptions] = useState(
    data ? optionsFromData : optionsFromSchema
  );

  if (!visible) {
    return null;
  }

  // updateData: Function to update the form data with a specific option order.
  const updateData = (newOptionOrder: IOption[]) => {
    setOptions(newOptionOrder);
    handleChange(
      path,
      newOptionOrder.map((option: IOption) => option.value) // We only store array of keys in the form data
    );
  };

  // reorderFieldsAfterDrag: Function to reorder and save the options after a drag and drop.
  const reorderFieldsAfterDrag = (result: DragAndDropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    moveOptionInArray(sourceIndex, destinationIndex);
  };

  // getIndexOfOption: Function to get the index of a specific option in the current options array.
  const getIndexOfOption = (currentOption: IOption) => {
    return (
      options.findIndex(
        (option: IOption) => option.value === currentOption.value
      ) + 1
    );
  };

  // moveOptionInArray: Function to move an option in the array to a new index & update the form data.
  const moveOptionInArray = (sourceIndex: number, destinationIndex: number) => {
    const newOptions = options;
    const [removed] = newOptions.splice(sourceIndex, 1);
    newOptions.splice(destinationIndex, 0, removed);
    updateData(newOptions);
  };

  // selectDropdownOptions: For the select dropdown, generate the index number options.
  const selectDropdownOptions = options.map(
    (_option: IOption, index: number) => ({
      value: index + 1,
      label: `${index + 1}`,
    })
  );

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row" overflow="visible">
        <Box flexGrow={1}>
          <DragAndDrop
            onDragEnd={(result: DragAndDropResult) => {
              reorderFieldsAfterDrag(result);
              setDidBlur(true);
            }}
          >
            <Drop id="droppable" type="rankOptions">
              {options.map((option: IOption, index: number) => (
                <Drag
                  key={option.value}
                  id={option.value}
                  index={index}
                  useBorder={false}
                >
                  <Box
                    style={{ cursor: 'grab' }}
                    mb="12px"
                    background={theme.colors.tenantPrimaryLighten95}
                    borderRadius="3px"
                    border={`1px solid ${theme.colors.tenantPrimary}`}
                  >
                    <Box
                      padding="18px 20px 18px 20px"
                      display="flex"
                      justifyContent="space-between"
                    >
                      <Box display="flex">
                        <StyledSelect
                          options={selectDropdownOptions}
                          value={getIndexOfOption(option)}
                          onChange={(selectedOption) => {
                            const newIndex = selectedOption.value - 1;
                            moveOptionInArray(index, newIndex);
                            setDidBlur(true);
                          }}
                        />

                        <Text
                          maxWidth="80%"
                          my="auto"
                          color="tenantPrimary"
                          p="0px"
                          m="0px"
                        >
                          {option.label}
                        </Text>
                      </Box>

                      <Box flexShrink={0} my="auto">
                        <Icon
                          height="18px"
                          name="drag-handle"
                          fill={theme.colors.tenantPrimary}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Drag>
              ))}
            </Drop>
          </DragAndDrop>
        </Box>

        <VerificationIcon show={uischema.options?.verificationLocked} />
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
