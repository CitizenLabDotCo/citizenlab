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

import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getSubtextElement } from './controlUtils';

const StyledSelect = styled(Select)`
  padding: 0px !important;
  margin: 0px;
  min-width: 52px;
  margin-right: 12px;
  margin-top: auto;
  margin-bottom: auto;

  select {
    padding-right: 0px !important;
    font-size: 16px !important;
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
  console.log({ data });
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const [didBlur, setDidBlur] = useState(false);

  // Step 1: Get the options from the schema
  //   const options = getOptions(schema, 'ranking'); Uncomment once implemented on BE;
  const [options, setOptions] = useState([
    {
      value: 'car_zy2',
      label:
        'Here is the car option is a much longer label than the rest of the options to test the wrapping behaviour in the box.',
    },
    {
      value: 'bus_nlw',
      label: 'Bus',
    },
    {
      value: 'train_nlw',
      label: 'Train',
    },
    {
      value: 'walking_nlw',
      label: 'Walking',
    },
  ]);

  // Step 2: From data, get the current ranking order of the options
  if (data) {
    const optionsFromData = data.map((optionKey: string) => {
      return options.find((option) => option.value === optionKey);
    });

    setOptions(optionsFromData);
  }

  const updateData = (newOptionsOrdered: IOption[]) => {
    const newOptionsData = newOptionsOrdered.map((option) => option.value);

    console.log(newOptionsData);
    handleChange(path, newOptionsData);
  };

  // Step 3: When reordered, create new array + update the data
  const reorderFields = (result: DragAndDropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    const reorderedOptions = Array.from(options);
    const [removed] = reorderedOptions.splice(sourceIndex, 1);
    reorderedOptions.splice(destinationIndex, 0, removed);
    setOptions(reorderedOptions);
    updateData(reorderedOptions);
  };

  // Step 4: When reordered using select, update the data

  if (!visible) {
    return null;
  }

  const numberIndexSelectOptions = options.map((_option, index) => ({
    value: index + 1,
    label: `${index + 1}`,
  }));

  const getChoiceIndex = (option: IOption) => {
    return options.findIndex((o) => o.value === option.value) + 1;
  };

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
              reorderFields(result);
              setDidBlur(true);
            }}
          >
            <Drop id="droppable" type="test">
              {options.map((option, index) => (
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
                          options={numberIndexSelectOptions}
                          value={getChoiceIndex(option)}
                          onChange={(selectedOption) => {
                            const newOptions = Array.from(options);
                            const newIndex = selectedOption.value - 1;
                            newOptions.splice(index, 1);
                            newOptions.splice(newIndex, 0, option);
                            setOptions(newOptions);
                            updateData(newOptions);
                          }}
                        />

                        <Text
                          maxWidth="82%"
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
