import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { RedactionField } from '../types';

import FieldRedactionRow from './FieldRedactionRow';
import SectionLabel from './SectionLabel';

type Props = {
  fields: RedactionField[];
  onToggleField: (key: string) => void;
};

const FieldRedactionList = ({ fields, onToggleField }: Props) => {
  const flaggedCount = fields.filter((field) => field.redact).length;

  return (
    <Box mb="24px">
      <Box mb="4px">
        <SectionLabel>
          <FormattedMessage {...messages.fieldReviewSectionTitle} />
        </SectionLabel>
      </Box>
      <Text color="textSecondary" mt="0px" mb="12px">
        {flaggedCount > 0 ? (
          <FormattedMessage
            {...messages.fieldReviewWithFlags}
            values={{ flaggedCount }}
          />
        ) : (
          <FormattedMessage {...messages.fieldReviewNoFlags} />
        )}
      </Text>
      <Box display="flex" flexDirection="column">
        {fields.map((field) => (
          <FieldRedactionRow
            key={field.key}
            field={field}
            onToggle={() => onToggleField(field.key)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default FieldRedactionList;
