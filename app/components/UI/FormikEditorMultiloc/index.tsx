// Libraries
import React from 'react';
import { FieldProps } from 'formik';
import { throttle, isEmpty, isEqual } from 'lodash';

import { getHtmlStringFromEditorState, getEditorStateFromHtmlString } from 'utils/editorTools';

import EditorMultiloc, { Props as VanillaProps } from 'components/UI/EditorMultiloc';
import { MultilocEditorState, Locale, Multiloc } from 'typings';

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

  componentDidMount() {
    if (this.props.field.value && !isEmpty(this.props.field.value)) {
      this.updateEditorState(this.props.field.value);
    }
  }

  componentDidUpdate(prevProps: FieldProps & VanillaProps) {
    if (isEmpty(this.state.editorStateMultiloc) && !isEqual(prevProps.field.value, this.props.field.value) && !isEmpty(this.props.field.value)) {
      this.updateEditorState(this.props.field.value);
    }
  }

  updateEditorState = (htmlValues: Multiloc) => {
    const editorStateMultiloc: MultilocEditorState = {};
    Object.keys(htmlValues).forEach((key) => {
      if (htmlValues[key]) editorStateMultiloc[key] = getEditorStateFromHtmlString(htmlValues[key]);
    });

    this.setState({editorStateMultiloc});
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
