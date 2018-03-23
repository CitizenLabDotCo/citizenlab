// Libraries
import React from 'react';

// Styling
import styled from 'styled-components';

const CommentWrapper = styled.div`
  color: #333;
  font-size: 17px;
  line-height: 25px;
  font-weight: 300;

  span,
  p {
    margin-bottom: 25px;

    &:last-child {
      margin-bottom: 0px;
    }
  }

  a {
    color: ${(props) => props.theme.colors.clBlue};

    &.mention {
      background: ${props => transparentize(0.92, props.theme.colors.clBlue)};
    }

    &:hover {
      color: ${(props) => darken(0.15, props.theme.colors.clBlue)};
      text-decoration: underline;
    }
  }
`;


// Typings
import { Multiloc } from 'typings';

export interface Props {
  commentBody: Multiloc;
  editionMode: boolean;
  onCommentSave: {(): void};
}
export interface State {}

class CommentBody extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getCommentText = () => {

  }

  render() {
    return (
      <>
        {!this.props.editionMode &&
          <CommentWrapper className="e2e-comment-body">
            <div dangerouslySetInnerHTML={{ __html: processedCommentText }} />
          </CommentWrapper>
        }
        {this.props.editionMode &&
          null
        }
      </>
    );
  }
}

export default CommentBody;
