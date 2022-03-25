import React from 'react';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

// components
import { Form, Field, InjectedFormikProps } from 'formik';
import FormikInputMultilocWithLocaleSwitcher from 'components/UI/FormikInputMultilocWithLocaleSwitcher';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

import { Section, SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';

// typings
import { ITopicUpdate } from '../../../../services/topics';

export interface Props {}

class TopicForm extends React.Component<
  InjectedFormikProps<Props & InjectedIntlProps, ITopicUpdate>
> {
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

        <FormikSubmitWrapper
          isSubmitting={isSubmitting}
          status={status}
          touched={touched}
        />
      </Form>
    );
  }
}

export default injectIntl<Props>(TopicForm);
