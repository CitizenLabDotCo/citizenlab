import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import { IInputsData } from 'api/analysis_inputs/types';
import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../../../messages';

import { FilterToggleButton } from './FilterToggleButton';

type Props = {
  input: IInputsData;
  customField: IIdeaCustomField;
  rawValue: any;
  rawValueRelatedTextAnswer?: string;
};

const LinearScaleLongField = ({
  input,
  customField,
  rawValue,
  rawValueRelatedTextAnswer,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Box>
        <Title variant="h5" m="0px">
          <T value={customField.data.attributes.title_multiloc} />
        </Title>
        <Box display="flex" justifyContent="flex-start" alignItems="flex-start">
          <Text m="0">
            {input.attributes.custom_field_values[
              customField.data.attributes.key
            ] || formatMessage(messages.noAnswer)}
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

export default LinearScaleLongField;
