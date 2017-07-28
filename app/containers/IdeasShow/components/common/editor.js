import React from 'react';
import PropTypes from 'prop-types';

// components
import Button from 'components/UI/Button';
import EditorForm from './editorForm';
// import DeleteButton from './deleteButton';
import { FormattedMessage } from 'react-intl';

// sagas
import { publishCommentFork } from '../../sagas';

// messages
import messages from '../../messages';

/* eslint-disable react/sort-comp*/
class Editor extends React.PureComponent {

  constructor() {
    super();
    this.state = { visible: false };
  }

  toggleEditor = () => {
    this.setState({ visible: !this.state.visible });
  }

  closeEditor = () => {
    this.setState({ visible: false });
  }

  render() {
    const display = this.state.visible ? 'block' : 'none';
    const { parentId, ideaId } = this.props;
    return (
      <div>
        <div style={{ display: 'flex', padding: '12px', paddingRight: '25px' }}>
          <div style={{ flexGrow: 1 }}></div>

          <Button onClick={this.toggleEditor}>
            <FormattedMessage {...messages.commentReplyButton} />
          </Button>
          {/* <DeleteButton commentId={parentId} ideaId={ideaId} >
            <FormattedMessage {...messages.commentDeleteButton} />
          </DeleteButton> */}
        </div>
        <div style={{ display }}>
          <EditorForm
            parentId={parentId}
            ideaId={ideaId}
            saga={publishCommentFork}
            onSuccess={this.closeEditor}
          />
        </div>
      </div>

    );
  }
}

Editor.propTypes = {
  parentId: PropTypes.string,
  ideaId: PropTypes.string.isRequired,
};

// publishCommentClick

export default Editor;
