import React, { useState } from 'react';

import {
  Box,
  colors,
  Tr,
  Td,
  Tbody,
  stylingConsts,
  Select,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { Unit } from 'api/analysis_heat_map_cells/types';
import useAnalysisHeatmapCells from 'api/analysis_heat_map_cells/useAnalysisHeatmapCells';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import { ICustomFieldBinData } from 'api/custom_field_bins/types';
import useCustomFieldBins from 'api/custom_field_bins/useCustomFieldBins';
import { IFlatCustomField } from 'api/custom_fields/types';
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import { IUserCustomFieldOptions } from 'api/user_custom_fields_options/types';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import useLocalize from 'hooks/useLocalize';

import CloseIconButton from 'components/UI/CloseIconButton';

import { useIntl } from 'utils/cl-intl';

import Tag from '../../Tags/Tag';
import messages from '../messages';

import HeatmapCellTagVsBin from './HeatmapCellTagVsBin';
import HeatmapTableHead from './HeatmapTableHead';
import StyledTable from './StyledTable';
import { useGetOptionText } from './utils';

const OptionTextTd = ({
  bin,
  options,
}: {
  bin: ICustomFieldBinData;
  options?: IUserCustomFieldOptions;
}) => {
  const optionText = useGetOptionText({
    bin,
    options,
  });

  return <Td>{optionText}</Td>;
};

interface HeatMapProps {
  onClose: () => void;
  userCustomFields: IUserCustomFieldData[];
  inputCustomFields: IFlatCustomField[];
  initialRowType?: string;
  initialColumnFieldId?: string;
  initialUnit?: Unit;
}

const HeatmapDetails = ({
  onClose,
  userCustomFields,
  inputCustomFields,
  initialRowType,
  initialColumnFieldId,
  initialUnit,
}: HeatMapProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const userCustomFieldsIds = userCustomFields.map(
    (customField) => customField.id
  );
  const inputCustomFieldsIds = inputCustomFields.map(
    (customField) => customField.id
  );

  const [unit, setUnit] = useState<Unit>(initialUnit || 'inputs');
  // The row type can be either 'tags' or a custom field id
  const [selectedRowType, setSelectedRowType] = useState(
    initialRowType || 'tags'
  );

  // The column type is always a custom field id
  const [selectedColumnFieldId, setSelectedColumnFieldId] = useState(
    initialColumnFieldId || userCustomFieldsIds[0]
  );
  const isSelectedRowTypeTags = selectedRowType === 'tags';

  const { analysisId } = useParams() as { analysisId: string };
  const { data: analysisHeatmapCells } = useAnalysisHeatmapCells({
    analysisId,
    columnCategoryType: 'input_custom_field',
    columnCategoryId: selectedColumnFieldId,
    rowCategoryType: isSelectedRowTypeTags ? 'tags' : 'input_custom_field',
    rowCategoryId: isSelectedRowTypeTags ? undefined : selectedRowType,
    unit,
  });

  const { data: tags } = useAnalysisTags({
    analysisId,
  });

  const { data: columnOptions } = useUserCustomFieldsOptions(
    selectedColumnFieldId
  );
  const { data: rowOptions } = useUserCustomFieldsOptions(
    !isSelectedRowTypeTags ? selectedRowType : undefined
  );
  const { data: columnBins } = useCustomFieldBins(selectedColumnFieldId);
  const { data: rowBins } = useCustomFieldBins(
    !isSelectedRowTypeTags ? selectedRowType : undefined
  );

  if (!columnOptions || !columnBins) return null;

  return (
    <Box
      position="absolute"
      top={`${stylingConsts.mobileMenuHeight + 12}px`}
      left="0"
      // The width is calculated so that is overlaps 3 out of the 4 columns on the screen.
      // The last column remains visible so that AI insights remain visible.
      width="calc(300px + (100% - 300px - 12px) * 2/3)"
      height="100vh"
      zIndex="100000"
      bg={colors.white}
    >
      <Box
        display="flex"
        justifyContent="flex-end"
        py="12px"
        position="absolute"
        top="0"
        right="12px"
      >
        <CloseIconButton onClick={onClose} />
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        gap="12px"
        mt="40px"
        mb="12px"
        px="12px"
      >
        <Box flex="2">
          <Select
            size="small"
            label={formatMessage(messages.rowValues)}
            value={selectedRowType}
            onChange={(option) => setSelectedRowType(option.value)}
            options={[
              {
                value: 'tags',
                label: formatMessage(messages.tags),
              },
              ...inputCustomFields.map((field) => ({
                value: field.id,
                label: localize(field.title_multiloc),
              })),
            ]}
            disabled={inputCustomFieldsIds.length === 0}
          />
        </Box>
        <Box flex="2">
          <Select
            size="small"
            label={formatMessage(messages.columnValues)}
            value={selectedColumnFieldId}
            onChange={(option) => setSelectedColumnFieldId(option.value)}
            options={[
              ...userCustomFields.map((field) => ({
                value: field.id,
                label: localize(field.attributes.title_multiloc),
              })),
              ...inputCustomFields.map((field) => ({
                value: field.id,
                label: localize(field.title_multiloc),
              })),
            ]}
          />
        </Box>
        <Box flex="1">
          <Select
            size="small"
            value={unit}
            label={formatMessage(messages.units)}
            onChange={(option) => setUnit(option.value)}
            options={[
              { value: 'inputs', label: formatMessage(messages.inputs) },
              { value: 'likes', label: formatMessage(messages.likes) },
              { value: 'dislikes', label: formatMessage(messages.dislikes) },
              {
                value: 'participants',
                label: formatMessage(messages.participants),
              },
            ]}
          />
        </Box>
      </Box>
      <Box overflowX="auto" w="100%" h="100%" pb="220px">
        {/* The number of columns includes the number of options + the tags column  */}
        <StyledTable columns={columnOptions.data.length + 2}>
          <HeatmapTableHead customFieldId={selectedColumnFieldId} />
          {isSelectedRowTypeTags ? (
            <Tbody>
              {tags?.data.map((tag) => (
                <Tr key={tag.id}>
                  <Td>
                    <Box maxWidth="200px">
                      <Tag
                        name={tag.attributes.name}
                        tagType={tag.attributes.tag_type}
                      />
                    </Box>
                  </Td>
                  {columnBins.data.map((bin) => {
                    const cell = analysisHeatmapCells?.data.find(
                      (cell) =>
                        cell.relationships.row.data.id === tag.id &&
                        cell.relationships.column.data.id === bin.id
                    );

                    return (
                      <Td key={bin.id}>
                        <HeatmapCellTagVsBin
                          cell={cell}
                          row={tag}
                          column={bin}
                        />
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </Tbody>
          ) : (
            <Tbody>
              {rowBins?.data.map((rowBin) => (
                <Tr key={rowBin.id}>
                  <Td>
                    <OptionTextTd bin={rowBin} options={rowOptions} />
                  </Td>
                  {columnBins.data.map((columnBin) => {
                    const cell = analysisHeatmapCells?.data.find(
                      (cell) =>
                        cell.relationships.row.data.id === rowBin.id &&
                        cell.relationships.column.data.id === columnBin.id
                    );

                    return (
                      <Td key={columnBin.id}>
                        <HeatmapCellTagVsBin
                          cell={cell}
                          row={rowBin}
                          column={columnBin}
                        />
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </Tbody>
          )}
        </StyledTable>
      </Box>
    </Box>
  );
};

export default HeatmapDetails;
