import React, { PureComponent, memo } from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// services
import { canModerate } from 'services/permissions/rules/projectPermissions';
import { IdeaCommentingDisabledReason } from 'services/ideas';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// components
import T from 'components/T';
import Warning from 'components/UI/Warning';
import Link from 'utils/cl-router/Link';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div`
  margin-bottom: 40px;
`;

const NoCommentsWarning = styled(Warning)`
  margin-bottom: 20px;
`;

const StyledLink = styled(Link) `
  color: #1391A1;
  text-decoration: underline;
  transition: all 100ms ease-out;

  &:hover {
    text-decoration: underline;
  }
`;

interface InputProps {
  ideaId: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
  comments: GetCommentsChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

class IdeaCommentingWarnings extends PureComponent<Props> {
    calculateMessageDescriptor = (
      commentingEnabled: boolean,
      commentingDisabledReason: IdeaCommentingDisabledReason
    ) => {
      const { authUser } = this.props;
      const isLoggedIn = !isNilOrError(authUser);

      if (commentingEnabled && isLoggedIn) {
        return null;
      } else if (commentingDisabledReason === 'project_inactive') {
        return messages.commentingDisabledProjectInactive;
      } else if (commentingDisabledReason === 'commenting_disabled') {
        return messages.commentingDisabledInContext;
      } else if (commentingDisabledReason === 'idea_not_in_current_phase') {
        return messages.commentingDisabledIdeaNotInCurrentPhase;
      } else if (isLoggedIn && commentingDisabledReason === 'not_permitted') {
        return messages.commentingNotPermitted;
      } else if (!isLoggedIn && commentingDisabledReason === 'not_permitted') {
        return messages.commentingMaybeNotPermitted;
      } else {
        return messages.signInToComment;
      }
    }

    render() {
      const { idea, project, authUser, comments: { commentsList } } = this.props;
      const projectId = !isNilOrError(project) ? project.id : null;
      const projectTitle = (!isNilOrError(project) ? project.attributes.title_multiloc : null);
      const isModerator = !isNilOrError(authUser) && canModerate(projectId, { data: authUser });
      const commentingEnabled = (!isNilOrError(idea) ? get(idea.attributes.action_descriptor.commenting, 'enabled', false) : false);
      const commentingDisabledReason = (!isNilOrError(idea) ? get(idea.attributes.action_descriptor.commenting, 'disabled_reason', null) : null);
      const messageDescriptor = this.calculateMessageDescriptor(commentingEnabled, commentingDisabledReason);

      return (
        <Container>
          {/*
            Show warning message when there are no comments and you're logged in as an admin/project mod.
            Otherwise the comment section would be empty (because they don't see the parent comment box),
            which might look weird or confusing
          */}
          {isModerator && commentingEnabled && !isNilOrError(commentsList) && commentsList.length === 0 &&
            <NoCommentsWarning>
              <FormattedMessage {...messages.noComments} />
            </NoCommentsWarning>
          }

          {messageDescriptor &&
            <Warning>
              <FormattedMessage
                {...messageDescriptor}
                values={{
                  signInLink: <StyledLink to="/sign-in"><FormattedMessage {...messages.signInLinkText} /></StyledLink>,
                  projectName: projectTitle && <T value={projectTitle} />
                }}
              />
            </Warning>
          }

        </Container>
      );
    }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  comments: ({ ideaId, render }) => <GetComments postId={ideaId} postType="idea">{render}</GetComments>,
  project: ({ idea, render }) => <GetProject id={get(idea, 'relationships.project.data.id')}>{render}</GetProject>
});

export default memo<InputProps>((inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaCommentingWarnings {...inputProps} {...dataProps} />}
  </Data>
));
