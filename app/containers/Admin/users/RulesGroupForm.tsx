// Libraries
import React from 'react';
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import { isEmpty, values as getValues, every } from 'lodash';

// Components
import { FormikUserFilterConditions } from 'components/admin/UserFilterConditions';
import { Section, SectionField } from 'components/admin/Section';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { FooterContainer } from './NormalGroupForm';
import Error from 'components/UI/Error';
import Label from 'components/UI/Label';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import {  } from 'utils/styleUtils';

const CustomSection = styled(Section)`
  padding: 40px;
`;

// Typings
import { Multiloc } from 'typings';
import { TRule } from 'components/admin/UserFilterConditions/rules';
export interface Props {}
export interface RulesFormValues {
  rules: TRule[];
  title_multiloc: Multiloc;
  membership_type: 'rules';
}

export class RulesGroupForm extends React.PureComponent<InjectedFormikProps<Props, RulesFormValues>> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  public static validate = (values: RulesFormValues): FormikErrors<RulesFormValues> => {
    const errors: FormikErrors<RulesFormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = (errors.title_multiloc || []).concat({ error: 'blank' });
    }
    return errors;
  }

  render() {
    const { isSubmitting, errors, isValid, touched } = this.props;

    return (
      <Form>
        <CustomSection>
          <SectionField>
            <Label><FormattedMessage {...messages.fieldRulesLabel} /></Label>
            <Field
              name="rules"
              component={FormikUserFilterConditions}
            />
          </SectionField>
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
        </CustomSection>

        <FooterContainer>
          <FormikSubmitWrapper
            {...{ isValid, isSubmitting, status, touched }}
          />
        </FooterContainer>
      </Form>
    );
  }
}

export default RulesGroupForm;
