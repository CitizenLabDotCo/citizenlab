import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Box, Button, Radio, Text } from '@citizenlab/cl2-component-library';
import { ControlProps, UISchemaElement } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import styled, { useTheme } from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';
import messages from './messages';

const StickyTd = styled.td`
  background: ${(props) => props.theme.colors.tenantPrimaryLighten95};
  position: sticky;
  inset-inline-start: 0px;
  z-index: 1;
  flex-grow: 1;
`;

const StyledTd = styled.td`
  background: ${(props) => props.theme.colors.tenantPrimaryLighten95};

  .circle {
    margin-right: 0px;
    border: 1px solid ${(props) => props.theme.colors.tenantPrimary};
  }
`;

const StledTh = styled.th`
  min-width: 84px;

  p {
    word-break: break-word !important;
  }
`;

const StyledRadio = styled(Radio)`
  margin-right: auto;
  margin-left: auto;
`;

const MatrixControl = ({
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
  const statements = uischema.options?.statements;
  const tableDivRef = useRef<HTMLDivElement>(null);

  // Put all linear scale labels from the UI Schema in an array so we can easily access them
  const columnsFromSchema = Array.from({ length: 7 }, (_, index) => {
    return uischema.options?.[`linear_scale_label${index + 1}`];
  }).filter((label) => label !== '');

  // Add scroll event to check whether the table should have a dashed border (indicating it can be scrolled)
  useEffect(() => {
    const checkApplyBorder = () => {
      if (tableDivRef.current) {
        // Check if the table can be scrolled further to the right
        if (
          tableDivRef.current.scrollLeft + 4 >=
          tableDivRef.current.scrollWidth - tableDivRef.current.clientWidth
        ) {
          // No - remove the dashed border
          tableDivRef.current.style.borderRight = 'none';
        } else {
          // Yes - add the dashed border
          tableDivRef.current.style.borderRight = `1px dashed ${theme.colors.tenantPrimaryLighten75}`;
        }
      }
    };

    checkApplyBorder();

    tableDivRef.current?.addEventListener('scroll', () => {
      checkApplyBorder();
    });
  }, [theme.colors.tenantPrimaryLighten75]);

  const getAriaValueText = useCallback(
    (value: number, total: number) => {
      const maximum = schema.maximum ?? 7; // Seven since the maximum number of options is 7

      // If the value has a label, read it out
      if (uischema.options?.[`linear_scale_label${value}`]) {
        return formatMessage(messages.valueOutOfTotalWithLabel, {
          value,
          total,
          label: uischema.options[`linear_scale_label${value}`],
        });
      }
      // If we don't have a label but we do have a maximum, read out the current value & maximum label
      else if (uischema.options?.[`linear_scale_label${maximum}`]) {
        return formatMessage(messages.valueOutOfTotalWithMaxExplanation, {
          value,
          total,
          maxValue: maximum,
          maxLabel: uischema.options[`linear_scale_label${maximum}`],
        });
      }
      // Otherwise, just read out the value and the maximum value
      return formatMessage(messages.valueOutOfTotal, { value, total });
    },
    [schema.maximum, uischema.options, formatMessage]
  );

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
        id={`ranking-question-label-${id}`}
      />

      <Box position="relative" width="100%" overflowX="auto" ref={tableDivRef}>
        <table
          width={'100%'}
          style={{ borderCollapse: 'separate', borderSpacing: '0px 8px' }}
        >
          <thead>
            <StledTh />
            {columnsFromSchema.map((column, index) => {
              return (
                <StledTh key={index}>
                  <div title={column}>
                    <Text m="0px" p="0px" mx="auto" color={'tenantPrimary'}>
                      {column}
                    </Text>
                  </div>
                </StledTh>
              );
            })}
          </thead>
          <tbody>
            {statements.map((statement, index) => {
              return (
                <tr key={index}>
                  <StickyTd>
                    <Box
                      background={theme.colors.tenantPrimaryLighten95}
                      p="8px"
                      max-width="100px"
                    >
                      <Text m="4px" color="tenantPrimary">
                        {statement.label || index + 1}
                      </Text>
                    </Box>
                  </StickyTd>
                  {columnsFromSchema.map((_, index) => {
                    return (
                      <StyledTd key={index}>
                        <Box
                          min-width="84px"
                          display="flex"
                          justifyContent="center"
                        >
                          <StyledRadio
                            currentValue={data?.[statement.key]}
                            value={index}
                            label={
                              <ScreenReaderOnly>
                                {getAriaValueText(
                                  index + 1,
                                  columnsFromSchema.length
                                )}
                              </ScreenReaderOnly>
                            }
                            name={`${index}-radio-group`}
                            onChange={(value) => {
                              if (data && data?.length === statements?.length) {
                                setDidBlur(true);
                              }
                              handleChange(path, {
                                ...data,
                                [statement.key]: value,
                              });
                            }}
                          />
                        </Box>
                      </StyledTd>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
      {data !== undefined && (
        <Box display="flex">
          <Button
            p="0px"
            buttonStyle="text"
            textColor={theme.colors.tenantPrimary}
            textDecoration="underline"
            text={formatMessage(messages.clearAll)}
            onClick={() => {
              handleChange(path, undefined);
              setDidBlur(true);
            }}
          />
        </Box>
      )}
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

export default withJsonFormsControlProps(MatrixControl);

export const matrixControlTester = (uiSchema: UISchemaElement) => {
  if (uiSchema.options?.input_type === 'matrix_linear_scale') {
    // ToDo: Change this to 'matrix' when it's implemented
    return 1200;
  }
  return -1;
};
