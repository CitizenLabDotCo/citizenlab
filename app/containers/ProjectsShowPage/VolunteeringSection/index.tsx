import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { IParticipationContextType } from 'typings';

import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

import styled from 'styled-components';

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

export class VolunteeringSection extends PureComponent<Props> {

  render() {
    const { projectId, phaseId, project, phase, type, authUser } = this.props;
    if (isNilOrError(project) || type === 'phase' && isNilOrError(phase)) {
      return null;
    }

    return (
      <Container>
        Volunteering!
      </Container>
    );
  }
}

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
