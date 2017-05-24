import React from 'react';
import PropTypes from 'prop-types';

// components
import FormComponent from 'components/forms/formComponent';
import { Form } from 'semantic-ui-react';
import RtfEditor from 'commponents/forms/inputs/rtfEditor';
import Button from 'components/buttons/loader';

// draft-js
import { EditorState, convertToRaw } from 'draft-js';

// messages
import messages from '../../messages';

class CommentForm extends FormComponent {
  constructor() {
    super();
    this.values = {ideaId: props.ideaId, parentId: props.parentId}
  }

  handleError = (errors) => {
    console.log(errors)
    // this.setState({errors})
  }

  handleSuccess = () => {
    console.log("banana")
  }

  publishComment() {
    this.props.submitComment(this.state.editorState);
  }


  render() {
    const { editorState } = this.state;
    const { loading } = this.state.loading;
    return (
      <Form>
        {/* TODO #later: customize toolbar and set up desired functions (image etc.)
            based on https://github.com/jpuri/react-draft-wysiwyg/blob/master/docs/src/components/Demo/index.js */}
        <div style={{ border: '1px solid black' }} />
        <RtfEditor name={'comment'} action={this.handleChange} errors={errors.text} />
        <Button
          fluid={false}
          size={'medium'}
          style={{ float: 'right' }}
          onClick={this.handleClick}
          message={messages.publishComment}
          loading={loading}
        />
      </Form>
    );
  }
}


const publishCommentAction = (ideaId, parentId, locale, editorState) => {
  if (!editorState) return publishCommentError('');

  const editorContent = convertToRaw(editorState.getCurrentContent());
  const htmlContent = draftToHtml(editorContent);
  if (htmlContent && htmlContent.trim() !== '<p></p>') {
    const htmlContents = {};
    htmlContents[locale] = htmlContent;
    return publishComment(ideaId, userId, htmlContents, parentId);
  }
  return publishCommentError('');
};

const mergeProps = (stateP, dispatchP, ownP) => {
  const { ideaId, parentId } = ownP;
  const { currentUserId } = stateP;
  const submitAction = dispatchP.publishCommentAction;
  const locale = ownP.intl.locale;
  const submitComment = submitAction.bind(undefined, ideaId, currentUserId, locale, parentId);


  return {
    currentUserId,
    submitComment,
    parentId,
    ideaId,
  };
};

const connectedEditor = preprocess(null, { publishCommentAction }, mergeProps)(CommentForm);
export default injectIntl(connectedEditor);

export default CommentForm