import React from 'react';

import { Title, Box, Accordion } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useResetPhasePermission from 'api/phase_permissions/useResetPhasePermission';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import usePhase from 'api/phases/usePhase';

import ActionForm from 'components/admin/ActionForm';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { getPermissionActionSectionSubtitle } from './utils';

type Props = {
  phaseId: string;
};

const ActionForms = ({ phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { mutateAsync: updatePhasePermission } = useUpdatePhasePermission();
  const { mutate: resetPhasePermission } = useResetPhasePermission();

  if (!permissions || !phase) return null;

  const postType = ['native_survey', 'community_monitor_survey'].includes(
    phase.data.attributes.participation_method
  )
    ? 'nativeSurvey'
    : 'defaultInput';

  if (permissions.data.length === 0) {
    return (
      <p>
        <FormattedMessage {...messages.noActionsCanBeTakenInThisProject} />
      </p>
    );
  }

  if (permissions.data.length === 1) {
    const permission = permissions.data[0];
    const permissionAction = permission.attributes.action;
    return (
      <Box>
        <Title variant="h3" color="primary">
          <FormattedMessage
            {...getPermissionActionSectionSubtitle({
              permissionAction,
              postType,
            })}
          />
        </Title>
        <ActionForm
          phaseId={phaseId}
          permissionData={permission}
          onChange={async (permissionChanges) => {
            await updatePhasePermission({
              permissionId: permission.id,
              phaseId,
              action: permissionAction,
              permission: permissionChanges,
            });
          }}
          onReset={() =>
            resetPhasePermission({
              permissionId: permission.id,
              phaseId,
              action: permission.attributes.action,
            })
          }
        />
      </Box>
    );
  }

  return (
    <>
      {permissions.data.map((permission) => {
        const permissionAction = permission.attributes.action;

        return (
          <Accordion
            className={`e2e-action-accordion-${permissionAction}`}
            key={permission.id}
            timeoutMilliseconds={1000}
            transitionHeightPx={1700}
            isOpenByDefault={false}
            title={
              <Title
                variant="h3"
                color="primary"
                my="20px"
                style={{ fontWeight: 500 }}
              >
                <FormattedMessage
                  {...getPermissionActionSectionSubtitle({
                    permissionAction,
                    postType,
                  })}
                />
              </Title>
            }
          >
            <ActionForm
              phaseId={phaseId}
              permissionData={permission}
              onChange={async (permissionChanges) => {
                await updatePhasePermission({
                  permissionId: permission.id,
                  phaseId,
                  action: permissionAction,
                  permission: permissionChanges,
                });
              }}
              onReset={() =>
                resetPhasePermission({
                  permissionId: permission.id,
                  phaseId,
                  action: permission.attributes.action,
                })
              }
            />
          </Accordion>
        );
      })}
    </>
  );
};

export default ActionForms;
