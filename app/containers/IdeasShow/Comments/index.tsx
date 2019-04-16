// libraries
import React, { memo } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';

// resources
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// utils
import { isNilOrError } from 'utils/helperUtils';
// import HasPermission from 'components/HasPermission';

// components
import ParentCommentForm from './ParentCommentForm';
import Comments from './Comments';

interface InputProps {
  ideaId: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

const CommentsSection = memo<Props>(({
  ideaId,
  project
}) => (
  <>
    <Comments ideaId={ideaId} />

    {/* {!isNilOrError(project) &&
      <HasPermission item={project} action="moderate">
        <HasPermission.No>
          <ParentCommentForm ideaId={ideaId} />
        </HasPermission.No>
      </HasPermission>
    } */}

    {!isNilOrError(project) &&
      <ParentCommentForm ideaId={ideaId} />
    }
  </>
));

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  project: ({ idea, render }) => <GetProject id={get(idea, 'relationships.project.data.id')}>{render}</GetProject>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentsSection {...inputProps} {...dataProps} />}
  </Data>
);
