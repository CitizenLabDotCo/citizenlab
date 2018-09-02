import * as React from 'react';
import { stringify } from 'qs';
import Form, { FormValues } from './Form';
import { Formik, FormikErrors } from 'formik';
import WidgetPreview from '../WidgetPreview';

type Props = {};

type State = {
  width: number;
  height: number;
  widgetParams: Partial<FormValues>;
};

class IdeasWidget extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      width: 300,
      height: 400,
      widgetParams: this.initialValues()
    };
  }
  validate = (): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};
    return errors;
  }

  initialValues = (): FormValues => ({
    projects: [],
    topics: [],
    limit: 5,
  })

  renderFn = (props) => {
    return <Form {...props} />;
  }

  onSubmit = (values: FormValues) => {
    this.setState({ widgetParams: { ...this.state.widgetParams, ...values } });
    return true;
  }

  generateWidgetParams = () => {
    return stringify(this.state.widgetParams);
  }

  render() {
    const { width, height } = this.state;
    return (
      <>
        <Formik
          initialValues={this.initialValues()}
          render={this.renderFn}
          validate={this.validate}
          onSubmit={this.onSubmit}
        />
        <WidgetPreview
          path={`/ideas?${this.generateWidgetParams()}`}
          width={width}
          height={height}
        />
      </>
    );
  }
}

export default IdeasWidget;
