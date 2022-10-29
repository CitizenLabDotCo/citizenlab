import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes } from 'utils/styleUtils';

// components
import Collapse from 'components/UI/Collapse';
import ActionsForm from './ActionsForm';

// services
import {
  updatePhasePermission,
  IPCPermissionData,
} from 'services/actionPermissions';

// resources
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetPhasePermissions from 'resources/GetPhasePermissions';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { getMethodConfig } from 'utils/participationMethodUtils';

const Container = styled.div`
  margin-bottom: 20px;

  p {
    font-size: ${fontSizes.base}px;
    font-style: italic;
  }
`;

const Permissions = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 25px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ddd;
  background: #fff;
`;

interface InputProps {
  projectId: string;
}

interface DataProps {
  phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps {}

const Timeline = ({ projectId, phases }: Props) => {
  const [openedPhaseId, setOpenedPhaseId] = useState<string | null>(null);
  const handleCollapseToggle = (phaseId: string) => () => {
    setOpenedPhaseId(openedPhaseId === phaseId ? null : phaseId);
  };
  const handlePermissionChange = (
    permission: IPCPermissionData,
    permittedBy: IPCPermissionData['attributes']['permitted_by'],
    groupIds: string[]
  ) => {
    updatePhasePermission(
      permission.id,
      permission.relationships.permission_scope.data.id,
      permission.attributes.action,
      { permitted_by: permittedBy, group_ids: groupIds }
    );
  };

  const openedPhase = phases?.filter((phase) => phase.id === openedPhaseId)[0];
  const config = getMethodConfig(
    openedPhase ? openedPhase.attributes.participation_method : 'ideation'
  );

  if (!isNilOrError(config)) {
    return (
      <Container>
        {phases &&
          phases.length > 0 &&
          phases.map((phase) => (
            <div style={{ marginBottom: '20px' }} key={phase.id}>
              <Collapse
                opened={openedPhaseId === phase.id}
                onToggle={handleCollapseToggle(phase.id)}
                label={<T value={phase.attributes.title_multiloc} />}
              >
                <Permissions>
                  <GetPhasePermissions phaseId={phase.id}>
                    {(permissions) => {
                      return isNilOrError(permissions) ? null : (
                        <ActionsForm
                          permissions={permissions}
                          onChange={handlePermissionChange}
                          postType={config.postType}
                          projectId={projectId}
                        />
                      );
                    }}
                  </GetPhasePermissions>
                </Permissions>
              </Collapse>
            </div>
          ))}
        {!phases ||
          (phases.length < 1 && (
            <p>
              <FormattedMessage
                {...messages.noActionsCanBeTakenInThisProject}
              />
            </p>
          ))}
      </Container>
    );
  }
  return null;
};

export default (inputProps: InputProps) => (
  <GetPhases projectId={inputProps.projectId}>
    {(phases) => <Timeline {...inputProps} phases={phases} />}
  </GetPhases>
);
