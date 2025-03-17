import React, { useState } from 'react';

import {
  Box,
  colors,
  Table,
  Thead,
  Tr,
  Td,
  Tbody,
  stylingConsts,
  Title,
  IconButton,
  Th,
  Icon,
  Text,
  Tooltip,
  Button,
  Select,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { Unit } from 'api/analysis_heat_map_cells/types';
import useAnalysisHeatmapCells from 'api/analysis_heat_map_cells/useAnalysisHetmapCells';
import { AuthorCustomFilterKey } from 'api/analysis_inputs/types';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import { IUserCustomFields } from 'api/user_custom_fields/types';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import useLocalize from 'hooks/useLocalize';

import CloseIconButton from 'components/UI/CloseIconButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import Tag from '../Tags/Tag';

import messages from './messages';
import {
  convertLiftToPercentage,
  getCellBgColor,
  getCellTextColor,
} from './utils';

interface HeatMapProps {
  onClose: () => void;
  customFields: IUserCustomFields;
  initialCustomFieldId?: string;
  initialUnit?: Unit;
}

interface CustomFieldOptionsProps {
  customFieldId: string;
}

interface StyledTableProps {
  columns: number;
}

const StyledTable = styled(Table)<StyledTableProps>`
  table-layout: fixed;
  // Set the min-width to the sum of the first column width and the rest of the columns
  min-width: ${({ columns }) => `${200 + 120 * columns}px`};

  /* Set first column width */
  & th:first-child,
  & td:first-child {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

  & th:not(:first-child),
  & td:not(:first-child) {
    width: auto;
  }

  /* Make the table support sticky positioning */
  border-collapse: separate;
  border-spacing: 0;

  /* Make thead sticky */
  & thead th {
    position: sticky;
    top: 0;
    background-color: ${colors.white};
    z-index: 10;
    text-align: center;
  }

  /* Make first column sticky */
  & tr th:first-child,
  & tr td:first-child {
    position: sticky;
    left: 0;
    z-index: 5;
  }

  /* Increase z-index for the corner cell (thead first cell) */
  & thead th:first-child {
    z-index: 15;
  }

  /* Add striped rows */
  & tbody tr:nth-child(odd) td {
    background-color: ${colors.white};
  }

  & tbody tr:nth-child(even) td {
    background-color: ${colors.grey100};
  }
`;

const CustomFieldOptions: React.FC<CustomFieldOptionsProps> = ({
  customFieldId,
}) => {
  const { data: options } = useUserCustomFieldsOptions(customFieldId);
  const localize = useLocalize();

  return (
    <>
      {options?.data.map((option) => (
        <Th key={option.id}>{localize(option.attributes.title_multiloc)}</Th>
      ))}
    </>
  );
};

const HeatmapDetails = ({
  onClose,
  customFields,
  initialCustomFieldId,
  initialUnit,
}: HeatMapProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const [selectedFieldId, setSelectedFieldId] = useState(
    initialCustomFieldId || customFields.data[0].id
  );
  const [unit, setUnit] = useState<Unit>(initialUnit || 'inputs');
  const { analysisId } = useParams() as { analysisId: string };
  const { data: analysisHeatmapCells, isLoading } = useAnalysisHeatmapCells({
    analysisId,
    columnCategoryType: 'user_custom_field',
    columnCategoryId: selectedFieldId,
    unit,
  });

  const { data: tags } = useAnalysisTags({
    analysisId,
  });

  const { data: customField } = useUserCustomField(selectedFieldId);
  const { data: options } = useUserCustomFieldsOptions(selectedFieldId);
  const { mutate: addSummary } = useAddAnalysisSummary();

  const handleChangeCustomField = (offset: number) => {
    setSelectedFieldId((currentId) => {
      const fields = customFields.data;
      const currentIndex = fields.findIndex((field) => field.id === currentId);
      const length = fields.length;

      // Calculate new index with wraparound
      let newIndex = (currentIndex + offset) % length;
      if (newIndex < 0) newIndex += length;

      return fields[newIndex].id;
    });
  };

  const handleSummarize = ({
    tagId,
    option,
  }: {
    tagId: string;
    option: string;
  }) => {
    const authorKey: AuthorCustomFilterKey = `author_custom_${selectedFieldId}`;
    const filters: {
      tag_ids: string[];
      [authorKey: AuthorCustomFilterKey]: string[] | undefined;
    } = {
      tag_ids: [tagId],
      [authorKey]: [option],
    };

    addSummary({
      analysisId,
      filters,
    });
  };

  if (!options) return null;

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
      <Box display="flex" justifyContent="flex-end" py="12px">
        <CloseIconButton onClick={onClose} />
      </Box>
      <Box display="flex" justifyContent="flex-end" mb="12px">
        <Select
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
      <Box display="flex" justifyContent="space-between" w="100%" m="auto">
        {customFields.data.length > 1 && (
          <IconButton
            iconName="arrow-left"
            onClick={() => handleChangeCustomField(-1)}
            a11y_buttonActionMessage={formatMessage(messages.previousHeatmap)}
          />
        )}
        <Box>
          <Title fontSize="xl">
            {localize(customField?.data.attributes.title_multiloc)}
          </Title>

          {isLoading ? <Spinner size="20px" /> : null}
        </Box>
        {customFields.data.length > 1 && (
          <IconButton
            iconName="arrow-right"
            onClick={() => handleChangeCustomField(1)}
            a11y_buttonActionMessage={formatMessage(messages.nextHeatmap)}
          />
        )}
      </Box>
      <Box overflowX="auto" w="100%" h="100%" pb="220px">
        {/* The number of columns includes the number of options + the tags column  */}
        <StyledTable columns={options.data.length + 2}>
          <Thead>
            <Tr>
              <Th />
              <CustomFieldOptions customFieldId={selectedFieldId} />
            </Tr>
          </Thead>
          <Tbody>
            {tags?.data.map((tag) => (
              <Tr key={tag.id}>
                <Td>
                  <Tag
                    name={tag.attributes.name}
                    tagType={tag.attributes.tag_type}
                  />
                </Td>
                {options.data.map((option) => {
                  const cell = analysisHeatmapCells?.data.find(
                    (cell) =>
                      cell.relationships.row?.data.id === tag.id &&
                      cell.relationships.column?.data.id === option.id
                  );

                  const lift = cell?.attributes.lift;
                  const pValue = cell?.attributes.p_value;
                  const isSignificant = pValue !== undefined && pValue <= 0.05;

                  const cellBgColor = getCellBgColor(lift);
                  const cellTextColor = getCellTextColor(lift);

                  return (
                    <Td key={option.id}>
                      <Tooltip
                        disabled={!cell}
                        content={
                          <Box p="12px">
                            <Text>
                              {localize(cell?.attributes.statement_multiloc)}
                            </Text>
                            <Text color="textSecondary">
                              <FormattedMessage
                                {...messages.instances}
                                values={{ count: cell?.attributes.count }}
                              />
                            </Text>
                            {isSignificant ? (
                              <Text fontWeight="bold">
                                <FormattedMessage
                                  {...messages.statisticalSignificance}
                                />
                              </Text>
                            ) : null}

                            <Button
                              buttonStyle="secondary-outlined"
                              icon="stars"
                              onClick={() =>
                                handleSummarize({
                                  tagId: tag.id,
                                  option: option.attributes.key,
                                })
                              }
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
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </StyledTable>
      </Box>
    </Box>
  );
};

export default HeatmapDetails;
