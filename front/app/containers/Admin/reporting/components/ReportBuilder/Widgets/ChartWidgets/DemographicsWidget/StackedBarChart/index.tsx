import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { DemographicsResponse } from 'api/graph_data_units/responseTypes/DemographicsWidget';

import useLocalize from 'hooks/useLocalize';

import BaseStackedBarChart from 'components/admin/Graphs/StackedBarChart';
import {
  getCornerRadius,
  stackLabels,
} from 'components/admin/Graphs/StackedBarChart/singleBarHelpers';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { parseResponse } from './parse';
import { tooltip } from './tooltip';

interface Props {
  response: DemographicsResponse;
}

const StackedBarChart = ({ response }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const [stackedBarHoverIndex, setStackedBarHoverIndex] = useState<
    number | undefined
  >();

  const onMouseOverStackedBar = ({ stackIndex }) => {
    setStackedBarHoverIndex(stackIndex);
  };

  const onMouseOutStackedBar = () => {
    setStackedBarHoverIndex(undefined);
  };

  const {
    data,
    percentages,
    columns,
    statusColorById,
    labels,
    legendItems,
    noDataBins,
  } = parseResponse(response, localize, formatMessage(messages.unknown));

  return (
    <Box display="flex" flexDirection="column" w="100%">
      <BaseStackedBarChart
        data={data}
        height={30}
        mapping={{
          stackedLength: columns,
          fill: ({ stackIndex }) => statusColorById[columns[stackIndex]],
          cornerRadius: getCornerRadius(columns.length, 3),
          opacity: ({ stackIndex }) => {
            if (stackedBarHoverIndex === undefined) return 1;
            return stackedBarHoverIndex === stackIndex ? 1 : 0.3;
          },
        }}
        layout="horizontal"
        labels={stackLabels(data, columns, percentages, 'bottom', 'black')}
        xaxis={{ hide: true, domain: [0, 'dataMax'] }}
        yaxis={{ hide: true, domain: ['dataMin', 'dataMax'] }}
        tooltip={tooltip(
          stackedBarHoverIndex,
          data,
          columns,
          percentages,
          labels
        )}
        legend={{
          items: legendItems,
          marginTop: 15,
          maintainGraphSize: true,
        }}
        onMouseOver={onMouseOverStackedBar}
        onMouseOut={onMouseOutStackedBar}
      />
      <Box>
        {noDataBins.length > 0 && (
          <Text my="8px" color="coolGrey500" fontSize="s" textAlign="center">
            <Text color="coolGrey600" my="0px">
              {formatMessage(messages.notRepresented)}
            </Text>
            <Box display="flex" justifyContent="center" flexWrap="wrap">
              {noDataBins.map((bin, index) => (
                <Text
                  color="coolGrey500"
                  fontSize="s"
                  key={index}
                  mx="4px"
                  my="0px"
                >
                  {bin}
                </Text>
              ))}
            </Box>
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default StackedBarChart;
