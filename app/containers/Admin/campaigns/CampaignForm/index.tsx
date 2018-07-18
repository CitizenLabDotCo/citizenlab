import * as React from 'react';
import { isEmpty, values as getValues, every } from 'lodash';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikSelect from 'components/UI/FormikSelect';
import Error from 'components/UI/Error';
import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import Label from 'components/UI/Label';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

import { FormattedMessage } from 'utils/cl-intl';
import { Multiloc } from 'typings';
import messages from '../messages';
import { adopt } from 'react-adopt';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import localize, { injectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';
import FormikQuillMultiloc from 'components/QuillEditor/FormikQuillMultiloc';

export interface FormValues {
  sender: 'author' | 'organization';
  reply_to: 'author' | 'organization';
  subject_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

interface InputProps {
  mode: 'new' | 'edit';
}

interface DataProps {
  user: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps, injectedLocalized { }

export const validateCampaignForm = (values: FormValues): FormikErrors<FormValues> => {
  const errors: FormikErrors<FormValues> = {};

  if (every(getValues(values.subject_multiloc), isEmpty)) {
    errors.subject_multiloc = (errors.subject_multiloc || []).concat({ error: 'blank' });
  }

  return errors;
};

class CampaignForm extends React.Component<InjectedFormikProps<Props, FormValues>> {

  senderOptions = () => {
    const { user, tenant, localize } = this.props;
    return [
      {
        value: 'author',
        label: !isNilOrError(user) && `${user.attributes.first_name} ${user.attributes.last_name}`,
      },
      {
        value: 'organization',
        label: !isNilOrError(tenant) && localize(tenant.attributes.settings.core.organization_name),
      }
    ];
  }

  render() {
    const { isSubmitting, errors, isValid, touched } = this.props;

    return (
      <Form>
        <Section>
          <SectionTitle>
            1. <FormattedMessage {...messages.formTitleWho}/>
          </SectionTitle>
          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldSender} />
            </Label>
            <Field
              name="sender"
              component={FormikSelect}
              options={this.senderOptions()}
              clearable={false}
            />
            {touched.sender && <Error
              fieldName="sender"
              apiErrors={errors.sender}
            />}
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldReplyTo} />
            </Label>
            <Field
              name="reply_to"
              component={FormikSelect}
              options={this.senderOptions()}
              clearable={false}
            />
            {touched.reply_to && <Error
              fieldName="reply_to"
              apiErrors={errors.reply_to}
            />}
          </SectionField>
        </Section>

        <Section>
          <SectionTitle>
            2. <FormattedMessage {...messages.formTitleWhat} />
          </SectionTitle>
          <SectionField>
            <Field
              name="subject_multiloc"
              component={FormikInputMultiloc}
              label={<FormattedMessage {...messages.fieldSubject} />}
              maxCharCount={80}
            />
            {touched.subject_multiloc && <Error
              fieldName="subject_multiloc"
              apiErrors={errors.subject_multiloc}
            />}
          </SectionField>

          <SectionField>
            <Field
              name="body_multiloc"
              component={FormikQuillMultiloc}
              label={<FormattedMessage {...messages.fieldBody} />}
            />
            {touched.body_multiloc && <Error
              fieldName="body_multiloc"
              apiErrors={errors.body_multiloc}
            />}
          </SectionField>

        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
        />

      </Form>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  user: ({ render }) => <GetAuthUser>{render}</GetAuthUser>,
  tenant: ({ render }) => <GetTenant>{render}</GetTenant> ,
});

const CampaignFormWithHOCs = localize(CampaignForm);

export default(inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CampaignFormWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
