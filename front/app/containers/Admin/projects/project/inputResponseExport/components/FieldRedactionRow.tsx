import React from 'react';

import {
  Box,
  Text,
  Badge,
  Toggle as PlainToggle,
  colors,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { RedactionField } from '../types';

type Props = {
  field: RedactionField;
  onToggle: () => void;
};

const FieldRedactionRow = ({ field, onToggle }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="12px"
      py="8px"
      borderTop={`1px solid ${colors.borderLight}`}
      data-cy={`e2e-field-redaction-row-${field.key}`}
    >
      <Box display="flex" alignItems="center" gap="10px">
        <PlainToggle checked={!field.redact} onChange={onToggle} />
        <Text m="0px" color="textSecondary">
          {field.label}
        </Text>
      </Box>
      <Badge
        color={field.redact ? colors.red600 : colors.success}
        className="inverse"
      >
        {field.redact
          ? formatMessage(messages.excludeStatus)
          : formatMessage(messages.includeStatus)}
      </Badge>
    </Box>
  );
};

export default FieldRedactionRow;
