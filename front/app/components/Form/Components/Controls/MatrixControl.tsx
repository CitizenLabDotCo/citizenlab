import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Radio,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@citizenlab/cl2-component-library';
import { ControlProps, UISchemaElement } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { media, RGBAtoRGB } from 'component-library/utils/styleUtils';
import styled, { useTheme } from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';
import messages from './messages';

const StickyTh = styled(Th)`
  background: ${(props) =>
    RGBAtoRGB(props.theme.colors.tenantPrimaryLighten95, 0.05)};

  position: sticky;
  inset-inline-start: 0px;
  z-index: 1;
  flex-grow: 1;

  ${media.phone`
    min-width: 120px;
    `}

  ${media.tablet`
    min-width: 180px;
    `}

  ${media.desktop`
      min-width: 200px;
    `}
`;

const StyledTd = styled(Td)`
  background: ${(props) =>
    RGBAtoRGB(props.theme.colors.tenantPrimaryLighten95, 0.05)};
  max-width: 100px;

  .circle {
    margin-right: 0px;
    border: 1px solid ${(props) => props.theme.colors.tenantPrimary};
  }
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
  const tableDivRef = useRef<HTMLDivElement>(null); // Used to apply border styling on scroll

  // Determine maximum number of columns in the table
  const maxColumns = schema.properties?.[statements[0].key].maximum || 11; // Default 11 which is the maximum number of columns

  // Put all linear scale labels from the UI Schema in an array so we can easily use them
  const columnsFromSchema = Array.from({ length: maxColumns }, (_, index) => {
    // Use number value (index + 1) if no text label is set
    return uischema.options?.[`linear_scale_label${index + 1}`] || index + 1;
  }).filter((label) => label !== '');

  // Add scroll event to check whether the table should have a dashed
  // border which indicates it can be horizontally scrolled
  useEffect(() => {
    const checkApplyBorder = () => {
      const tableElement = tableDivRef.current;
      if (tableElement) {
        if (
          tableElement.scrollLeft + 4 >= // 4 is used as a small offset to make sure it "catches" correctly
          tableElement.scrollWidth - tableElement.clientWidth
        ) {
          tableElement.style.borderRight = 'none';
        } else {
          tableElement.style.borderRight = `1px dashed ${theme.colors.tenantPrimaryLighten75}`;
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
      // If the value has a label, read it out
      if (uischema.options?.[`linear_scale_label${value}`]) {
        return formatMessage(messages.valueOutOfTotalWithLabel, {
          value,
          total,
          label: uischema.options[`linear_scale_label${value}`],
        });
      }
      // If we don't have a label but we do have a maximum, read out the current value & maximum label
      else if (uischema.options?.[`linear_scale_label${maxColumns}`]) {
        return formatMessage(messages.valueOutOfTotalWithMaxExplanation, {
          value,
          total,
          maxValue: maxColumns,
          maxLabel: uischema.options[`linear_scale_label${maxColumns}`],
        });
      }
      // Otherwise, just read out the value and the maximum value
      return formatMessage(messages.valueOutOfTotal, { value, total });
    },
    [maxColumns, uischema.options, formatMessage]
  );

  return (
    <>
      <FormLabel
        htmlFor={errors ? sanitizeForClassname(id) : undefined}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
        id={`matrix-question-label-${id}`}
      />

      <Box overflowX="auto" ref={tableDivRef} id="e2e-matrix-control">
        <Table
          width={'100%'}
          style={{ borderCollapse: 'separate', borderSpacing: '0px 8px' }}
          aria-labelledby={`matrix-question-label-${id}`}
        >
          <Thead>
            <Tr>
              <Th minWidth="84px" pt="0px" />
              {columnsFromSchema.map((column, index) => {
                return (
                  <Th minWidth="84px" key={index} scope="col" pt="0px">
                    <Box title={column} display="flex" justifyContent="center">
                      <Text
                        textAlign="center"
                        m="0px"
                        p="0px"
                        mx="auto"
                        color={'tenantPrimary'}
                      >
                        {column}
                      </Text>
                    </Box>
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {statements.map((statement, index) => {
              return (
                <Tr key={index}>
                  <StickyTh scope="row">
                    <Text m="4px" color="tenantPrimary">
                      {statement?.label}
                    </Text>
                  </StickyTh>

                  {columnsFromSchema.map((_, columnIndex) => {
                    return (
                      <StyledTd key={`radio-${columnIndex}-${index}`}>
                        <Box
                          min-width="84px"
                          display="flex"
                          justifyContent="center"
                        >
                          <Radio
                            mx="auto"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleChange(path, {
                                  ...data,
                                  [statement.key]: columnIndex + 1,
                                });
                              }
                            }}
                            currentValue={data?.[statement.key] - 1}
                            value={columnIndex}
                            label={
                              <ScreenReaderOnly>
                                {getAriaValueText(
                                  columnIndex + 1,
                                  columnsFromSchema.length
                                )}
                                {statements[index]?.label}
                              </ScreenReaderOnly>
                            }
                            name={`radio-group-${statement.key}-${id}`}
                            id={`${id}-${index}-${columnIndex}-radio`}
                            onChange={(value) => {
                              if (data && data?.length === statements?.length) {
                                // Don't blur before the user has had a chance to fill in all statements
                                setDidBlur(true);
                              }
                              handleChange(path, {
                                ...data,
                                [statement.key]: value + 1,
                              });
                            }}
                          />
                        </Box>
                      </StyledTd>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
      {data !== undefined && (
        <Box display="flex">
          <Button
            p="0px"
            buttonStyle="text"
            textColor={theme.colors.tenantPrimary}
            textDecoration="underline"
            text={
              <>
                <ScreenReaderOnly>
                  {formatMessage(messages.clearAllScreenreader)}
                </ScreenReaderOnly>
                <Box aria-hidden>{formatMessage(messages.clearAll)}</Box>
              </>
            }
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
          ajvErrors={
            errors === 'Is invalid'
              ? formatMessage(messages.allStatementsError)
              : errors
          }
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
    return 1200;
  }
  return -1;
};
