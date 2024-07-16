import React from 'react';

import {
  Box,
  stylingConsts,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import { IPermissionsFieldData } from 'api/permissions_fields/types';
import useUpdatePermissionsField from 'api/permissions_fields/useUpdatePermissionsField';

import { useIntl } from 'utils/cl-intl';

import Tooltip from '../../Tooltip';
import { DISABLED_COLOR } from '../constants';
import messages from '../messages';

import nameMessages from './messages';

interface Props {
  field: IPermissionsFieldData;
  phaseId: string;
  disableEditing: boolean;
  action: IPhasePermissionAction;
}

const NameField = ({ field, phaseId, disableEditing, action }: Props) => {
  const { enabled } = field.attributes;
  const { formatMessage } = useIntl();

  const { mutate: updatePermissionsField } = useUpdatePermissionsField({
    phaseId,
    action,
  });

  const customTooltipMessage = disableEditing
    ? undefined // default message
    : nameMessages.nameCannotBeControlledYet;

  return (
    <>
      <Box
        pt="14px"
        pb="13px"
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
            {formatMessage(nameMessages.name)}
          </Text>
          <Text
            m="0"
            fontSize="s"
            color={disableEditing ? 'grey700' : 'grey800'}
          >
            {formatMessage(enabled ? messages.required : messages.notAsked)}
          </Text>
        </Box>
        <Box display="flex" flexDirection="row">
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
    </>
  );
};

export default NameField;
