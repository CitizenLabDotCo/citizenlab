import React, { useState } from 'react';

import {
  Box,
  IconButton,
  Text,
  colors,
  Button,
} from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import { IPermissionsFieldData } from 'api/permissions_fields/types';
import useDeletePermissionsField from 'api/permissions_fields/useDeletePermissionsField';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import CustomFieldModal from './CustomFieldModal';
import messages from './messages';

interface Props {
  field: IPermissionsFieldData;
  phaseId: string;
  action: IPhasePermissionAction;
}

const CustomField = ({ field, phaseId, action }: Props) => {
  const customFieldId = field.relationships.custom_field.data?.id;
  const { data: customField } = useUserCustomField(customFieldId);
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: deletePermissionsField } = useDeletePermissionsField({
    phaseId,
    action,
  });

  const fieldName = localize(customField?.data.attributes.title_multiloc);

  return (
    <>
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
          <span style={{ color: colors.primary }}>{fieldName}</span>
        </Text>
        <Box display="flex">
          <Button
            icon="edit"
            buttonStyle="text"
            p="0"
            m="0"
            mr="28px"
            onClick={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
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
              deletePermissionsField(field.id);
            }}
          />
        </Box>
      </Box>
      <CustomFieldModal
        field={field}
        fieldName={fieldName}
        phaseId={phaseId}
        action={action}
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default CustomField;
