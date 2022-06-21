import React from 'react';
import styled from 'styled-components';
import { isEmpty, values as getValues, every } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// components
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import FormikInputMultilocWithLocaleSwitcher from 'components/UI/FormikInputMultilocWithLocaleSwitcher';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { Section, SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Button from 'components/UI/Button';

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;
const CancelButton = styled(Button)``;

// Typings
import { Multiloc } from 'typings';

export interface FormValues {
  title_multiloc: Multiloc;
}

class RegistrationCustomFieldOptionsForm extends React.Component<
  InjectedFormikProps<InjectedIntlProps & WithRouterProps, FormValues>
> {
  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }
    return errors;
  };

  handleCancelClick = (e) => {
    e.preventDefault();
    const { userCustomFieldId } = this.props.params;

    clHistory.push(
      `/admin/settings/registration/custom-fields/${userCustomFieldId}/options/`
    );
  };

  render() {
    const {
      isSubmitting,
      errors,
      touched,
      status,
      intl: { formatMessage },
    } = this.props;

    return (
      <Form>
        <Section>
          <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultilocWithLocaleSwitcher}
              label={formatMessage(messages.answerOption)}
            />
            {touched.title_multiloc && (
              <Error
                fieldName="title_multiloc"
                apiErrors={errors.title_multiloc as any}
              />
            )}
          </SectionField>
        </Section>

        <Buttons>
          <FormikSubmitWrapper
            isSubmitting={isSubmitting}
            status={status}
            touched={touched}
          />
          <CancelButton buttonStyle="text" onClick={this.handleCancelClick}>
            {formatMessage(messages.optionCancelButton)}
          </CancelButton>
        </Buttons>
      </Form>
    );
  }
}

export default withRouter(injectIntl(RegistrationCustomFieldOptionsForm));
