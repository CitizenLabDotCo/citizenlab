// Libraries
import React from 'react';
import { Form, Field, InjectedFormikProps } from 'formik';

// Components
import { SectionField } from 'components/admin/Section';
import FormikInputMultilocWithLocaleSwitcher from 'components/UI/FormikInputMultilocWithLocaleSwitcher';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { FooterContainer, Fill } from 'containers/Admin/users/NormalGroupForm';
import Error from 'components/UI/Error';
import { Label } from 'cl2-component-library';
import { FormikUserFilterConditions } from 'modules/smart_groups/components/UserFilterConditions';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import adminUsersMessages from 'containers/Admin/users/messages';

// Styling
import styled from 'styled-components';

const SSectionField = styled(SectionField)`
  max-width: 570px;
`;

// Typings
import { Multiloc } from 'typings';
import { TRule } from 'modules/smart_groups/components/UserFilterConditions/rules';

export interface Props {}
export interface RulesFormValues {
  rules: TRule[];
  title_multiloc: Multiloc;
  membership_type: 'rules';
}

export class RulesGroupForm extends React.PureComponent<
  InjectedFormikProps<Props, RulesFormValues>
> {
  render() {
    const { isSubmitting, errors, isValid, touched, status } = this.props;

    return (
      <Form>
        <Fill id="rules-group-inner-form">
          <SSectionField>
            <Field
              id="group-title-field"
              name="title_multiloc"
              component={FormikInputMultilocWithLocaleSwitcher}
              label={
                <FormattedMessage {...adminUsersMessages.fieldGroupName} />
              }
            />
            {touched.title_multiloc && (
              <Error
                fieldName="title_multiloc"
                apiErrors={errors.title_multiloc as any}
              />
            )}
          </SSectionField>
          <SSectionField className="e2e-rules-field-section">
            <Label>
              <FormattedMessage {...messages.rulesExplanation} />
            </Label>
            <Field name="rules" component={FormikUserFilterConditions} />
            {touched.rules && errors.rules && (
              <Error
                text={
                  (errors.rules as any) === 'verificationDisabled' ? (
                    <FormattedMessage {...messages.verificationDisabled} />
                  ) : (
                    <FormattedMessage {...messages.rulesError} />
                  )
                }
              />
            )}
          </SSectionField>
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

export default RulesGroupForm;
