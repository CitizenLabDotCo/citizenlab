import React from 'react';

import {
  Box,
  Tooltip,
  Text,
  Button,
  stylingConsts,
  Icon,
  colors,
  Shimmer,
} from '@citizenlab/cl2-component-library';

import { IAnalysisHeatmapCellData } from 'api/analysis_heat_map_cells/types';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import { ITagData } from 'api/analysis_tags/types';
import { ICustomFieldBinData } from 'api/custom_field_bins/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import useUserCustomFieldsOption from 'api/user_custom_fields_options/useUserCustomFieldsOption';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

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

const SummarizeButton = ({
  row,
  column,
  cell,
}: {
  row: ITagData | ICustomFieldBinData;
  column: ICustomFieldBinData;
  cell?: IAnalysisHeatmapCellData;
}) => {
  const { mutate: addSummary } = useAddAnalysisSummary();
  const { data: userCustomFields } = useUserCustomFields();

  const userCustomFieldsIds =
    userCustomFields?.data.map((customField) => customField.id) || [];

  const isRowOptionBin =
    'custom_field' in row.relationships &&
    'type' in row.attributes &&
    row.attributes.type === 'CustomFieldBins::OptionBin';

  const rowCustomFieldId =
    'custom_field' in row.relationships
      ? row.relationships.custom_field.data?.id || ''
      : '';

  const rowOptionId =
    'custom_field_option' in row.relationships &&
    row.relationships.custom_field_option?.data
      ? row.relationships.custom_field_option.data.id
      : '';

  const { data: rowCustomFieldOption } = useUserCustomFieldsOption({
    customFieldId: rowCustomFieldId,
    optionId: rowOptionId,
    enabled: isRowOptionBin,
  });

  const { data: columnCustomFieldOption } = useUserCustomFieldsOption({
    customFieldId: column.relationships.custom_field.data?.id || '',
    optionId: column.relationships.custom_field_option?.data?.id || '',
    enabled: column.attributes.type === 'CustomFieldBins::OptionBin',
  });

  const formFilters = (
    bin: ITagData | ICustomFieldBinData,
    type: 'row' | 'column'
  ) => {
    // Handle Tag type
    if (bin.type === 'tag') {
      return { tag_ids: [bin.id] };
    }

    // For custom field bins
    const fieldId = bin.relationships.custom_field.data?.id || '';
    const isUserField = userCustomFieldsIds.includes(fieldId);
    const keyPrefix = isUserField ? 'author_custom_' : 'input_custom_';
    const binType = bin.attributes.type;

    const isRangeType = [
      'CustomFieldBins::AgeBin',
      'CustomFieldBins::RangeBin',
    ].includes(binType);
    const isOptionBin = binType === 'CustomFieldBins::OptionBin';

    if (isRangeType) {
      // For range type bins
      const fromKey = `${keyPrefix}${fieldId}_from`;
      const toKey = `${keyPrefix}${fieldId}_to`;

      return {
        [fromKey]: bin.attributes.range?.begin.toString(),
        [toKey]: bin.attributes.range?.end?.toString(),
      };
    }

    if (isOptionBin) {
      // For option bins
      const key = `${keyPrefix}${fieldId}`;

      if (type === 'row') {
        return {
          [key]: rowCustomFieldOption?.data.attributes.key
            ? [rowCustomFieldOption.data.attributes.key]
            : undefined,
        };
      }

      return {
        [key]: columnCustomFieldOption?.data.attributes.key
          ? [columnCustomFieldOption.data.attributes.key]
          : undefined,
      };
    }

    // For other bin types
    const key = `${keyPrefix}${fieldId}`;
    return {
      [key]: bin.attributes.values?.map((value) => value.toString()),
    };
  };

  const handleSummarize = () => {
    if (!cell || column.relationships.custom_field_option === null) return;

    const filters = {
      ...formFilters(row, 'row'),
      ...formFilters(column, 'column'),
    };

    addSummary({
      analysisId: cell.relationships.analysis.data.id,
      filters,
    });
  };

  const isDisabled = !cell || column.relationships.custom_field_option === null;

  return (
    <Button
      buttonStyle="secondary-outlined"
      icon="stars"
      onClick={handleSummarize}
      disabled={isDisabled}
    >
      <FormattedMessage {...messages.summarize} />
    </Button>
  );
};

const HeatmapCellTagVsBin = ({ cell, row, column }: Props) => {
  const localize = useLocalize();

  if (!cell) {
    return (
      <Shimmer
        borderRadius={stylingConsts.borderRadius}
        bgColor={colors.grey200}
        py="20px"
        position="relative"
        minHeight="60px"
      />
    );
  }

  const lift = cell.attributes.lift;
  const pValue = cell.attributes.p_value;
  const isSignificant = pValue <= 0.05;

  const cellBgColor = getCellBgColor(lift, isSignificant);
  const cellTextColor = getCellTextColor(lift, isSignificant);

  if (cell.attributes.count === 0) {
    return null;
  }
  return (
    <Tooltip
      disabled={!cell}
      content={
        <Box p="12px">
          <Text>{localize(cell.attributes.statement_multiloc)}</Text>
          <Text color="textSecondary">
            <FormattedMessage
              {...messages.instances}
              values={{ count: cell.attributes.count }}
            />
          </Text>
          {isSignificant ? (
            <Text fontWeight="bold">
              <FormattedMessage {...messages.statisticalSignificance} />
            </Text>
          ) : null}

          <SummarizeButton row={row} column={column} cell={cell} />
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
          fontSize="xs"
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
