// Libraries
import React from 'react';
import { EditorState } from 'draft-js';
import { FormikConsumer, FormikContext } from 'formik';
import { getEditorStateFromHtmlString, getHtmlStringFromEditorState } from 'utils/editorTools';
import Editor, { Props as VanillaProps } from 'components/UI/Editor';

// Typings
export interface Props {
  name: string;
}
export interface State {}

class FormikEditor extends React.Component<Props & VanillaProps, State> {

  constructor(props) {
    super(props);
  }

  handleOnChange = (formikContext: FormikContext<any>) => (editorState: EditorState) => {
    formikContext.setFieldValue(this.props.name, getHtmlStringFromEditorState(editorState));
  }

  handleOnBlur = (formikContext: FormikContext<any>) => () => {
    formikContext.setFieldTouched(this.props.name);
  }

  render() {
    return (
      <FormikConsumer>
        {formikContext => (
          <Editor
            {...this.props}
            onChange={this.handleOnChange(formikContext)}
            onBlur={this.handleOnBlur(formikContext)}
            value={getEditorStateFromHtmlString(formikContext.values[this.props.name] || '')}
          />
        )}
      </FormikConsumer>
    );
  }
}

export default FormikEditor;
