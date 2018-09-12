import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';

// Components
import FormikInput from 'components/UI/FormikInput';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikQuillMultiloc from 'components/UI/QuillEditor/FormikQuillMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { Section, SectionField } from 'components/admin/Section';
import ErrorComponent from 'components/UI/Error';
import Label from 'components/UI/Label';
import Warning from 'components/UI/Warning';
import Link from 'utils/cl-router/Link';
import FileUploader from 'components/UI/FileUploader';

// Resources
// import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { Multiloc, UploadFile } from 'typings';

export interface FormValues {
  slug?: string;
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  local_page_files: UploadFile[] | [];
}

interface Props {
  mode: 'simple' | 'edit';
  hideTitle?: boolean;
  pageId?: string;
}

class PageForm extends React.Component<InjectedFormikProps<Props, FormValues>> {

  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }

    if (every(getValues(values.body_multiloc), isEmpty)) {
      errors.body_multiloc = [{ error: 'blank' }] as any;
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

  renderQuill = (props) => {
    return (
      <FormikQuillMultiloc
        inAdmin
        {...props}
      />
    );
  }

  renderFileUploader = (values: FormValues) => () => {
    const { local_page_files } = values;
    return (
      <FileUploader
        onFileAdd={this.handlePageFileOnAdd}
        onFileRemove={this.handlePageFileOnRemove}
        localFiles={local_page_files}
      />
    );
  }

  handlePageFileOnAdd = (fileToAdd: UploadFile) => {
    const { setFieldValue, values } = this.props;
    setFieldValue('local_page_files', [...values.local_page_files, fileToAdd]);
  }

  handlePageFileOnRemove = (fileToRemove: UploadFile) => {
    const { setFieldValue, values } = this.props;
    const localPageFiles = [...values.local_page_files];
    const filteredLocalPageFiles = localPageFiles.filter(file => file !== fileToRemove);
    setFieldValue('local_page_files', filteredLocalPageFiles);
  }

  render() {
    const { isSubmitting, errors, isValid, touched, mode, hideTitle, values } = this.props;
    return (
      <Form>
        <Section>
          {!hideTitle &&
            <SectionField>
              <Field
                name="title_multiloc"
                component={FormikInputMultiloc}
                label={<FormattedMessage {...messages.pageTitle} />}
              />
              {touched.title_multiloc &&
                <ErrorComponent
                  fieldName="title_multiloc"
                  apiErrors={errors.title_multiloc as any}
                />
              }
            </SectionField>
          }

          <SectionField
            className="fullWidth"
          >
            <Field
              name="body_multiloc"
              render={this.renderQuill}
              label={<FormattedMessage {...messages.editContent} />}
              renderPerLocale={this.renderAdavancedEditorLink}
            />
            {touched.body_multiloc &&
              <ErrorComponent
                fieldName="body_multiloc"
                apiErrors={errors.body_multiloc as any}
              />
            }
          </SectionField>

          {mode === 'edit' &&
            <SectionField>
              <Label><FormattedMessage {...messages.pageSlug} /></Label>
              <Field
                name="slug"
                component={FormikInput}
                label={<FormattedMessage {...messages.pageSlug} />}
              />
              {touched.slug &&
                <ErrorComponent
                  fieldName="slug"
                  apiErrors={errors.slug as any}
                />
              }
              <Warning>
                <FormattedMessage {...messages.dontChange} />
              </Warning>
            </SectionField>
          }

        </Section>

        <Section>
          <Field
            name="page_files"
            render={this.renderFileUploader(values)}
          />
        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
        />

      </Form>
    );
  }
}

export default PageForm;
