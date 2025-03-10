import React, { useEffect, useState } from 'react';

import {
  Box,
  Icon,
  IconButton,
  Title,
  colors,
  Text,
  Button,
  Table,
  Thead,
  Tr,
  Td,
  Tbody,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useParams } from 'react-router-dom';

import useAnalysisHeatmapCells from 'api/analysis_heat_map_cells/useAnalysisHetmapCells';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import useLocalize from 'hooks/useLocalize';

import CloseIconButton from 'components/UI/CloseIconButton';

import { FormattedMessage } from 'utils/cl-intl';

import AuthorsByAge from './AuthorsByAge';
import AuthorsByDomicile from './AuthorsByDomicile';
import messages from './messages';

const SUPPORTED_CODES: IUserCustomFieldData['attributes']['code'][] = [
  'birthyear',
  'domicile',
];

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

const Demographics = () => {
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const { analysisId } = useParams() as { analysisId: string };
  const [supportedFieldIds, setSupportedFieldIds] = useState<string[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const { data: customFields } = useUserCustomFields();
  const { data: analysisHeatmapCells } = useAnalysisHeatmapCells({
    analysisId,
    maxPValue: 0.05,
    pageSize: 1,
  });

  const { data: analysisHeatmapCellsForMap } = useAnalysisHeatmapCells({
    analysisId,
  });

  const localize = useLocalize();

  const selectedField = customFields?.data.find(
    (field) => field.id === selectedFieldId
  );

  useEffect(() => {
    setSupportedFieldIds((supportedFieldIds) => {
      if (isEmpty(supportedFieldIds) && customFields) {
        const supportedFields = customFields.data.filter((field) =>
          SUPPORTED_CODES.includes(field.attributes.code)
        );
        if (!isEmpty(supportedFields)) {
          setSelectedFieldId(supportedFields[0].id);
        }
        return supportedFields.map((field) => field.id);
      } else {
        return supportedFieldIds;
      }
    });
  }, [customFields, setSelectedFieldId, setSupportedFieldIds]);

  const handleCycle = (offset: number) => {
    setSelectedFieldId((currentSelectedFieldId) => {
      const currentIndex = supportedFieldIds.findIndex(
        (id) => id === currentSelectedFieldId
      );
      const newIndex = mod(currentIndex + offset, supportedFieldIds.length);
      return supportedFieldIds[newIndex];
    });
  };

  const { data: tags } = useAnalysisTags({
    analysisId,
  });

  const { data: genderCustomField } = useUserCustomField(
    '6106ebc9-0b9c-43e1-af24-04a2bdbaa26c'
  );

  const { data: options } = useUserCustomFieldsOptions(
    '6106ebc9-0b9c-43e1-af24-04a2bdbaa26c'
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" px="24px" py="12px">
        <Icon height="16px" width="16px" name="users" mr="8px" />
        <Title variant="h5" m="0">
          <FormattedMessage {...messages.demographicsTitle} />
        </Title>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        minHeight="118px"
      >
        <Box>
          <IconButton
            iconName="arrow-left"
            onClick={() => handleCycle(-1)}
            a11y_buttonActionMessage={'Previous graph'}
            iconColor={colors.grey600}
            iconColorOnHover={colors.grey700}
          />
        </Box>
        <Box flex="1">
          {selectedField?.attributes.code === 'birthyear' && (
            <AuthorsByAge customFieldId={selectedField.id} />
          )}
          {selectedField?.attributes.code === 'domicile' && (
            <AuthorsByDomicile customFieldId={selectedField.id} />
          )}
        </Box>
        <Box>
          <IconButton
            iconName="arrow-right"
            onClick={() => handleCycle(1)}
            a11y_buttonActionMessage={'Next graph'}
            iconColor={colors.grey600}
            iconColorOnHover={colors.grey700}
          />
        </Box>
      </Box>
      {analysisHeatmapCells &&
        analysisHeatmapCells.data.map((cell) => {
          return (
            <Box
              key={cell.id}
              px="12px"
              py="12px"
              my="12px"
              bg={colors.teal100}
              borderRadius="3px"
            >
              <Text>{localize(cell.attributes.statement_multiloc)}</Text>
              <Box display="flex">
                <Button
                  buttonStyle="text"
                  icon="eye"
                  size="s"
                  p="0px"
                  onClick={() => setIsReadMoreOpen(true)}
                >
                  Read more
                </Button>
              </Box>
            </Box>
          );
        })}
      {isReadMoreOpen && (
        <Box
          position="absolute"
          top="85px"
          left="0"
          width="1380px"
          height="100vh"
          zIndex="100000000"
          overflow="scroll"
          bg="white"
        >
          <CloseIconButton onClick={() => setIsReadMoreOpen(false)} />
          {
            <Table>
              <Thead>
                <Tr>
                  <Td />
                  {options?.data.map((option) => (
                    <Td key={option.id}>
                      {localize(option.attributes.title_multiloc)}
                    </Td>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {tags?.data.map((tag) => (
                  <Tr key={tag.id}>
                    <Td>{tag.attributes.name}</Td>
                    {options?.data.map((option) => {
                      const cell = analysisHeatmapCellsForMap?.data.find(
                        (cell) =>
                          cell.relationships.row?.data.id === tag.id &&
                          cell.relationships.column?.data.id === option.id
                      );

                      const lift = cell?.attributes.lift;
                      const pValue = cell?.attributes.p_value;
                      const isSignificant =
                        pValue !== undefined && pValue <= 0.05;

                      return (
                        <Td
                          key={option.id}
                          bgColor={
                            lift !== undefined
                              ? lift > 1
                                ? colors.successLight
                                : colors.errorLight
                              : 'white'
                          }
                        >
                          {lift !== undefined ? lift.toFixed(2) : null}
                          {isSignificant ? ' *' : ''}
                        </Td>
                      );
                    })}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          }
        </Box>
      )}
    </Box>
  );
};

export default Demographics;
