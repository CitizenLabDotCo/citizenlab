import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

import { FilterToggleButton } from './FilterToggleButton';
import { SelectOptionText } from './SelectOptionText';

type Props = {
  customField: IIdeaCustomField;
  rawValue: any;
};

const MultiselectImageLongField = ({ customField, rawValue }: Props) => {
  return (
    <Box>
      <Title variant="h5" m="0px">
        <T value={customField.data.attributes.title_multiloc} />
      </Title>
      <Text>
        {(rawValue as string[] | undefined)?.map((optionKey) => (
          <Box
            key={optionKey}
            display="flex"
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <SelectOptionText
              customFieldId={customField.data.id}
              selectedOptionKey={optionKey}
            />
            <Box ml="8px">
              <FilterToggleButton
                customFieldId={customField.data.id}
                value={optionKey}
              />
            </Box>
          </Box>
        ))}
      </Text>
    </Box>
  );
};

export default MultiselectImageLongField;
