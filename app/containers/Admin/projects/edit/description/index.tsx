// Libraries
import React from 'react';
import { isEmpty } from 'lodash';
import { Formik } from 'formik';

// Services / Data loading
import { updateProject,  IProjectData } from 'services/projects';
import GetProject from 'resources/GetProject';

// Components
import DescriptionEditionForm, { Values } from './DescriptionEditionForm';

// Typing
import { API } from 'typings';

interface Props {
  project: IProjectData;
}

class ProjectDescription extends React.Component<Props> {
  saveProject = (values, { setSubmitting, setErrors, setStatus, resetForm }) => {
    const { project } = this.props;

    if (!isEmpty(values) && project.id) {
      setSubmitting(true);
      setStatus(null);

      // Send the values to the API
      updateProject(project.id, values)
      .catch((errorResponse) => {
        // Process errors from the API and push them to the Formik context
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      })
      .then(() => {
        // Reset the Formik context for touched and errors tracking
        resetForm();
        setStatus('success');
      });
    }
  }

  render () {
    const { description_preview_multiloc, description_multiloc }: Values = this.props.project.attributes;

    return (
      <Formik
        onSubmit={this.saveProject}
        initialValues={{
          description_preview_multiloc,
          description_multiloc,
        }}
      >
        {(formikProps) => (
          <DescriptionEditionForm {...formikProps} />
        )}
      </Formik>
    );
  }
}

export default (props) => (
  <GetProject slug={props.params.slug}>
    {({ project }) => project && < ProjectDescription {...props} project={project} />}
  </GetProject>
);
