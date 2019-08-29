import React, { PureComponent } from 'react';
import { isBoolean } from 'lodash-es';

// components
import OfficialFeedbackNew from './Form/OfficialFeedbackNew';
import OfficialFeedbackFeed from './OfficialFeedbackFeed';

// style
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  permissionToPost: boolean | undefined;
  className?: string;
}

interface State {}

export default class OfficialFeedback extends PureComponent<Props, State> {
  render() {
    const { postId, postType, permissionToPost, className } = this.props;

    if (isBoolean(permissionToPost)) {
      return (
        <Container className={className}>
          {permissionToPost &&
            <OfficialFeedbackNew
              postId={postId}
              postType={postType}
            />
          }

          <OfficialFeedbackFeed
            postId={postId}
            postType={postType}
            editingAllowed={permissionToPost}
          />
        </Container>
      );
    }

    return null;
  }
}
