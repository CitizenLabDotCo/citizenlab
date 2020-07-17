// Libraries
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';
import styled from 'styled-components';

// Services / Data loading
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

// Components
import ExportVolunteersButton from './ExportVolunteersButton';
import AllCauses from './AllCauses';
import T from 'components/T';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const PhaseContainer = styled.div`
  &:not(:last-child) {
    margin-bottom: 50px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const Left = styled.div`
  margin-right: 80px;
`;

interface InputProps {}

interface DataProps {
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps {}

export class AdminProjectVolunteering extends React.PureComponent<Props> {
  render() {
    const { project, phases } = this.props;
    if (isNilOrError(project)) return null;

    if (
      project.attributes.process_type === 'continuous' &&
      project.attributes.participation_method === 'volunteering'
    ) {
      return (
        <Container>
          <HeaderContainer>
            <Left>
              <SectionTitle>
                <FormattedMessage {...messages.titleVolunteeringTab} />
              </SectionTitle>
              <SectionDescription>
                <FormattedMessage {...messages.subtitleVolunteeringTab} />
              </SectionDescription>
            </Left>
            <ExportVolunteersButton
              participationContextType="project"
              participationContextId={project.id}
            />
          </HeaderContainer>
          <AllCauses
            projectId={project.id}
            participationContextType="project"
            participationContextId={project.id}
          />
        </Container>
      );
    }

    if (
      project.attributes.process_type === 'timeline' &&
      !isNilOrError(phases)
    ) {
      const volunteeringPhases = phases.filter(
        (phase) => phase.attributes.participation_method === 'volunteering'
      );
      if (volunteeringPhases.length === 0) return null;
      return (
        <Container>
          <SectionTitle>
            <FormattedMessage {...messages.titleVolunteeringTab} />
          </SectionTitle>
          <SectionDescription>
            <FormattedMessage {...messages.subtitleVolunteeringTab} />
          </SectionDescription>
          {volunteeringPhases.map((phase) => (
            <PhaseContainer key={phase.id}>
              <HeaderContainer>
                <Left>
                  <h3>
                    <T value={phase.attributes.title_multiloc} />
                  </h3>
                </Left>
                <ExportVolunteersButton
                  participationContextId={phase.id}
                  participationContextType="phase"
                />
              </HeaderContainer>
              <AllCauses
                projectId={project.id}
                participationContextType="phase"
                participationContextId={phase.id}
              />
            </PhaseContainer>
          ))}
        </Container>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  phases: ({ params, render }) => (
    <GetPhases projectId={params.projectId}>{render}</GetPhases>
  ),
  project: ({ params, render }) => (
    <GetProject projectId={params.projectId}>{render}</GetProject>
  ),
});

export default withRouter<InputProps>(
  (inputProps: InputProps & WithRouterProps) => (
    <Data {...inputProps}>
      {(dataProps) => (
        <AdminProjectVolunteering {...inputProps} {...dataProps} />
      )}
    </Data>
  )
);
