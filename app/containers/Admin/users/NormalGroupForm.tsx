// Libraries
import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash';
import styled from 'styled-components';

// Formik
import { Form, Field, Formik, FormikErrors } from 'formik';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Components
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';
import { SectionField } from 'components/admin/Section';

// Typings
import { Multiloc, API } from 'typings';
import { IGroups } from 'services/groups';
interface Props {
  handleSubmit: (FormValues) => Promise<IGroups>;
  visible: boolean;
  close: () => void;
  initialValues: FormValues;
}
export interface FormValues {
  title_multiloc: Multiloc;
}

// Styles
const Fill = styled.div`
  padding: 40px;
  flex: 1;
`;

export default class NormalGroupCreation extends React.Component<Props> {

  validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = (errors.title_multiloc || []).concat({ error: 'blank' });
    }
    return errors;
  }

  onSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    console.log('submit');
    this.props.handleSubmit({
      ...values
    })
      .then(() => {
        this.props.close();
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  renderForm = ({
    errors,
    touched,
    isSubmitting,
    isValid,
    handleSubmit
  }) => (
      <form onSubmit={handleSubmit}>
        <Modal
          opened={this.props.visible}
          close={this.props.close}
          fixedHeight={true}
          width="750px"
          header={<FormattedMessage {...messages.groupFormTitle} />}
          footer={<FormikSubmitWrapper {...{ isValid, isSubmitting, status, touched }} />}
        >
          <Fill>
            <SectionField>
              <Field
                name="title_multiloc"
                component={FormikInputMultiloc}
                label={<FormattedMessage {...messages.fieldGroupName} />}
              />
              {touched.title_multiloc && <Error
                fieldName="title_multiloc"
                apiErrors={errors.title_multiloc}
              />}
            </SectionField>
          </Fill>
        </Modal>
      </form>
    )

  render() {
    return (
      <Formik
        initialValues={this.props.initialValues}
        onSubmit={this.onSubmit}
        validate={this.validate}
        render={this.renderForm}
      />
    );
  }
}
