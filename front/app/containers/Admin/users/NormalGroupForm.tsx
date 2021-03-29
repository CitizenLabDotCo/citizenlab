// Libraries
import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';

// Formik
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import FormikInputMultilocWithLocaleSwitcher from 'components/UI/FormikInputMultilocWithLocaleSwitcher';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Components
import Error from 'components/UI/Error';
import { SectionField } from 'components/admin/Section';

// Typings
import { Multiloc } from 'typings';
export interface Props {}
export interface NormalFormValues {
  title_multiloc: Multiloc;
  membership_type: MembershipType;
}

// Style
import styled from 'styled-components';
import { MembershipType } from 'services/groups';

export const Fill = styled.div`
  padding-top: 40px;
  padding-bottom: 20px;
  padding-left: 40px;
  overflow-y: auto;
`;

export const FooterContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 40px;
  padding-bottom: 25px;
`;

export default class NormalGroupForm extends React.Component<
  InjectedFormikProps<Props, NormalFormValues>
> {
  public static validate = (
    values: NormalFormValues
  ): FormikErrors<NormalFormValues> => {
    const errors: FormikErrors<NormalFormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }
    return errors;
  };

  render() {
    const { isSubmitting, errors, isValid, touched, status } = this.props;

    return (
      <Form>
        <Fill>
          <SectionField>
            <Field
              id="group-title-field"
              name="title_multiloc"
              component={FormikInputMultilocWithLocaleSwitcher}
              label={<FormattedMessage {...messages.fieldGroupName} />}
            />
            {touched.title_multiloc && (
              <Error
                fieldName="title_multiloc"
                apiErrors={errors.title_multiloc as any}
              />
            )}
          </SectionField>
        </Fill>

        <FooterContainer>
          <FormikSubmitWrapper
            {...{ isValid, isSubmitting, status, touched }}
            buttonStyle="admin-dark"
          />
        </FooterContainer>
      </Form>
    );
  }
}
