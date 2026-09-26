import React from 'react';

import { Box, Radio, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IMatrixStatementsType } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import RadioOptionBox from '../_shared/RadioOptionBox';

interface Props {
  id: string;
  statements: IMatrixStatementsType[];
  columns: string[];
  value?: Record<string, number> | null;
  onChange: (value: Record<string, number> | null) => void;
}

// Alternative matrix layout for when the table doesn't fit horizontally:
// every statement is rendered as its own list of radio options.
const StatementList = ({ id, statements, columns, value, onChange }: Props) => {
  const theme = useTheme();
  const localize = useLocalize();

  return (
    <Box id="e2e-matrix-control">
      {statements.map((statement, index) => (
        <Box
          as="fieldset"
          key={statement.key}
          border="none"
          p="0px"
          m="0px"
          mb="24px"
        >
          <Box as="legend" p="0px" mb="12px">
            <Text as="span" color="textPrimary">
              {localize(statement.title_multiloc)}
            </Text>
          </Box>
          {columns.map((column, columnIndex) => (
            <RadioOptionBox
              key={columnIndex}
              selected={value?.[statement.key] === columnIndex + 1}
            >
              <Radio
                name={`radio-group-${statement.key}-${id}`}
                id={`${id}-${index}-${columnIndex}-radio`}
                value={columnIndex}
                currentValue={value ? value[statement.key] - 1 : undefined}
                label={column}
                buttonColor={theme.colors.tenantPrimary}
                onChange={(columnValue) => {
                  onChange({
                    ...value,
                    [statement.key]: columnValue + 1,
                  });
                }}
              />
            </RadioOptionBox>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default StatementList;
