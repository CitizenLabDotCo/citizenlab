import React from 'react';

import {
  Box,
  Tooltip,
  Text,
  stylingConsts,
  Icon,
  colors,
  Shimmer,
} from '@citizenlab/cl2-component-library';

import { IAnalysisHeatmapCellData } from 'api/analysis_heat_map_cells/types';
import { ITagData } from 'api/analysis_tags/types';
import { ICustomFieldBinData } from 'api/custom_field_bins/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import StatementText from '../StatementText';
import SummarizeButton from '../SummarizeButton';

import {
  convertLiftToPercentage,
  getCellBgColor,
  getCellTextColor,
} from './utils';
interface Props {
  cell?: IAnalysisHeatmapCellData;
  row: ITagData | ICustomFieldBinData;
  column: ICustomFieldBinData;
}

const HeatmapCellTagVsBin = ({ cell, row, column }: Props) => {
  if (!cell) {
    return (
      <Shimmer
        borderRadius={stylingConsts.borderRadius}
        bgColor={colors.grey200}
        py="20px"
        position="relative"
        minHeight="92px"
      />
    );
  }

  const lift = cell.attributes.lift;
  const pValue = cell.attributes.p_value;
  const isSignificant = pValue <= 0.05;

  const cellBgColor = getCellBgColor(lift, isSignificant);
  const cellTextColor = getCellTextColor(lift, isSignificant);

  return (
    <Tooltip
      disabled={!cell}
      content={
        <Box p="12px">
          <StatementText cell={cell} />
          <Text color="textSecondary">
            <FormattedMessage
              {...messages.instances}
              values={{ count: cell.attributes.count }}
            />
          </Text>
          {isSignificant ? (
            <Text fontWeight="bold" display="flex">
              <Icon name="check-circle" mr="4px" width="20px" height="20px" />
              <FormattedMessage {...messages.statisticalSignificance} />
            </Text>
          ) : (
            <Text fontWeight="bold">
              <FormattedMessage {...messages.noStatisticalSignificance} />
            </Text>
          )}

          <SummarizeButton
            row={row}
            column={column}
            cell={cell}
            buttonStyle="secondary-outlined"
          />
        </Box>
      }
    >
      <Box
        borderRadius={stylingConsts.borderRadius}
        bgColor={cellBgColor}
        color={cellTextColor}
        py="20px"
        position="relative"
        minHeight="60px"
      >
        <Text
          m="0px"
          textAlign="center"
          fontWeight="bold"
          color="inherit"
          fontSize="xl"
        >
          {cell.attributes.count}
        </Text>
        <Text
          m="0px"
          textAlign="center"
          fontWeight="bold"
          color={cellTextColor === colors.white ? 'inherit' : 'textSecondary'}
          fontSize="s"
        >
          {convertLiftToPercentage(lift)}
        </Text>
        <Box position="absolute" right="4px" top="4px">
          {isSignificant ? (
            <Icon
              name="check-circle"
              fill={cellTextColor}
              width="20px"
              height="20px"
            />
          ) : null}
        </Box>
      </Box>
    </Tooltip>
  );
};

export default HeatmapCellTagVsBin;
