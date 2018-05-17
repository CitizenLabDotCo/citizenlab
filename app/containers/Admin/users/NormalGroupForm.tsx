// Libraries
import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash';
import styled from 'styled-components';


// Formik
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Components
import Error from 'components/UI/Error';

// Typings
import { Multiloc } from 'typings';
export interface Props { }
export interface NormalFormValues {
  title_multiloc: Multiloc;
}

const Fill = styled.div`
  flex: 1;
  padding-left: 40;
`;

const FooterContainer = styled.div`
  width: 100%;
  height: 74px;
  border-top: 2px solid #EAEAEA;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 40px;
`;

export default class NormalGroupForm extends React.Component<InjectedFormikProps<Props, NormalFormValues>> {

  public static validate = (values: NormalFormValues): FormikErrors<NormalFormValues> => {
    const errors: FormikErrors<NormalFormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = (errors.title_multiloc || []).concat({ error: 'blank' });
    }
    return errors;
  }
  render() {
    const { isSubmitting, errors, isValid, touched } = this.props;

    return (
      <Form>
        <Fill>
          <Field
            name="title_multiloc"
            component={FormikInputMultiloc}
            label={<FormattedMessage {...messages.fieldGroupName} />}
          />
          {touched.title_multiloc && <Error
            fieldName="title_multiloc"
            apiErrors={errors.title_multiloc}
          />}
        </Fill>

        <FooterContainer>
          <FormikSubmitWrapper
            {...{ isValid, isSubmitting, status, touched }}
          />
        </FooterContainer>
      </Form>
    );
  }
}
