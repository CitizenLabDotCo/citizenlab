import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import Warning from 'components/UI/Warning';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import { IIdeaData } from 'services/ideas';
import messages from './messages';

const StyledLink = styled(Link) `
  color: #1391A1;
  text-decoration: underline;
  transition: all 100ms ease-out;

  &:hover {
    text-decoration: underline;
  }
`;

interface InputProps {
  projectId: string | null;
  isLoggedIn: boolean | null;
  commentingEnabled: boolean | null;
  commentingDisabledReason: IIdeaData['relationships']['action_descriptor']['data']['commenting']['disabled_reason'] | null;
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

class CommentingDisabled extends React.PureComponent<Props> {

    calculateMessageDescriptor = () => {
      const { isLoggedIn, commentingEnabled, commentingDisabledReason } = this.props;

      if (commentingEnabled && isLoggedIn) {
        return null;
      } else if (commentingDisabledReason === 'project_inactive') {
        return messages.commentingDisabledProjectInactive;
      } else if (commentingDisabledReason === 'commenting_disabled') {
        return messages.commentingDisabledInContext;
      } else {
        return messages.signInToComment;
      }
    }

    render() {
      const { project } = this.props;
      const messageDescriptor = this.calculateMessageDescriptor();
      const projectTitle = (!isNilOrError(project) ? project.attributes.title_multiloc : null);

      if (!messageDescriptor) return null;

      return (
        <Warning>
          <FormattedMessage
            {...messageDescriptor}
            values={{
              signInLink: <StyledLink to="/sign-in"><FormattedMessage {...messages.signInLinkText} /></StyledLink>,
              projectName: projectTitle && <T value={projectTitle} />
            }}
          />
        </Warning>
      );
    }
}

export default (inputProps: InputProps) => (
  <GetProject id={inputProps.projectId}>
    {project => <CommentingDisabled {...inputProps} project={project} />}
  </GetProject>
);
