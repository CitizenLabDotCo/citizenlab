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

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import Tooltip from '../../Tooltip';
import messages from '../messages';

import CustomFieldModal from './CustomFieldModal';

interface Props {
  field: IPermissionsFieldData;
  phaseId: string;
  disableEditing: boolean;
  action: IPhasePermissionAction;
}

const CustomField = ({ field, phaseId, disableEditing, action }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: deletePermissionsField } = useDeletePermissionsField({
    phaseId,
    action,
  });

  const fieldName = localize(field.attributes.title_multiloc);

  return (
    <>
      <Box
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box>
          <Text
            m="0"
            mt="4px"
            fontSize="m"
            color={disableEditing ? 'grey800' : 'primary'}
          >
            {fieldName}
          </Text>
          <Text
            fontSize="s"
            m="0px"
            color={disableEditing ? 'grey700' : 'grey800'}
          >
            {formatMessage(
              field.attributes.required ? messages.required : messages.optional
            )}
          </Text>
        </Box>
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
          <Tooltip disabled={!disableEditing} placement="left">
            <IconButton
              iconName="delete"
              iconColor={colors.grey700}
              iconColorOnHover={colors.black}
              iconWidth="20px"
              mr="8px"
              a11y_buttonActionMessage="TODO"
              disabled={disableEditing}
              onClick={(e) => {
                e?.preventDefault();
                deletePermissionsField(field.id);
              }}
            />
          </Tooltip>
        </Box>
      </Box>
      <CustomFieldModal
        field={field}
        fieldName={fieldName}
        phaseId={phaseId}
        action={action}
        opened={isModalOpen}
        disableEditing={disableEditing}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default CustomField;
