// Libraries
import React from 'react';
import { Subscription, Observable } from 'rxjs/Rx';
import { isEmpty } from 'lodash';

// Services
import { projectBySlugStream, updateProject,  IProjectData } from 'services/projects';

// Components
import { Formik } from 'formik';
import DescriptionEditionForm from './DescriptionEditionFOrm';

// Typing
import { API } from 'typings';

interface Props {
  params: {
    slug: string | null;
  };
}

interface State {
  data: IProjectData | null;
}

export default class ProjectDescription extends React.Component<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);

    this.state = {
      data: null,
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

  saveProject = (values, { setSubmitting, setErrors, setStatus, resetForm }) => {
    const { data } = this.state;
    if ( !data ) return;

    if (!isEmpty(values) && data.id) {
      setSubmitting(true);
      setStatus(null);

      // Send the values to the API
      updateProject(data.id, values)
      .catch((errorResponse) => {
        // Process errors from the API and push them to the Formik context
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      })
      .then(() => {
        resetForm();
        setStatus('success');
      });
    }
  }

  render () {
    const { data } = this.state;

    if (!data) return null;

    return (
      <Formik
        initialValues={{
          description_preview_multiloc: data.attributes.description_preview_multiloc,
          description_multiloc: data.attributes.description_multiloc,
        }}
        onSubmit={this.saveProject}
      >
        {({ errors, isSubmitting, status, isValid, touched }) => (
          <DescriptionEditionForm {...{errors, isSubmitting, status, isValid, touched}} />
        )}
      </Formik>
    );
  }
}
