import * as React from 'react';
import { isEmpty, values as getValues, every } from 'lodash';
import FormikInput from 'components/UI/FormikInput';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import Error from 'components/UI/Error';
import { Section, SectionField } from 'components/admin/Section';
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

import { FormattedMessage } from 'utils/cl-intl';
import { Multiloc } from 'typings';
import messages from '../messages';
import Label from 'components/UI/Label';
import { Link } from 'react-router';

export interface FormValues {
  slug?: string;
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

export interface Props {
  mode: 'new' | 'edit';
  pageId: string;
}

class PageForm extends React.Component<InjectedFormikProps<Props, FormValues>> {

  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = (errors.title_multiloc || []).concat({ error: 'blank' });
    }

    if (every(getValues(values.body_multiloc), isEmpty)) {
      errors.body_multiloc = (errors.body_multiloc || []).concat({ error: 'blank' });
    }

    return errors;
  }

  renderAdavancedEditorLink = (locale) => {
    if (this.props.mode === 'edit') {
      return (
        <Link to={`/admin/pages/${this.props.pageId}/editor/${locale}`}>
          <FormattedMessage {...messages.advancedEditorLink} />
        </Link>
      );
    } else {
      return null;
    }
  }

  render() {
    const { isSubmitting, errors, isValid, touched, mode } = this.props;

    return (
      <Form>
        <Section>

          {mode === 'edit' &&
            <SectionField>
              <Label><FormattedMessage {...messages.pageSlug} /></Label>
              <Field
                name="slug"
                component={FormikInput}
                label={<FormattedMessage {...messages.pageSlug} />}
              />
              {touched.slug && <Error
                fieldName="slug"
                apiErrors={errors.slug}
              />}
            </SectionField>
          }

          <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={<FormattedMessage {...messages.pageTitle} />}
            />
            {touched.title_multiloc && <Error
              fieldName="title_multiloc"
              apiErrors={errors.title_multiloc}
            />}
          </SectionField>


          <SectionField>
            <Field
              name="body_multiloc"
              component={FormikTextAreaMultiloc}
              label={<FormattedMessage {...messages.pageBody} />}
              renderPerLocale={this.renderAdavancedEditorLink}
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

export default PageForm;
