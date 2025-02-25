import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import { IInputsData } from 'api/analysis_inputs/types';
import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../../../messages';

type Props = {
  input: IInputsData;
  customField: IIdeaCustomField;
};

const MultilineTextLongField = ({ input, customField }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <Title variant="h5" m="0px">
        <T value={customField.data.attributes.title_multiloc} />
      </Title>
      <Text whiteSpace="pre-line">
        {input.attributes.custom_field_values[
          customField.data.attributes.key
        ] || formatMessage(messages.noAnswer)}
      </Text>
    </Box>
  );
};

export default MultilineTextLongField;
