import * as React from 'react';
import { isEmpty, values as getValues, every } from 'lodash';
import FormikInput from 'components/UI/FormikInput';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikQuillMultiloc from 'components/QuillEditor/FormikQuillMultiloc';
import Error from 'components/UI/Error';
import { Section, SectionField } from 'components/admin/Section';
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

import { FormattedMessage } from 'utils/cl-intl';
import { Multiloc } from 'typings';
import messages from '../messages';
import Label from 'components/UI/Label';
import Warning from 'components/UI/Warning';
import { Link } from 'react-router';

export interface FormValues {
  slug?: string;
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

export interface Props {
  mode: 'new' | 'edit';
  hideTitle?: boolean;
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
    const { isSubmitting, errors, isValid, touched, mode, hideTitle } = this.props;

    return (
      <Form>
        <Section>

          {hideTitle &&
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
        }

          <SectionField
            className="fullWidth"
          >
            <Field
              name="body_multiloc"
              component={FormikQuillMultiloc}
              label={<FormattedMessage {...messages.editContent} />}
              renderPerLocale={this.renderAdavancedEditorLink}
            />
            {touched.body_multiloc && <Error
              fieldName="body_multiloc"
              apiErrors={errors.body_multiloc}
            />}
          </SectionField>

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
              <Warning>
                <FormattedMessage {...messages.dontChange} />
              </Warning>
            </SectionField>
          }

        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
        />

      </Form>
    );
  }
}

export default PageForm;
