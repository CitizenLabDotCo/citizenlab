import React, { useState } from 'react';

import {
  Box,
  Button,
  stylingConsts,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import {
  IPermissionsFieldData,
  EmailConfig,
} from 'api/permissions_fields/types';
import useUpdatePermissionsField from 'api/permissions_fields/useUpdatePermissionsField';

import { useIntl } from 'utils/cl-intl';

import Tooltip from '../Tooltip';

import { DISABLED_COLOR } from './constants';
import EmailModal from './EmailModal';
import messages from './messages';

const getFieldNameMessage = (
  field_type: IPermissionsFieldData['attributes']['field_type']
) => {
  if (field_type === 'name') return messages.name;
  if (field_type === 'email') return messages.email;
  return undefined;
};

const isEmailConfig = (
  config: IPermissionsFieldData['attributes']['config']
): config is EmailConfig => {
  return 'password' in config && 'confirmed' in config;
};

interface Props {
  field: IPermissionsFieldData;
  phaseId: string;
  disableEditing: boolean;
  action: IPhasePermissionAction;
}

const DefaultField = ({ field, phaseId, disableEditing, action }: Props) => {
  const { field_type, config, enabled } = field.attributes;

  const { formatMessage } = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: updatePermissionsField } = useUpdatePermissionsField({
    phaseId,
    action,
  });

  const fieldNameMessage = getFieldNameMessage(field_type);
  if (!fieldNameMessage) return null;

  const customTooltipMessage = (() => {
    if (disableEditing) return undefined; // default message
    if (field_type === 'name') return messages.nameCannotBeControlledYet;
    if (field_type === 'email') return messages.emailCannotBeControlledYet;
    return undefined;
  })();

  return (
    <>
      <Box
        py="18px"
        borderTop={stylingConsts.border}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        bgColor={disableEditing ? DISABLED_COLOR : undefined}
      >
        <Box>
          <Text
            m="0"
            fontSize="m"
            color={disableEditing ? 'grey800' : 'primary'}
          >
            {formatMessage(fieldNameMessage)}
          </Text>
          {field_type === 'name' && (
            <Text
              m="0"
              fontSize="s"
              color={disableEditing ? 'grey700' : 'grey800'}
            >
              {formatMessage(
                field.attributes.enabled ? messages.required : messages.notAsked
              )}
            </Text>
          )}
        </Box>
        <Box display="flex" flexDirection="row">
          {field_type === 'email' && enabled && (
            <Button
              icon="edit"
              buttonStyle="text"
              p="0"
              m="0"
              mr="22px"
              onClick={() => setIsModalOpen(true)}
            >
              {formatMessage(messages.edit)}
            </Button>
          )}
          <Tooltip
            disabled={false}
            placement="left"
            message={customTooltipMessage}
          >
            <Box
              mb="-4px" // cancel out te bottom margin of the Toggle
            >
              <Toggle
                checked={enabled}
                disabled={true}
                onChange={() => {
                  updatePermissionsField({
                    id: field.id,
                    enabled: !enabled,
                  });
                }}
              />
            </Box>
          </Tooltip>
        </Box>
      </Box>
      {field_type === 'email' && isEmailConfig(config) && (
        <EmailModal
          opened={isModalOpen}
          config={config}
          disableEditing={disableEditing}
          onClose={() => setIsModalOpen(false)}
          onUpdateConfig={(config) =>
            updatePermissionsField({
              id: field.id,
              config,
            })
          }
        />
      )}
    </>
  );
};

export default DefaultField;
