import React from 'react';
import styled from 'styled-components';
import { keys, pick, isEqual } from 'lodash-es';
import { CLErrorsJSON } from 'typings';
import { withRouter, WithRouterProps } from 'react-router';
import { updatePage } from 'services/pages';
import GetPage, { GetPageChildProps } from 'resources/GetPage';
import PageForm from 'components/PageForm';
import { Formik } from 'formik';
import PageWrapper from 'components/admin/PageWrapper';
import { fontSizes } from 'utils/styleUtils';
import GoBackButton from 'components/UI/GoBackButton';
import T from 'components/T';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { isCLErrorJSON } from 'utils/errorUtils';

const Title = styled.h1`
  font-size: ${fontSizes.xxxl}px;
  padding: 0;
  width: 100%;
  margin: 1rem 0 3rem 0;
`;

interface InputProps {}

interface DataProps {
  page: GetPageChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class EditPage extends React.Component<Props & WithRouterProps, State> {
  initialValues = () => {
    const { page } = this.props;

    return (
      !isNilOrError(page) && {
        title_multiloc: page.attributes.title_multiloc,
        slug: page.attributes.slug,
        body_multiloc: page.attributes.body_multiloc,
      }
    );
  };

  changedValues = (initialValues, newValues) => {
    const changedKeys = keys(newValues).filter(
      (key) => !isEqual(initialValues[key], newValues[key])
    );
    return pick(newValues, changedKeys);
  };

  // Still need to handle file saving if we'll use this form.
  // Also change typing of values parameter to something different (probably FormValues) than 'any'
  handleSubmit = (values: any, { setErrors, setSubmitting, setStatus }) => {
    const { page } = this.props;

    if (isNilOrError(page)) return;

    updatePage(page.id, { ...this.changedValues(this.initialValues(), values) })
      .then(() => {
        clHistory.push('/admin/pages');
      })
      .catch((errorResponse) => {
        if (isCLErrorJSON(errorResponse)) {
          const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
          setErrors(apiErrors);
        } else {
          setStatus('error');
        }
        setSubmitting(false);
      });
  };

  handleGoBack = () => {
    clHistory.push('/admin/pages');
  };

  renderFn = (props) =>
    !isNilOrError(this.props.page) && (
      <PageForm {...props} mode="edit" pageId={this.props.page.id} />
    );

  render() {
    const { page } = this.props;
    const initialValues = this.initialValues();

    return (
      !isNilOrError(page) &&
      initialValues && (
        <>
          <GoBackButton onClick={this.handleGoBack} />
          <Title>
            <T value={page.attributes.title_multiloc} />
          </Title>
          <PageWrapper>
            <Formik
              initialValues={initialValues}
              onSubmit={this.handleSubmit}
              render={this.renderFn}
              validate={PageForm.validate}
            />
          </PageWrapper>
        </>
      )
    );
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetPage id={inputProps.params.pageId}>
    {(page) => <EditPage {...inputProps} page={page} />}
  </GetPage>
));
