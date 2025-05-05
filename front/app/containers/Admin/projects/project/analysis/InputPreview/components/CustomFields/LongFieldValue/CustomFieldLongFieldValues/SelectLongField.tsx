import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

import { FilterToggleButton } from './FilterToggleButton';
import { SelectOptionText } from './SelectOptionText';

type Props = {
  customField: IIdeaCustomField;
  rawValue: any;
  rawValueRelatedTextAnswer?: string;
};

const SelectLongField = ({
  customField,
  rawValue,
  rawValueRelatedTextAnswer,
}: Props) => {
  return (
    <Box>
      <Box>
        <Title variant="h5" m="0px">
          <T value={customField.data.attributes.title_multiloc} />
        </Title>
        <Box display="flex" justifyContent="flex-start" alignItems="flex-start">
          <Text m="0">
            <SelectOptionText
              customFieldId={customField.data.id}
              selectedOptionKey={rawValue}
            />
          </Text>
          <Box ml="8px">
            <FilterToggleButton
              customFieldId={customField.data.id}
              value={rawValue || null}
            />
          </Box>
        </Box>
      </Box>
      {rawValueRelatedTextAnswer && (
        <Text my="4px">{rawValueRelatedTextAnswer}</Text>
      )}
    </Box>
  );
};

export default SelectLongField;
