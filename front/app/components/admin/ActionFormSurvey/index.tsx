import React from 'react';

import {
  Box,
  Button,
  Title,
  fontSizes,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { IPermissionData } from 'api/permissions/types';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';
import { PermittedBy } from 'api/phase_permissions/types';
import usePhase from 'api/phases/usePhase';

import { FormattedMessage } from 'utils/cl-intl';

import AccessRestrictions from '../ActionForm/AccessRestrictions';
import Fields from '../ActionForm/Fields';
import FlowVisualization from '../ActionForm/FlowVisualization';
import messages from '../ActionForm/messages';
import { showResetButton } from '../ActionForm/utils';

type Changes = {
  permitted_by?: PermittedBy;
  group_ids?: string[];
  verification_expiry?: number | null;
  access_denied_explanation_multiloc?: Multiloc;
  everyone_tracking_enabled?: boolean;
};

interface Props {
  phaseId?: string;
  permissionData: IPermissionData;
  onChange: (changes: Changes) => Promise<void>;
  onReset: () => void;
}

const ActionForm = ({ phaseId, permissionData, onChange, onReset }: Props) => {
  const {
    attributes: {
      permitted_by,
      action,
      verification_enabled,
      verification_expiry,
      everyone_tracking_enabled,
    },
    relationships,
  } = permissionData;

  const groupIds = relationships.groups.data.map((p) => p.id);

  const { data: phase } = usePhase(phaseId);

  const { data: permissionsCustomFields } = usePermissionsCustomFields({
    phaseId,
    action,
  });

  const participation_method = phase?.data.attributes.participation_method;

  const userFieldsInForm = !!phase?.data.attributes.user_fields_in_form;

  // Currently only community monitor supports everyone tracking
  const canUseEveryoneTracking =
    participation_method === 'community_monitor_survey' &&
    action === 'posting_idea' &&
    permitted_by === 'everyone';

  const handleEveryoneTrackingUpdate = (everyone_tracking_enabled: boolean) => {
    onChange({ everyone_tracking_enabled });
  };

  if (!permissionsCustomFields) return null;

  return (
    <form className={`e2e-action-form-${action}`}>
      <AccessRestrictions permissionData={permissionData} onChange={onChange} />
      {permitted_by !== 'admins_moderators' && (
        <>
          <Box mt="24px">
            <Fields
              phaseId={phaseId}
              action={action}
              showAddQuestion={permitted_by !== 'everyone' || userFieldsInForm}
              userFieldsInForm={userFieldsInForm}
            />
          </Box>
          <Box mt="20px">
            <FlowVisualization
              permittedBy={permitted_by}
              verificationEnabled={verification_enabled}
              verificationExpiry={verification_expiry}
              permissionsCustomFields={permissionsCustomFields.data}
              onChangeVerificationExpiry={(verification_expiry) => {
                onChange({ verification_expiry });
              }}
              userFieldsInForm={userFieldsInForm}
            />
          </Box>
          {showResetButton(
            permitted_by,
            permissionsCustomFields.data,
            groupIds
          ) && (
            <Box mt="28px" w="100%" display="flex">
              <Button
                width="auto"
                buttonStyle="text"
                onClick={onReset}
                padding="0px"
                fontSize={`${fontSizes.m}px`}
              >
                <span style={{ textDecorationLine: 'underline' }}>
                  <FormattedMessage
                    {...messages.resetDemographicQuestionsAndGroups}
                  />
                </span>
              </Button>
            </Box>
          )}
          {canUseEveryoneTracking && (
            <Box mt="28px" width="90%">
              <Title variant="h4" color="primary" mb={'8px'}>
                <FormattedMessage {...messages.everyoneTracking} />
              </Title>
              <Toggle
                checked={everyone_tracking_enabled || false}
                onChange={() => {
                  handleEveryoneTrackingUpdate(!everyone_tracking_enabled);
                }}
                label={
                  <Box ml="8px" id="e2e-everyone-tracking-toggle">
                    <Box display="flex">
                      <Text
                        color="primary"
                        mb="0px"
                        fontSize="m"
                        fontWeight="semi-bold"
                      >
                        <FormattedMessage
                          {...messages.everyoneTrackingToggle}
                        />
                      </Text>
                    </Box>

                    <Text color="coolGrey600" mt="0px" fontSize="m">
                      <FormattedMessage
                        {...messages.everyoneTrackingDescription}
                      />{' '}
                      <span style={{ fontStyle: 'italic' }}>
                        <FormattedMessage {...messages.everyoneTrackingNote} />
                      </span>
                    </Text>
                  </Box>
                }
              />
            </Box>
          )}
        </>
      )}
    </form>
  );
};

export default ActionForm;
