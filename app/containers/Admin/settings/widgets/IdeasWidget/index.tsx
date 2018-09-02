import * as React from 'react';
import styled from 'styled-components';
import { stringify } from 'qs';
import Form, { FormValues } from './Form';
import { Formik, FormikErrors } from 'formik';
import WidgetPreview from '../WidgetPreview';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

type Props = {};

type State = {
  widgetParams: Partial<FormValues>;
};

class IdeasWidget extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      widgetParams: this.initialValues(),
    };
  }
  validate = (): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};
    return errors;
  }

  initialValues = (): FormValues => ({
    width: 300,
    height: 400,
    showHeader: true,
    headerText: '',
    projects: [],
    topics: [],
    limit: 5,
  })

  renderIdeasFormFn = (props) => {
    return <Form {...props} />;
  }

  onSubmit = (values: FormValues, { setSubmitting }) => {
    this.setState({ widgetParams: { ...this.state.widgetParams, ...values } });
    setSubmitting(false);
  }

  generateWidgetParams = () => {
    return stringify(this.state.widgetParams);
  }

  render() {
    const { widgetParams: { width, height } } = this.state;
    return (
      <Container>
        <Formik
          initialValues={this.initialValues()}
          render={this.renderIdeasFormFn}
          validate={this.validate}
          onSubmit={this.onSubmit}
        />
        <WidgetPreview
          path={`/ideas?${this.generateWidgetParams()}`}
          width={width || 300}
          height={height || 400}
        />
      </Container>
    );
  }
}

export default IdeasWidget;
