// libraries
import React, { memo, useState, useCallback } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';

// resources
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// utils
import { isNilOrError } from 'utils/helperUtils';
// import HasPermission from 'components/HasPermission';

// components
import LoadingComments from './LoadingComments';
import ParentCommentForm from './ParentCommentForm';
import Comments from './Comments';

// style
import styled from 'styled-components';

// typings
import { ICommentSortOptions } from './CommentSorting';

const Container = styled.div``;

export interface InputProps {
  ideaId: string;
  className?: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
  comments: GetCommentsChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

const CommentsSection = memo<Props>(({ ideaId, idea, comments, project, className }) => {
  const [sortOrder, setSortOrder] = useState<ICommentSortOptions>('oldest_to_newest');

  const handleSortOrderChange = useCallback(
    (sortOrder: ICommentSortOptions) => {
      setSortOrder(sortOrder);
    }, []
  );

  return (
    <Container className={className}>
      {(!isNilOrError(idea) && !isNilOrError(comments) && !isNilOrError(project)) ? (
        <>
          <Comments
            ideaId={ideaId}
            comments={comments}
            sortOrder={sortOrder}
            onSortOrderChange={handleSortOrderChange}
          />

          <ParentCommentForm ideaId={ideaId} />

          {/*
          {!isNilOrError(project) &&
            <HasPermission item={project} action="moderate">
              <HasPermission.No>
                <ParentCommentForm ideaId={ideaId} />
              </HasPermission.No>
            </HasPermission>
          }
          */}
        </>
      ) : (
        <LoadingComments />
      )}
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  comments: ({ ideaId, render }) => <GetComments ideaId={ideaId}>{render}</GetComments>,
  project: ({ idea, render }) => <GetProject id={get(idea, 'relationships.project.data.id')}>{render}</GetProject>
});

export default memo<InputProps>((inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentsSection {...inputProps} {...dataProps} />}
  </Data>
));
