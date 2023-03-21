import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { getMethodConfig } from 'utils/participationMethodUtils';
import {
  Accordion,
  Box,
  colors,
  Title,
} from '@citizenlab/cl2-component-library';
import usePhases from 'hooks/usePhases';
import { PhaseActionForm } from '../../components/PhaseActionForm';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import { IPCPermissionData } from 'api/phase_permissions/types';

const Container = styled.div`
  margin-bottom: 20px;
`;

interface InputProps {
  projectId: string;
}

const Timeline = ({ projectId }: InputProps) => {
  const [openedPhaseId, setOpenedPhaseId] = useState<string | null>(null);
  const { mutate: updatePhasePermission } =
    useUpdatePhasePermission(openedPhaseId);
  const phases = usePhases(projectId);

  const handleCollapseToggle = (phaseId: string) => () => {
    setOpenedPhaseId(openedPhaseId === phaseId ? null : phaseId);
  };
  const handlePermissionChange = (
    permission: IPCPermissionData,
    permittedBy: IPCPermissionData['attributes']['permitted_by'],
    groupIds: string[]
  ) => {
    updatePhasePermission({
      permissionId: permission.id,
      phaseId: permission.relationships.permission_scope.data.id,
      action: permission.attributes.action,
      permission: { permitted_by: permittedBy, group_ids: groupIds },
    });
  };

  if (isNilOrError(phases)) {
    return null;
  }

  const openedPhase = phases?.filter((phase) => phase.id === openedPhaseId)[0];
  const config = getMethodConfig(
    openedPhase ? openedPhase.attributes.participation_method : 'ideation'
  );

  if (!isNilOrError(config)) {
    return (
      <Container>
        {phases &&
          phases.length > 0 &&
          phases.map((phase, i) => (
            <Accordion
              isOpenByDefault={false}
              title={
                <Title
                  variant="h3"
                  color="primary"
                  my="16px"
                  style={{ fontWeight: 500 }}
                >
                  <FormattedMessage {...messages.phase} />
                  {i + 1}
                  {' : '}
                  <T value={phase.attributes.title_multiloc} />
                </Title>
              }
              key={phase.id}
              onChange={() => {
                handleCollapseToggle(phase.id);
              }}
            >
              <Box
                display="flex"
                flex={'1'}
                flexDirection="column"
                background={colors.white}
              >
                <PhaseActionForm
                  phase={phase}
                  onChange={handlePermissionChange}
                  postType={config.postType}
                  projectId={projectId}
                />
              </Box>
            </Accordion>
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

export default (inputProps: InputProps) => <Timeline {...inputProps} />;
