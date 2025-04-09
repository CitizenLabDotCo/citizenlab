import React from 'react';

import { Button, ButtonProps } from '@citizenlab/cl2-component-library';

import { IAnalysisHeatmapCellData } from 'api/analysis_heat_map_cells/types';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import { ITagData } from 'api/analysis_tags/types';
import { ICustomFieldBinData } from 'api/custom_field_bins/types';
import useCustomFieldOption from 'api/custom_field_options/useCustomFieldOption';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  cell?: IAnalysisHeatmapCellData;
  row: ITagData | ICustomFieldBinData;
  column: ICustomFieldBinData;
  buttonStyle?: ButtonProps['buttonStyle'];
}

const SummarizeButton = ({ row, column, cell, buttonStyle }: Props) => {
  const { mutate: addSummary } = useAddAnalysisSummary();
  const { data: userCustomFields } = useUserCustomFields();

  const userCustomFieldsIds =
    userCustomFields?.data.map((customField) => customField.id) || [];

  const isRowOptionBin =
    'custom_field' in row.relationships &&
    'type' in row.attributes &&
    row.attributes.type === 'CustomFieldBins::OptionBin';

  const rowOptionId =
    'custom_field_option' in row.relationships &&
    row.relationships.custom_field_option?.data
      ? row.relationships.custom_field_option.data.id
      : '';

  const { data: rowCustomFieldOption } = useCustomFieldOption({
    optionId: rowOptionId,
    enabled: isRowOptionBin,
  });

  const { data: columnCustomFieldOption } = useCustomFieldOption({
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
      icon="stars"
      onClick={handleSummarize}
      disabled={isDisabled}
      buttonStyle={buttonStyle || 'text'}
      size="s"
    >
      <FormattedMessage {...messages.summarize} />
    </Button>
  );
};

export default SummarizeButton;
