import React, { PureComponent } from 'react';

// components
import OfficialFeedbackNew from './Form/OfficialFeedbackNew';
import OfficialFeedbackFeed from './OfficialFeedbackFeed';

// resources
import { GetPermissionChildProps } from 'resources/GetPermission';

// style
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  permissionToPost: GetPermissionChildProps;
  className?: string;
}

interface State {}

export default class OfficialFeedback extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const { postId, postType, permissionToPost, className } = this.props;

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
          permission={permissionToPost}
          editingAllowed={permissionToPost}
        />
      </Container>
    );
  }
}
