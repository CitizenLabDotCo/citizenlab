import React, { PureComponent } from 'react';
import { isBoolean } from 'lodash-es';

// components
import OfficialFeedbackNew from './Form/OfficialFeedbackNew';
import OfficialFeedbackFeed from './OfficialFeedbackFeed';

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  permissionToPost: boolean | undefined;
  className?: string;
  ariaLiveLatestPost?: boolean;
}

interface State {}

export default class OfficialFeedback extends PureComponent<Props, State> {
  render() {
    const { postId, postType, permissionToPost, className, ariaLiveLatestPost } = this.props;

    if (isBoolean(permissionToPost)) {
      return (
        <div className={className}>
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
            ariaLiveLatestPost={ariaLiveLatestPost}
          />
        </div>
      );
    }

    return null;
  }
}
