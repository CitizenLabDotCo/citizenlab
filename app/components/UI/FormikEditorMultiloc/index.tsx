// Libraries
import React from 'react';
import { FieldProps } from 'formik';

import { getEditorStateFromHtmlString, getHtmlStringFromEditorState } from 'utils/editorTools';

import EditorMultiloc, { Props as VanillaProps } from 'components/UI/EditorMultiloc';
import { MultilocEditorState } from 'typings';

interface State {
  editorStateMultiloc: MultilocEditorState;
}

class FormikEditorMultiloc extends React.Component<FieldProps & VanillaProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      editorStateMultiloc: {},
    };
  }

  handleEditorOnChange = (value, locale) => {
    const editorStateMultiloc = { ...this.state.editorStateMultiloc, [locale]: value };

    this.setState({ editorStateMultiloc });
    this.props.form.setFieldValue(this.props.field.name, getHtmlStringFromEditorState(value));
  }

  render() {
    return (
      <EditorMultiloc
        {...this.props}
        valueMultiloc={this.state.editorStateMultiloc}
        onChange={this.handleEditorOnChange}
      />
    );
  }
}

export default FormikEditorMultiloc;
