import React from 'react';

import {
  Box,
  IconButton,
  Text,
  colors,
  Button,
} from '@citizenlab/cl2-component-library';

import { IPermissionsFieldData } from 'api/permissions_fields/types';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const CustomField = ({ field }: { field: IPermissionsFieldData }) => {
  const customFieldId = field.relationships.custom_field.data?.id;
  const { data: customField } = useUserCustomField(customFieldId);
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  return (
    <Box
      w="100%"
      display="flex"
      alignItems="center"
      marginRight="20px"
      justifyContent="space-between"
    >
      <Text m="0" mt="4px" fontSize="m">
        {/* Has to be a span with style, because the SortableRow styled 
        component has a p selector that overrides any colors defined on the
        Text component */}
        <span style={{ color: colors.primary }}>
          {localize(customField?.data.attributes.title_multiloc)}
        </span>
      </Text>
      <Box display="flex">
        <Button
          icon="edit"
          buttonStyle="text"
          p="0"
          m="0"
          mr="28px"
          onClick={() => {}}
        >
          {formatMessage(messages.edit)}
        </Button>
        <IconButton
          iconName="delete"
          iconColor={colors.grey700}
          iconColorOnHover={colors.black}
          iconWidth="20px"
          mr="8px"
          a11y_buttonActionMessage="TODO"
          onClick={(e) => {
            e?.preventDefault();
          }}
        />
      </Box>
    </Box>
  );
};

export default CustomField;
