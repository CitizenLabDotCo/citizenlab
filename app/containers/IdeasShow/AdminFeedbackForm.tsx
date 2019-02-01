import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

import { Section, SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';

// Typings
import { Multiloc, Locale, MultilocFormValues } from 'typings';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import FormikMentionsTextAreaMultiloc from 'components/UI/FormikMentionsTextAreaMultiloc';
export interface Props {
  locales: Locale[];
}

export interface FormValues extends MultilocFormValues {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

interface State {
  selectedLocale: Locale;
}

export default class AdminFeedbackForm extends React.Component<InjectedFormikProps<Props, FormValues>, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      selectedLocale: 'en',
    };
  }
  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.author_multiloc), isEmpty)) {
      errors.author_multiloc = [{ error: 'blank' }] as any;
    }
    if (every(getValues(values.body_multiloc), isEmpty)) {
      errors.body_multiloc = [{ error: 'blank' }] as any;
    }
    return errors;
  }

  onLocaleChange = (locale: Locale) => () => {
    this.setState({ selectedLocale: locale });
  }

  renderFormikInputMultiloc = (props) => (
    <FormikInputMultiloc
      shownLocale={this.state.selectedLocale}
      {...props}
    />
  )
  renderFormikMentionsTextAreaMultiloc = (props) => (
    <FormikMentionsTextAreaMultiloc
      shownLocale={this.state.selectedLocale}
      {...props}
    />
  )

  render() {
    const { isSubmitting, errors, isValid, touched, values } = this.props;
    const { selectedLocale } = this.state;

    return (
      <Form>
        <Section>
          <FormLocaleSwitcher
            onLocaleChange={this.onLocaleChange}
            selectedLocale={selectedLocale}
            values={values}
          />
            <Field
              name="author_multiloc"
              render={this.renderFormikInputMultiloc}
            />
            {touched.author_multiloc && <Error
              fieldName="author_multiloc"
              apiErrors={errors.author_multiloc as any}
            />}

            <Field
              render={this.renderFormikMentionsTextAreaMultiloc}
              name="body_multiloc"
            />
            {touched.body_multiloc && <Error
              fieldName="body_multiloc"
              apiErrors={errors.body_multiloc as any}
            />}
        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
        />

      </Form>
    );
  }
}
