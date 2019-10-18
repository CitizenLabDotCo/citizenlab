import React, { PureComponent, FormEvent } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { darken } from 'polished';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import { IIdeaData } from 'services/ideas';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import messages from './messages';
import clHistory from 'utils/cl-router/history';
import { fontSizes, colors } from 'utils/styleUtils';
import Button from 'components/UI/Button';

// events
import { openVerificationModalWithContext } from 'containers/App/events';

const Container = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  line-height: 20px;
`;

const ProjectLink = styled.span`
  color: ${colors.clBlueDark};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

const StyledButton = styled(Button)`
  color: #1391A1;
  text-decoration: underline;
  transition: all 100ms ease-out;

  &:hover {
    text-decoration: underline;
  }
  display: inline-block
`;

interface InputProps {
  projectId: string;
  budgetingDescriptor: IIdeaData['attributes']['action_descriptor']['budgeting'];
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps { }

interface State { }

class AssignBudgetDisabled extends PureComponent<Props, State> {
  onVerify = () => {
    openVerificationModalWithContext('ActionBudget');
  }

  reasonToMessage = () => {
    const { disabled_reason, future_enabled } = this.props.budgetingDescriptor;

    if (disabled_reason && future_enabled) {
      return messages.budgetingDisabledFutureEnabled;
    } else if (disabled_reason === 'not_verified') {
      return messages.budgetingDisabledNotVerified;
    } else if (disabled_reason === 'not_permitted') {
      return messages.budgetingDisabledNotPermitted;
    }

    return messages.budgetingDisabled;
  }

  handleProjectLinkClick = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const { project } = this.props;

    if (!isNilOrError(project)) {
      clHistory.push(`/projects/${project.attributes.slug}`);
    }
  }

  render() {
    const { budgetingDescriptor, project } = this.props;
    const projectTitle = (!isNilOrError(project) ? project.attributes.title_multiloc : {});
    const message = this.reasonToMessage();
    const enabledFromDate = (budgetingDescriptor.future_enabled ? moment(budgetingDescriptor.future_enabled).format('LL') : null);

    return (
      <Container>
        <FormattedMessage
          {...message}
          values={{
            enabledFromDate,
            projectName:
              <ProjectLink onClick={this.handleProjectLinkClick} role="navigation">
                <T value={projectTitle} />
              </ProjectLink>,
            verificationLink:
              <StyledButton style="text" padding="0" onClick={this.onVerify}>
                <FormattedMessage {...messages.verificationLinkText} />
              </StyledButton>,
          }}
        />
      </Container>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetProject id={inputProps.projectId}>
    {project => <AssignBudgetDisabled {...inputProps} project={project} />}
  </GetProject>
);
