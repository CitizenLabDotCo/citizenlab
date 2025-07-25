import React, { useRef, useEffect, useCallback } from 'react';

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
import { media, RGBAtoRGB } from 'component-library/utils/styleUtils';
import styled, { useTheme } from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import messages from 'components/Form/Components/Controls/messages';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import { getLinearScaleLabel } from '../LinearScale/utils';

const StickyTh = styled(Th)<{ hasLongContent: boolean }>`
  background: ${(props) =>
    RGBAtoRGB(props.theme.colors.tenantPrimaryLighten95, 0.05)};
  position: sticky;
  inset-inline-start: 0px;
  z-index: 1;

  overflow-wrap: break-word;
  hyphens: auto;

  min-width: 200px;
  max-width: 40vw;

  // 200px is too much for phones, so we need something responsive for small screens.
  ${media.phone`
    min-width: ${({ hasLongContent }) =>
      // 40vw would be too wide on small screens for short labels such as "yes" or "no"
      hasLongContent ? '40vw' : 'fit-content'};
  `}
`;

const StyledTd = styled(Td)`
  background: ${(props) =>
    RGBAtoRGB(props.theme.colors.tenantPrimaryLighten95, 0.05)};
  // This min-width also ensures that the th elements have the same min-width.
  min-width: 84px;

  .circle {
    margin-right: 0px;
    border: 1px solid ${(props) => props.theme.colors.tenantPrimary};
  }
`;

const LONG_LABEL_THRESHOLD = 10; // Threshold for long labels, used to apply specific styling

interface Props {
  value?: Record<string, number>;
  question: IFlatCustomField;
  onChange: (value?: Record<string, number>) => void;
}

const Matrix = ({ value: data, question, onChange }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const statements = question.matrix_statements;
  const tableDivRef = useRef<HTMLDivElement>(null); // Used to apply border styling on scroll

  const id = question.key;

  // Determine maximum number of columns in the table
  const maxColumns = question.maximum ?? 11;

  // Put all linear scale labels from the UI Schema in an array so we can easily use them
  const columnsFromSchema = Array.from({ length: maxColumns }, (_, index) => {
    // Use number value (index + 1) if no text label is set
    const number = index + 1;
    const labelMultiloc = getLinearScaleLabel(question, number);
    if (!labelMultiloc) return number.toString();

    return localize(labelMultiloc);
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
      const label = getLinearScaleLabel(question, value);

      if (label) {
        return formatMessage(messages.valueOutOfTotalWithLabel, {
          value,
          total,
          label: localize(label),
        });
      }

      // If we don't have a label but we do have a maximum, read out the current value & maximum label
      const maxLabel = getLinearScaleLabel(question, maxColumns);
      if (maxLabel) {
        return formatMessage(messages.valueOutOfTotalWithMaxExplanation, {
          value,
          total,
          maxValue: maxColumns,
          maxLabel: localize(maxLabel),
        });
      }
      // Otherwise, just read out the value and the maximum value
      return formatMessage(messages.valueOutOfTotal, { value, total });
    },
    [maxColumns, question, formatMessage, localize]
  );

  if (!statements) return null;

  return (
    <>
      <Box overflowX="auto" ref={tableDivRef} id="e2e-matrix-control">
        <Table
          width={'100%'}
          style={{ borderCollapse: 'separate', borderSpacing: '0px 8px' }}
          aria-labelledby={`matrix-question-label-${id}`}
        >
          <Thead>
            <Tr>
              <Th pt="0px" />
              {columnsFromSchema.map((column, index) => {
                return (
                  <Th key={index} scope="col" pt="0px">
                    <Text
                      textAlign="center"
                      m="0px"
                      p="0px"
                      mx="auto"
                      color="tenantPrimary"
                    >
                      {column}
                    </Text>
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {statements.map((statement, index) => {
              const statementLabel = localize(statement.title_multiloc);
              return (
                <Tr key={index}>
                  <StickyTh
                    scope="row"
                    hasLongContent={
                      statementLabel.length > LONG_LABEL_THRESHOLD
                    }
                  >
                    <Text m="4px" color="tenantPrimary">
                      {statementLabel}
                    </Text>
                  </StickyTh>

                  {columnsFromSchema.map((_, columnIndex) => {
                    return (
                      <StyledTd key={`radio-${columnIndex}-${index}`}>
                        <Box display="flex" justifyContent="center">
                          <Radio
                            mx="auto"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                onChange({
                                  ...data,
                                  [statement.key]: columnIndex + 1,
                                });
                              }
                            }}
                            currentValue={
                              data ? data[statement.key] - 1 : undefined
                            }
                            value={columnIndex}
                            label={
                              <ScreenReaderOnly>
                                {getAriaValueText(
                                  columnIndex + 1,
                                  columnsFromSchema.length
                                )}
                                {localize(statements[index].title_multiloc)}
                              </ScreenReaderOnly>
                            }
                            name={`radio-group-${statement.key}-${id}`}
                            id={`${id}-${index}-${columnIndex}-radio`}
                            onChange={(value) => {
                              onChange({
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
              onChange(undefined);
            }}
          />
        </Box>
      )}
    </>
  );
};

export default Matrix;
