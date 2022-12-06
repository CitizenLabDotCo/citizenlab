import React, { memo } from 'react';
import { adopt } from 'react-adopt';
// styling
import styled from 'styled-components';
// typings
import { IParticipationContextType } from 'typings';
// resource components
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
// resource hooks
import useCauses from 'hooks/useCauses';
import { isNilOrError } from 'utils/helperUtils';
// components
import CauseCard from './CauseCard';

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
  ({ projectId, phaseId, project, phase, type, className }) => {
    const causes = useCauses({ projectId, phaseId });

    if (
      !isNilOrError(causes) &&
      (!isNilOrError(project) || (type === 'phase' && !isNilOrError(phase)))
    ) {
      return (
        <Container className={className}>
          {causes.data.map((cause) => (
            <CauseCard key={cause.id} cause={cause} />
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
