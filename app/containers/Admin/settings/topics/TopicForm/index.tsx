import React from 'react';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

import { Form, Field, InjectedFormikProps } from 'formik';
import FormikInputMultilocWithLocaleSwitcher from 'components/UI/FormikInputMultilocWithLocaleSwitcher';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

import { Section, SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';

// typings
import { Multiloc } from 'typings';

export interface Props {}

export interface FormValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

class TopicForm extends React.Component<
  InjectedFormikProps<Props & InjectedIntlProps, FormValues>
> {
  render() {
    const {
      isSubmitting,
      errors,
      isValid,
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
              label={<FormattedMessage {...messages.fieldTopicTitle} />}
              labelTooltipText={formatMessage(messages.fieldTopicTitleTooltip)}
              id="e2e-topic-name"
            />
            {touched.title_multiloc && (
              <Error
                fieldName="title_multiloc"
                apiErrors={errors.title_multiloc as any}
              />
            )}
          </SectionField>
        </Section>

        <FormikSubmitWrapper {...{ isValid, isSubmitting, status, touched }} />
      </Form>
    );
  }
}

export default injectIntl<Props>(TopicForm);
