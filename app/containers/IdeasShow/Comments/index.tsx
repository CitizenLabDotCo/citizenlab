// libraries
import React, { memo, useState, useCallback } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';

// services
import { canModerate } from 'services/permissions/rules/projectPermissions';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import LoadingComments from './LoadingComments';
import ParentCommentForm from './ParentCommentForm';
import Comments from './Comments';
import CommentingDisabled from './CommentingDisabled';
import Warning from 'components/UI/Warning';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';

// typings
import { ICommentSortOptions } from './CommentSorting';

const Container = styled.div``;

const StyledWarning = styled(Warning)`
  margin-bottom: 20px;
`;

export interface InputProps {
  ideaId: string;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
  comments: GetCommentsChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

const CommentsSection = memo<Props>(({ ideaId, authUser, idea, comments, project, className }) => {
  const [sortOrder, setSortOrder] = useState<ICommentSortOptions>('oldest_to_newest');

  const handleSortOrderChange = useCallback(
    (sortOrder: ICommentSortOptions) => {
      setSortOrder(sortOrder);
    }, []
  );

  const isModerator = !isNilOrError(authUser) && canModerate(get(project, 'id'), { data: authUser });
  const commentingEnabled = (!isNilOrError(idea) ? get(idea.relationships.action_descriptor.data.commenting, 'enabled', false) : false);
  const commentingDisabledReason = (!isNilOrError(idea) ? get(idea.relationships.action_descriptor.data.commenting, 'disabled_reason', null) : null);

  return (
    <Container className={className}>
      {(!isNilOrError(idea) && !isNilOrError(comments) && !isNilOrError(project)) ? (
        <>
          {/*
          Show warning messages when there are no comments and you're looged in as an admin.
          Otherwise the comment section would be empty (because admins don't see the parent comment box), which might look weird or confusing
          */}
          {isModerator && comments && comments.length === 0 && !commentingDisabledReason &&
            <StyledWarning>
              <FormattedMessage {...messages.noComments} />
            </StyledWarning>
          }

          <CommentingDisabled
            isLoggedIn={!!authUser}
            commentingEnabled={commentingEnabled}
            commentingDisabledReason={commentingDisabledReason}
            projectId={project.id}
          />

          <Comments
            ideaId={ideaId}
            comments={comments}
            sortOrder={sortOrder}
            onSortOrderChange={handleSortOrderChange}
          />

          <ParentCommentForm ideaId={ideaId} />
        </>
      ) : (
        <LoadingComments />
      )}
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  comments: ({ ideaId, render }) => <GetComments ideaId={ideaId}>{render}</GetComments>,
  project: ({ idea, render }) => <GetProject id={get(idea, 'relationships.project.data.id')}>{render}</GetProject>
});

export default memo<InputProps>((inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentsSection {...inputProps} {...dataProps} />}
  </Data>
));
