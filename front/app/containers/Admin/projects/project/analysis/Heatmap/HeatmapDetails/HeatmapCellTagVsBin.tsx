import React from 'react';

import {
  Box,
  Tooltip,
  Text,
  Button,
  stylingConsts,
  Icon,
} from '@citizenlab/cl2-component-library';

import { IAnalysisHeatmapCellData } from 'api/analysis_heat_map_cells/types';
import { AuthorCustomFilterKey } from 'api/analysis_inputs/types';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import { ITagData } from 'api/analysis_tags/types';
import { ICustomFieldBinData } from 'api/custom_field_bins/types';
// import useUserCustomFieldsOption from 'api/user_custom_fields_options/useUserCustomFieldsOption';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import {
  convertLiftToPercentage,
  getCellBgColor,
  getCellTextColor,
} from './utils';

interface Props {
  cell: IAnalysisHeatmapCellData;
  tag: ITagData;
  bin: ICustomFieldBinData;
}

const HeatmapCellTagVsBin = ({ cell, tag, bin }: Props) => {
  const lift = cell.attributes.lift;
  const pValue = cell.attributes.p_value;
  const isSignificant = pValue <= 0.05;

  const cellBgColor = getCellBgColor(lift);
  const cellTextColor = getCellTextColor(lift);

  const localize = useLocalize();
  const { mutate: addSummary } = useAddAnalysisSummary();
  // const { data: option } = useUserCustomFieldsOption(bin.relationships.custom_field.data.id, bin.relationships.custom_field_option.data.id);

  const handleSummarize = () => {
    if (bin.relationships.custom_field_option === null) return;

    const authorKey: AuthorCustomFilterKey = `author_custom_${bin.relationships.custom_field.data.id}`;
    const filters: {
      tag_ids: string[];
      [authorKey: AuthorCustomFilterKey]: string[] | undefined;
    } = {
      tag_ids: [tag.id],
      [authorKey]: [bin.relationships.custom_field_option.data.id],
    };

    addSummary({
      analysisId: cell.relationships.analysis.data.id,
      filters,
    });
  };

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

          <Button
            buttonStyle="secondary-outlined"
            icon="stars"
            onClick={() => handleSummarize()}
          >
            <FormattedMessage {...messages.summarize} />
          </Button>
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
              name="alert-circle"
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
