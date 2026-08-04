import React from 'react';

import { Box, Button, Spinner, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { RedactionField } from '../types';

import FieldRedactionRow from './FieldRedactionRow';
import SectionLabel from './SectionLabel';

type Props = {
  fields: RedactionField[];
  onToggleField: (key: string) => void;
  onSetAllFields: (redact: boolean) => void;
  isLoading?: boolean;
};

const FieldRedactionList = ({
  fields,
  onToggleField,
  onSetAllFields,
  isLoading,
}: Props) => {
  const flaggedCount = fields.filter((field) => field.redact).length;
  const allIncluded = fields.length > 0 && flaggedCount === 0;

  return (
    <Box mb="24px">
      <Box mb="4px">
        <SectionLabel>
          <FormattedMessage {...messages.fieldReviewSectionTitle} />
        </SectionLabel>
      </Box>
      {isLoading ? (
        <Box py="8px">
          <Spinner size="20px" />
        </Box>
      ) : (
        <>
          <Text color="textSecondary" mt="0px" mb="4px">
            {flaggedCount > 0 ? (
              <FormattedMessage
                {...messages.fieldReviewWithFlags}
                values={{ flaggedCount }}
              />
            ) : (
              <FormattedMessage {...messages.fieldReviewNoFlags} />
            )}
          </Text>
          <Box display="flex" justifyContent="flex-end" mb="4px">
            <Button
              buttonStyle="text"
              padding="0"
              fontSize="14px"
              onClick={() => onSetAllFields(allIncluded)}
              data-cy="e2e-field-redaction-select-all"
            >
              {allIncluded ? (
                <FormattedMessage {...messages.deselectAllFields} />
              ) : (
                <FormattedMessage {...messages.selectAllFields} />
              )}
            </Button>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            data-cy="e2e-field-redaction-list"
          >
            {fields.map((field) => (
              <FieldRedactionRow
                key={field.key}
                field={field}
                onToggle={() => onToggleField(field.key)}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default FieldRedactionList;
