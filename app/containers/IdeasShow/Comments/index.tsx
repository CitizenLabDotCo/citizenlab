// libraries
import React, { memo } from 'react';
import { get, isNil } from 'lodash-es';
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

export interface InputProps {
  ideaId: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
  comments: GetCommentsChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

const CommentsSection = memo<Props>(({ ideaId, idea, comments, project }) => {
  if (isNil(idea) || isNil(comments) || isNil(project)) {
    return (
      <LoadingComments />
    );
  }

  if (!isNilOrError(idea) && !isNilOrError(comments) && !isNilOrError(project)) {
    return (
      <>
        <Comments ideaId={ideaId} />
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
    );
  }

  return null;
});

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  comments: ({ ideaId, render }) => <GetComments ideaId={ideaId}>{render}</GetComments>,
  project: ({ idea, render }) => <GetProject id={get(idea, 'relationships.project.data.id')}>{render}</GetProject>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentsSection {...inputProps} {...dataProps} />}
  </Data>
);
