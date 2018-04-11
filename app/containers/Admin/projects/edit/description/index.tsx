// Libraries
import React from 'react';
import { Subscription, Observable } from 'rxjs/Rx';
import { isEmpty } from 'lodash';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Services
import { projectBySlugStream, updateProject,  IProjectData } from 'services/projects';

// Components
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import Error from 'components/UI/Error';
import { Section, SectionField } from 'components/admin/Section';

import { Formik, Form, Field } from 'formik';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import FormikEditorMultiloc from 'components/UI/FormikEditorMultiloc';

// Typing
import { API, Multiloc } from 'typings';

interface Props {
  params: {
    slug: string | null;
  };
}

interface State {
  data: IProjectData | { id: null, attributes: { description_preview_multiloc: Multiloc, description_multiloc: Multiloc }, relationships: { areas: {data} }};
}

export default class ProjectDescription extends React.Component<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);

    this.state = {
      data: { id: null, attributes: { description_multiloc: {}, description_preview_multiloc: {} }, relationships: { areas: { data: [] } } },
    };

    this.subscriptions = [];
  }

  componentDidMount () {
    if (this.props.params.slug) {
      const project$ = projectBySlugStream(this.props.params.slug).observable;

      this.subscriptions.push(
        Observable.combineLatest(
          project$
        ).subscribe(([project]) => {

          this.setState({
            data: project.data,
          });
        })
      );
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  saveProject = (values: { description_preview_multiloc: Multiloc, description_multiloc: Multiloc }, { setSubmitting, setErrors, setStatus }) => {
    const { data } = this.state;

    if (!isEmpty(values) && data.id) {
      setSubmitting(true);
      setStatus(null);

      updateProject(data.id, values)
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
        setStatus(false);
      })
      .then(() => {
        setSubmitting(false);
        setStatus(true);
      });
    }
  }

  render () {
    const { data } = this.state;

    return (
      <Formik
        initialValues={{
          description_preview_multiloc: data.attributes.description_preview_multiloc,
          description_multiloc: data.attributes.description_multiloc,
        }}
        onSubmit={this.saveProject}
      >
        {({ errors, isSubmitting, status, isValid, touched }) => (
          <Form noValidate className="e2e-project-description-form">
            <Section>
              <SectionField>
                <Field
                  name="description_preview_multiloc"
                  component={FormikTextAreaMultiloc}
                  id="description-preview"
                  label={<FormattedMessage {...messages.descriptionPreviewLabel} />}
                  rows={5}
                  maxCharCount={280}
                />
                <Error fieldName="description_preview_multiloc" apiErrors={errors.description_preview_multiloc} />
              </SectionField>
              <SectionField>
                <Field
                  component={FormikEditorMultiloc}
                  id="project-description"
                  name="description_multiloc"
                  label={<FormattedMessage {...messages.descriptionLabel} />}
                  toolbarConfig={{
                    options: ['inline', 'list', 'link', 'blockType'],
                    inline: {
                      options: ['bold', 'italic'],
                    },
                    list: {
                      options: ['unordered', 'ordered'],
                    },
                    blockType: {
                      inDropdown: false,
                      options: ['Normal', 'H1'],
                      className: undefined,
                      component: undefined,
                      dropdownClassName: undefined,
                    }
                  }}
                />
                <Error fieldName="description_multiloc" apiErrors={errors.description_multiloc} />
              </SectionField>
            </Section>

            <FormikSubmitWrapper
              {...{isValid, isSubmitting, status, touched}}
              messages={{
                buttonSave: messages.saveButtonLabel,
                buttonError: messages.saveErrorLabel,
                buttonSuccess: messages.saveSuccessLabel,
                messageError: messages.saveErrorMessage,
                messageSuccess: messages.saveSuccessMessage,
              }}
            />
          </Form>
        )}
      </Formik>
    );
  }
}
