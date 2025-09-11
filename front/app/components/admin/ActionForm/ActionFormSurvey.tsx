import React from 'react';

import { Box, Title, Text, Toggle } from '@citizenlab/cl2-component-library';

import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';
import usePhase from 'api/phases/usePhase';

import { FormattedMessage } from 'utils/cl-intl';

import AccessRestrictions from '../ActionForm/AccessRestrictions';
import Fields from '../ActionForm/Fields';
import FlowVisualization from '../ActionForm/FlowVisualization';
import messages from '../ActionForm/messages';
import ResetButton from '../ActionForm/ResetButton';
import { showResetButton } from '../ActionForm/utils';

import DataCollection from './DataCollection';
import { Props } from './types';

const ActionFormSurvey = ({
  phaseId,
  permissionData,
  onChange,
  onReset,
  onChangePhaseSetting,
}: Props) => {
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

  const handleEveryoneTrackingUpdate = (everyone_tracking_enabled: boolean) => {
    onChange({ everyone_tracking_enabled });
  };

  if (!permissionsCustomFields) return null;
  if (!phase) return null;

  const { participation_method, user_fields_in_form_frontend_descriptor } =
    phase.data.attributes;

  // Currently only community monitor supports everyone tracking
  const canUseEveryoneTracking =
    participation_method === 'community_monitor_survey' &&
    action === 'posting_idea' &&
    permitted_by === 'everyone';

  const userFieldsInForm = user_fields_in_form_frontend_descriptor.value;

  return (
    <form className={`e2e-action-form-${action}`}>
      <AccessRestrictions
        showAnyone
        permissionData={permissionData}
        onChange={onChange}
      />
      <DataCollection
        anonymity={phase.data.attributes.anonymity}
        permitted_by={permitted_by}
        onChange={(anonymity) => {
          onChangePhaseSetting?.({ anonymity });
        }}
      />
      {permitted_by !== 'admins_moderators' && (
        <>
          <Box mt="20px">
            <Fields
              phaseId={phaseId}
              action={action}
              showAddQuestion={permitted_by !== 'everyone' || userFieldsInForm}
              user_fields_in_form_frontend_descriptor={
                user_fields_in_form_frontend_descriptor
              }
              permitted_by={permitted_by}
              onChangeUserFieldsInForm={(value) => {
                onChangePhaseSetting?.({ user_fields_in_form: value });
              }}
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
          ) && <ResetButton onClick={onReset} />}
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

export default ActionFormSurvey;
