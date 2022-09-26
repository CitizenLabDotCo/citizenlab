// Libraries
import { every, isEmpty, values as getValues } from 'lodash-es';
import React from 'react';

// Formik
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import FormikInputMultilocWithLocaleSwitcher from 'components/UI/FormikInputMultilocWithLocaleSwitcher';
import { Field, Form, FormikErrors, InjectedFormikProps } from 'formik';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// Components
import { SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';

// Typings
import { Multiloc } from 'typings';
export interface Props {}
export interface NormalFormValues {
  title_multiloc: Multiloc;
  membership_type: MembershipType;
}

// Style
import { MembershipType } from 'services/groups';
import styled from 'styled-components';

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
    const { isSubmitting, errors, touched, status } = this.props;

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
            buttonStyle="admin-dark"
            isSubmitting={isSubmitting}
            status={status}
            touched={touched}
          />
        </FooterContainer>
      </Form>
    );
  }
}
