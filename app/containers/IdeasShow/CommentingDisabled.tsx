import * as React from 'react';
import styled from 'styled-components';

import { Link } from 'react-router';
import Warning from 'components/UI/Warning';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

import { injectResource, InjectedResourceLoaderProps } from 'utils/resourceLoaders/resourceLoader';
import { IIdeaData } from 'services/ideas';
import { projectByIdStream, IProjectData } from 'services/projects';
import messages from './messages';


const StyledLink = styled(Link) `
  color: #1391A1;
  text-decoration: underline;
  transition: all 100ms ease-out;

  &:hover {
    text-decoration: underline;
  }
`;

type Props = {
  isLoggedIn: boolean | null;
  commentingEnabled: boolean | null;
  commentingDisabledReason: IIdeaData['relationships']['action_descriptor']['data']['commenting']['disabled_reason'] | null;
};

class CommentingDisabled extends React.PureComponent<Props & InjectedResourceLoaderProps<IProjectData>> {

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
      const messageDescriptor = this.calculateMessageDescriptor();
      const projectTitle = this.props.project && (this.props.project as IProjectData).attributes.title_multiloc;
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

export default injectResource('project', projectByIdStream, (props) => props.projectId)(CommentingDisabled);
