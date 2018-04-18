import React from 'react';
import styled from 'styled-components';
import { keys, pick, isEqual } from 'lodash';
import { API } from 'typings';
import { browserHistory, withRouter, WithRouterProps } from 'react-router';
import { updatePage } from 'services/pages';
import GetPage, { GetPageChildProps } from 'utils/resourceLoaders/components/GetPage';
import PageForm, { FormValues } from '../Form';
import { Formik } from 'formik';
import PageWrapper from 'components/admin/PageWrapper';
import { color, fontSize } from 'utils/styleUtils';
import GoBackButton from 'components/UI/GoBackButton';
import T from 'components/T';

const Title = styled.h1`
  color: ${color('title')};
  font-size: ${fontSize('xxxl')};
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

    return page && {
      title_multiloc: page.attributes.title_multiloc,
      slug: page.attributes.slug,
      body_multiloc: page.attributes.body_multiloc,
    };
  }

  changedValues = (initialValues, newValues) => {
    const changedKeys = keys(newValues).filter((key) => (
      !isEqual(initialValues[key], newValues[key])
    ));
    return pick(newValues, changedKeys);
  }

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    const { page } = this.props;

    if (!page) return;

    updatePage(page.id, { ...this.changedValues(this.initialValues(), values) }).then(() => {
      browserHistory.push('/admin/pages');
    }).catch((errorResponse) => {
      const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
      setErrors(apiErrors);
      setSubmitting(false);
    });
  }

  handleGoBack = () => {
    browserHistory.push('/admin/pages');
  }

  renderFn = (props) => (
    this.props.page && (
      <PageForm
        {...props}
        mode="edit"
        pageId={this.props.page.id}
      />
    )
  )

  render() {
    const { page } = this.props;
    const initialValues = this.initialValues();

    return page && initialValues && (
      <>
        <GoBackButton onClick={this.handleGoBack} />
        <Title><T value={page.attributes.title_multiloc} /></Title>
        <PageWrapper>
          <Formik
            initialValues={initialValues}
            onSubmit={this.handleSubmit}
            render={this.renderFn}
            validate={PageForm.validate}
          />
        </PageWrapper>
      </>
    );
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetPage id={inputProps.params.pageId}>
    {page => <EditPage {...inputProps} page={page} />}
  </GetPage>
));
