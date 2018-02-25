import * as React from 'react';
import { keys, pick, isEqual } from 'lodash';
import styled from 'styled-components';
import { ICustomFieldData, customFieldForUsersStream, updateCustomFieldForUsers } from 'services/userCustomFields';
import { injectResource, InjectedResourceLoaderProps } from 'utils/resourceLoaders/resourceLoader';

import CustomFieldForm, { FormValues } from '../CustomFieldForm';
import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import { Formik } from 'formik';
import { API } from 'typings';
import { browserHistory } from 'react-router';
import T from 'components/T';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

type Props = {};

type State = {};

class Edit extends React.Component<Props & InjectedResourceLoaderProps<ICustomFieldData>, State> {

  initialValues = () => {
    const { customField } = this.props;
    return customField && {
      key: customField.attributes.key,
      input_type: customField.attributes.input_type,
      title_multiloc: customField.attributes.title_multiloc,
      description_multiloc: customField.attributes.description_multiloc,
      required: customField.attributes.required,
    };
  }

  changedValues = (initialValues, newValues) => {
    const changedKeys = keys(newValues).filter((key) => (
      !isEqual(initialValues[key], newValues[key])
    ));
    return pick(newValues, changedKeys);
  }

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    const { customField } = this.props;
    if (!customField) return;

    updateCustomFieldForUsers(customField.id, {
      ...this.changedValues(this.initialValues(), values)
    })
      .then(() => {
        browserHistory.push('/admin/custom_fields');
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }


  renderFn = (props) => (
    <CustomFieldForm
      {...props}
      mode="edit"
    />
  )

  goBack = () => {
    browserHistory.push('/admin/custom_fields');
  }

  render() {
    const { customField } = this.props;
    return customField && (
      <div>
        <GoBackButton onClick={this.goBack} />
        <PageTitle>
          <T value={customField.attributes.title_multiloc} />
        </PageTitle>
        <PageWrapper>
          <Formik
            initialValues={this.initialValues()}
            onSubmit={this.handleSubmit}
            render={this.renderFn}
          />
        </PageWrapper>
      </div>
    );
  }
}

export default injectResource('customField', customFieldForUsersStream, (props) => (props.params.customFieldId))(Edit);
