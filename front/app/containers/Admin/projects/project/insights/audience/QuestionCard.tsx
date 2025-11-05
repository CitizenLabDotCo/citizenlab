import React from 'react';

import { Box, Text, IconButton } from 'component-library';

import { DemographicField } from 'api/phase_insights/types';

import StackedBarChart from './StackedBarChart';

interface Props {
  field: DemographicField;
  showRepresentativeness?: boolean;
}

const QuestionCard: React.FC<Props> = ({
  field,
  showRepresentativeness = true,
}) => {
  return (
    <Box
      background="white"
      display="flex"
      flexDirection="column"
      gap="16px"
      flexGrow={1}
      minWidth="300px"
      minHeight="0px"
      borderRadius="8px"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text
          fontSize="m"
          fontWeight="bold"
          color="textPrimary"
          m="0px"
          style={{ fontSize: '16px' }}
        >
          {field.field_name}
        </Text>
        <Box display="flex" gap="24px" alignItems="center">
          {field.r_score !== undefined && (
            <Box display="flex" gap="8px" alignItems="center">
              <Text
                fontSize="s"
                fontWeight="bold"
                color="textSecondary"
                m="0px"
                style={{ lineHeight: 0 }}
              >
                R.Score:
              </Text>
              <Box display="flex" alignItems="center" style={{ lineHeight: 0 }}>
                <Text
                  fontSize="s"
                  fontWeight="bold"
                  color="primary"
                  m="0px"
                  style={{ fontSize: '14px' }}
                >
                  {field.r_score}
                </Text>
                <Text
                  fontSize="s"
                  fontWeight="semi-bold"
                  m="0px"
                  style={{ fontSize: '14px', color: '#bdbdbd' }}
                >
                  /100
                </Text>
              </Box>
            </Box>
          )}
          <IconButton
            iconName="download"
            a11y_buttonActionMessage="Download"
            onClick={() => {
              // TODO: Implement download functionality
            }}
          />
        </Box>
      </Box>

      {/* Stacked bar chart */}
      <StackedBarChart
        data={field.data_points}
        showRepresentativeness={showRepresentativeness}
      />
    </Box>
  );
};

export default QuestionCard;
