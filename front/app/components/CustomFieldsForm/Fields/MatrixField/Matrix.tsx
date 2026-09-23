import React, {
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';

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
  useWindowSize,
} from '@citizenlab/cl2-component-library';
import { media } from 'component-library/utils/styleUtils';
import { useResizeDetector } from 'react-resize-detector';
import styled, { useTheme } from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import { sanitizeForClassname } from 'utils/JSONFormUtils';

import messages from '../../messages';
import { getLinearScaleLabel } from '../LinearScale/utils';

import StatementList from './StatementList';

const StickyTh = styled(Th)<{ hasLongContent: boolean }>`
  position: sticky;
  inset-inline-start: 0px;
  background: white;
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
  // This min-width also ensures that the th elements have the same min-width.
  min-width: 84px;

  .circle {
    margin-right: 0px;
    border: 1px solid ${(props) => props.theme.colors.borderDark};
  }
  .circle :hover {
    border-color: ${(props) => props.theme.colors.grey800};
  }
`;

const StyledTr = styled(Tr)`
  border-bottom: 1px solid ${(props) => props.theme.colors.borderDark};
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

  // We only want to show the table if it fits horizontally. To find out, we
  // render the table, measure it in a layout effect and then decide what to
  // show. Because state updates from layout effects are flushed before the
  // browser paints, the table never flashes on screen when it overflows.
  // We measure again whenever the width of the container (the space we have)
  // or of the table itself (the space we need) changes. The table width can
  // change independently of the container, e.g. when fonts load.
  // We also measure again when the window width changes, because the
  // statement column has vw-based widths (and a phone-specific min-width):
  // the table can start fitting again while the container width stays the
  // same (the survey form has a max-width), and while the placeholder is
  // shown there is no table to observe.
  const { windowWidth } = useWindowSize();
  const { width: containerWidth, ref: containerRef } =
    useResizeDetector<HTMLDivElement>({ handleHeight: false });
  // The header row is always exactly as wide as the table
  const { width: tableWidth, ref: headerRowRef } =
    useResizeDetector<HTMLTableRowElement>({ handleHeight: false });
  const [overflowMeasurement, setOverflowMeasurement] = useState<{
    containerWidth?: number;
    tableWidth?: number;
    windowWidth: number;
    isOverflowing: boolean;
  } | null>(null);
  // While the placeholder is shown, the table is unmounted and tableWidth
  // keeps its last value, so only a container or window width change
  // triggers a new measurement then.
  const needsMeasuring =
    overflowMeasurement === null ||
    overflowMeasurement.containerWidth !== containerWidth ||
    overflowMeasurement.tableWidth !== tableWidth ||
    overflowMeasurement.windowWidth !== windowWidth;
  const showTable = needsMeasuring || !overflowMeasurement.isOverflowing;

  useLayoutEffect(() => {
    if (!needsMeasuring) return;
    const tableElement = tableDivRef.current;
    if (!tableElement) return;

    setOverflowMeasurement({
      containerWidth,
      tableWidth,
      windowWidth,
      isOverflowing: tableElement.scrollWidth > tableElement.clientWidth,
    });
  }, [needsMeasuring, containerWidth, tableWidth, windowWidth]);

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
    const tableElement = tableDivRef.current;
    if (!tableElement) return;

    const checkApplyBorder = () => {
      if (
        tableElement.scrollLeft + 4 >= // 4 is used as a small offset to make sure it "catches" correctly
        tableElement.scrollWidth - tableElement.clientWidth
      ) {
        tableElement.style.borderRight = 'none';
      } else {
        tableElement.style.borderRight = `1px dashed ${theme.colors.borderLight}`;
      }
    };

    checkApplyBorder();

    tableElement.addEventListener('scroll', checkApplyBorder);
    return () => tableElement.removeEventListener('scroll', checkApplyBorder);
  }, [theme.colors.borderLight, showTable]);

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
    <Box ref={containerRef} w="100%">
      {showTable ? (
        <Box overflowX="auto" ref={tableDivRef} id="e2e-matrix-control">
          <Table
            width={'100%'}
            style={{ borderCollapse: 'collapse', borderSpacing: '0px 8px' }}
            aria-labelledby={`${sanitizeForClassname(id)}-label`}
          >
            <Thead>
              <Tr innerRef={headerRowRef}>
                <Th
                  scope="col"
                  pt="0px"
                  borderBottom={`1px solid ${theme.colors.borderDark} !important`}
                >
                  <ScreenReaderOnly>
                    {formatMessage(messages.matrixStatementHeader)}
                  </ScreenReaderOnly>
                </Th>
                {columnsFromSchema.map((column, index) => {
                  return (
                    <Th
                      key={index}
                      scope="col"
                      pt="0px"
                      borderBottom={`1px solid ${theme.colors.borderDark} !important`}
                    >
                      <Text
                        textAlign="center"
                        m="0px"
                        p="0px"
                        mx="auto"
                        color="textPrimary"
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
                  <StyledTr key={index}>
                    <StickyTh
                      scope="row"
                      hasLongContent={
                        statementLabel.length > LONG_LABEL_THRESHOLD
                      }
                    >
                      <Text m="4px" color="textPrimary">
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
                              buttonColor={theme.colors.tenantPrimary}
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
                  </StyledTr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <StatementList
          id={id}
          statements={statements}
          columns={columnsFromSchema}
          value={data}
          onChange={onChange}
        />
      )}
      {data !== undefined && (
        <Box display="flex">
          <Button
            type="button"
            p="0px"
            buttonStyle="text"
            textColor={theme.colors.textPrimary}
            textDecoration="underline"
            mt="4px"
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
    </Box>
  );
};

export default Matrix;
