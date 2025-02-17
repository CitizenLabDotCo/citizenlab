import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { FormattedDate } from 'react-intl';

import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../../../messages';

type Props = {
  rawValue: any;
  customField: IIdeaCustomField;
};

const DateLongField = ({ rawValue, customField }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <Title variant="h5" m="0px">
        <T value={customField.data.attributes.title_multiloc} />
      </Title>
      <Text>
        {rawValue ? (
          <FormattedDate value={rawValue} />
        ) : (
          formatMessage(messages.noAnswer)
        )}
      </Text>
    </Box>
  );
};

export default DateLongField;
