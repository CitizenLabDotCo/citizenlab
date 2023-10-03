import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// resource hooks
import useCauses from 'api/causes/useCauses';

// resource components
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// components
import CauseCard from './CauseCard';

// styling
import styled from 'styled-components';

// typings
import { IParticipationContextType } from 'typings';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

const Container = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
`;

interface InputProps {
  type: IParticipationContextType;
  phaseId: string | null;
  projectId: string;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

const Volunteering = memo<Props>(
  ({
    projectId,
    phaseId,
    project,
    phase,
    type: participationContextType,
    className,
  }) => {
    const participationContextId =
      participationContextType === 'project' ? projectId : phaseId;
    const { data: causes } = useCauses({
      participationContextType,
      participationContextId,
    });

    if (
      !isNilOrError(causes) &&
      (!isNilOrError(project) ||
        (participationContextType === 'phase' && !isNilOrError(phase)))
    ) {
      const disabledPhase =
        phase &&
        pastPresentOrFuture([
          phase.attributes.start_at,
          phase.attributes.end_at,
        ]) !== 'present';

      const disabledProject =
        !isNilOrError(project) &&
        project.attributes.publication_status !== 'published';

      return (
        <Container className={className} id="volunteering">
          {causes.data.map((cause) => (
            <CauseCard
              key={cause.id}
              cause={cause}
              disabled={disabledPhase || disabledProject}
            />
          ))}
        </Container>
      );
    }

    return null;
  }
);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <Volunteering {...inputProps} {...dataProps} />}
  </Data>
);
