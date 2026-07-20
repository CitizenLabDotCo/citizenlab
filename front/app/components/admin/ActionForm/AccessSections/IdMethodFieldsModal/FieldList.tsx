// The fields one method returns, each marked as locked (filled in from the
// official register) or editable by the participant. Methods that return
// nothing fall back to a generic message.

import React from 'react';

import {
  Box,
  Text,
  Icon,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { Field } from './utils';

interface Props {
  fields: Field[];
}

const FieldList = ({ fields }: Props) => {
  if (fields.length === 0) {
    return (
      <Text m="0" fontSize="s" color="coolGrey600">
        <FormattedMessage {...messages.noFieldsReturned} />
      </Text>
    );
  }

  return (
    <Box>
      {fields.map((field) => (
        <Box
          key={field.label}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          py="10px"
          px="12px"
          mb="6px"
          borderRadius={stylingConsts.borderRadius}
          bgColor={colors.grey50}
        >
          <Text m="0" fontSize="s" color="primary">
            {field.label}
          </Text>
          <Box display="flex" alignItems="center" gap="4px">
            <Icon
              name={field.locked ? 'lock' : 'edit'}
              width="14px"
              height="14px"
              fill={field.locked ? colors.coolGrey600 : colors.teal500}
            />
            <Text
              m="0"
              fontSize="xs"
              color={field.locked ? 'coolGrey600' : 'teal500'}
            >
              <FormattedMessage
                {...(field.locked ? messages.locked : messages.editable)}
              />
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default FieldList;
