import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useCustomFieldStatements from 'api/custom_field_statements/useCustomFieldStatements';
import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import useLocale from 'hooks/useLocale';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';
import { useParams, useSearch } from 'utils/router';

import messages from '../../../../../messages';

type Props = {
  customField: IIdeaCustomField;
  rawValue: any;
};

const MatrixLongField = ({ customField, rawValue }: Props) => {
  const theme = useTheme();
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const [searchParams] = useSearch({ strict: false });

  // Get phase and project from URL
  const phaseId = searchParams.get('phase_id') || '';
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/analysis/$analysisId',
  });

  // Get the statements data for the custom field
  const statements = useCustomFieldStatements({
    projectId,
    phaseId,
    customFields: { data: [customField.data] },
  });

  // Create an array for the results with statement and linear scale data, so it's simpler to work with
  const resultArray =
    rawValue &&
    Object.entries(rawValue).map(([key, value]) => {
      const statement = statements.find(
        (statement) => statement.data?.data.attributes.key === key
      );

      return {
        statementTitle: statement?.data?.data.attributes.title_multiloc,
        valueLabel:
          customField.data.attributes[`linear_scale_label_${value}_multiloc`],
        value,
      };
    });

  return (
    <Box>
      <Title variant="h5" m="0px">
        <T value={customField.data.attributes.title_multiloc} />
      </Title>
      {resultArray ? (
        <>
          {resultArray.map((result, index) => (
            <Box
              key={index}
              display="flex"
              mt="8px"
              justifyContent="space-between"
              gap="12px"
            >
              <Box my="auto" maxWidth="50%">
                <Text m="0px">{result.statementTitle?.[locale]}</Text>
              </Box>

              <Box
                maxWidth="50%"
                border={`1px solid ${theme.colors.divider}`}
                borderRadius={theme.borderRadius}
                my="auto"
              >
                <Text m="0px" p="4px">
                  {result.valueLabel?.[locale] || result.value}
                </Text>
              </Box>
            </Box>
          ))}
        </>
      ) : (
        <Text m="0px">{formatMessage(messages.noAnswer)}</Text>
      )}
    </Box>
  );
};

export default MatrixLongField;
