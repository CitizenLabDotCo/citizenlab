// Libraries
import React from 'react';
import { FieldProps } from 'formik';
import { throttle } from 'lodash';

import { getHtmlStringFromEditorState } from 'utils/editorTools';

import EditorMultiloc, { Props as VanillaProps } from 'components/UI/EditorMultiloc';
import { MultilocEditorState, Locale } from 'typings';

interface State {
  editorStateMultiloc: MultilocEditorState;
}

// Pure function to update Formik state that will be throttled for performance
function formikUpdate(multilocEditorState, locale, existingValues, fieldName, setFieldValue) {
  const newValues = {...existingValues, [locale]: getHtmlStringFromEditorState(multilocEditorState[locale])}
  setFieldValue(fieldName, newValues);
}
const throttledFormikUpdate = throttle(formikUpdate, 500);

class FormikEditorMultiloc extends React.Component<FieldProps & VanillaProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      editorStateMultiloc: {},
    };
  }

  handleEditorOnChange = (values: MultilocEditorState, locale: Locale) => {
    // Update state
    const editorStateMultiloc = values;
    this.setState({ editorStateMultiloc });

    // Throttled update to Formik
    if (values) throttledFormikUpdate(values, locale, this.props.field.value, this.props.field.name, this.props.form.setFieldValue);
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
