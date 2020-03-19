import React from 'react';
import styled from 'styled-components';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

import { IParticipationContextType } from 'typings';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import useCauses from 'hooks/useCauses';

import CauseCard from './CauseCard';

const Container = styled.div`
  color: ${({ theme }) => theme.colorText};
`;

interface InputProps {
  type: IParticipationContextType;
  phaseId: string | null;
  projectId: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps { }

const VolunteeringSection = (props: Props) => {

  const { projectId, phaseId, project, phase, type } = props;

  const causes = useCauses({ projectId, phaseId });

  if (isNilOrError(project) || type === 'phase' && isNilOrError(phase)) {
    return null;
  }

  if (isNilOrError(causes)) {
    return null;
  }

  return (
    <Container>
      {causes.data.map(cause => (
        <CauseCard
          key={cause.id}
          cause={cause}
        />
      ))}
    </Container>
  );
};

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ projectId, render }) => <GetProject projectId={projectId}>{render}</GetProject>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <VolunteeringSection {...inputProps} {...dataProps} />}
  </Data>
);
