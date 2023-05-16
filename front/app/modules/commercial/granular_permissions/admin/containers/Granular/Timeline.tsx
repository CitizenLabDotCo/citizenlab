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
import usePhases from 'api/phases/usePhases';
import { PhaseActionForm } from '../../components/PhaseActionForm';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import { HandlePermissionChangeProps } from './utils';

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
  const { data: phases } = usePhases(projectId);

  const handlePermissionChange = ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => {
    if (openedPhaseId) {
      updatePhasePermission({
        permissionId: permission.id,
        phaseId: openedPhaseId,
        action: permission.attributes.action,
        permission: {
          permitted_by: permittedBy,
          group_ids: groupIds,
          global_custom_fields: globalCustomFields,
        },
      });
    }
  };

  if (!phases) {
    return null;
  }

  const openedPhase = phases.data.filter(
    (phase) => phase.id === openedPhaseId
  )[0];

  const config = getMethodConfig(
    openedPhase ? openedPhase.attributes.participation_method : 'ideation'
  );

  if (!isNilOrError(config)) {
    return (
      <Container>
        {phases.data &&
          phases.data.length > 0 &&
          phases.data.map((phase, i) => (
            <Accordion
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
                  <FormattedMessage {...messages.phase} />
                  {` ${i + 1}: `}
                  <T value={phase.attributes.title_multiloc} />
                </Title>
              }
              key={phase.id}
              onChange={() => {
                setOpenedPhaseId(openedPhaseId === phase.id ? null : phase.id);
              }}
            >
              <Box
                display="flex"
                flex={'1'}
                flexDirection="column"
                background={colors.white}
                minHeight="100px"
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
        {!phases.data ||
          (phases.data.length < 1 && (
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
