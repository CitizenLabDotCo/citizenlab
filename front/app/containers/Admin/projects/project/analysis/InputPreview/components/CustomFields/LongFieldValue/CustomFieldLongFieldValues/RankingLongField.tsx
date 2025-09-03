import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../../../messages';

import { SelectOptionText } from './SelectOptionText';

type Props = {
  customField: IIdeaCustomField;
  rawValue: any;
};

const RankingLongField = ({ customField, rawValue }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Title variant="h5" m="0px">
        <T value={customField.data.attributes.title_multiloc} />
      </Title>
      {rawValue ? (
        <>
          {rawValue.map((optionKey: string, index: number) => (
            <Box key={optionKey} display="flex" mt="8px">
              <Text mr="8px" my="auto">
                #{index + 1}
              </Text>
              <Box
                border={`1px solid ${theme.colors.divider}`}
                borderRadius={theme.borderRadius}
              >
                <Text m="4px 8px">
                  <SelectOptionText
                    customFieldId={customField.data.id}
                    selectedOptionKey={optionKey}
                  />
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

export default RankingLongField;
