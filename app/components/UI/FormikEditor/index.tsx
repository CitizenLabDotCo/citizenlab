// Libraries
import React from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'draft-js';

import { getEditorStateFromHtmlString, getHtmlStringFromEditorState } from 'utils/editorTools';
import Editor, { Props as VanillaProps } from 'components/UI/Editor';

// Typings
export interface Props {
  name: string;
}
export interface State {}

class FormikEditor extends React.Component<Props & VanillaProps, State> {
  static contextTypes = {
    formik: PropTypes.object,
  };

  constructor(props) {
    super(props);
  }

  handleOnChange = (editorState: EditorState) => {
    this.context.formik.setFieldValue(this.props.name, getHtmlStringFromEditorState(editorState));
  }

  handleOnBlur = () => {
    this.context.formik.setFieldTouched(this.props.name);
  }

  render() {
    return (
      <Editor
        {...this.props}
        onChange={this.handleOnChange}
        onBlur={this.handleOnBlur}
        value={getEditorStateFromHtmlString(this.context.formik.values[this.props.name] || '')}
      />
    );
  }
}

export default FormikEditor;
