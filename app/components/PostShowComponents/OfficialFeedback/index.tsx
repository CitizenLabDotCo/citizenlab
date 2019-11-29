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
  a11y_pronounceLatestOfficialFeedbackPost?: boolean;
}

interface State {}

export default class OfficialFeedback extends PureComponent<Props, State> {
  render() {
    const { postId, postType, permissionToPost, className, a11y_pronounceLatestOfficialFeedbackPost } = this.props;

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
            a11y_pronounceLatestOfficialFeedbackPost={a11y_pronounceLatestOfficialFeedbackPost}
          />
        </div>
      );
    }

    return null;
  }
}
