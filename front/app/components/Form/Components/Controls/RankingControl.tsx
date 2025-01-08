import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
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
import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getSubtextElement } from './controlUtils';

const StyledMultipleSelect = styled(MultipleSelect)`
  flex-grow: 1;
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
  const { formatMessage } = useIntl();
  const [didBlur, setDidBlur] = useState(false);
  //   const options = getOptions(schema, 'ranking'); Uncomment once implemented on BE;

  const [options, setOptions] = useState([
    {
      value: 'car_zy2',
      label: 'Car',
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

  if (!visible) {
    return null;
  }

  const reorderFields = (result: DragAndDropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    const reorderedOptions = Array.from(options);
    const [removed] = reorderedOptions.splice(sourceIndex, 1);
    reorderedOptions.splice(destinationIndex, 0, removed);
    setOptions(reorderedOptions);
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
            }}
          >
            <Drop id="droppable" type="test">
              {options.map((option, index) => (
                <Drag key={option.value} id={option.value} index={index}>
                  <Box
                    style={{ cursor: 'pointer' }}
                    mb="12px"
                    background={theme.colors.tenantPrimaryLighten95}
                    borderRadius="3px"
                    border={`1px solid ${theme.colors.tenantPrimary}`}
                  >
                    <Box padding="18px 20px 18px 20px">
                      <Text color="tenantPrimary" p="0px" m="0px">
                        {option.label}
                      </Text>
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
