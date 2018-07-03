// Libraries
import React from 'react';
import { isEmpty } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';
import { Formik } from 'formik';
import { withRouter, WithRouterProps } from 'react-router';

// Services / Data loading
import { updateProject, IProjectData } from 'services/projects';
import { addProjectImage } from 'services/projectImages';
import GetProject from 'resources/GetProject';

// Components
import DescriptionEditionForm, { Values } from './DescriptionEditionForm';

// utils
import { uploadAndReplaceBase64 } from 'utils/imageTools';

// Typing
import { API } from 'typings';

interface InputProps { }

interface DataProps {
  project: IProjectData;
}

interface Props extends InputProps, DataProps { }

class ProjectDescription extends React.PureComponent<Props> {

  saveProject = (values, { setSubmitting, setErrors, setStatus, resetForm }) => {
    const { project } = this.props;

    if (!isEmpty(values) && project.id) {
      setSubmitting(true);
      setStatus(null);

      const promiseArray: Promise<any>[] = Object.keys(values.description_multiloc).map((locale) => {
        return uploadAndReplaceBase64(values.description_multiloc[locale], this.props.project.id, addProjectImage);
      });

      Promise.all(promiseArray).then((res) => {
        console.log(res);
        res.forEach((html, index) => {
          const currentLocale = Object.keys(values.description_multiloc)[index];
          values.description_multiloc[currentLocale] = html;
        });
        console.log(values);
        // Send the values to the API
        updateProject(project.id, values).catch((errorResponse) => {
          // Process errors from the API and push them to the Formik context
          const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
          setErrors(apiErrors);
          setSubmitting(false);
        }).then(() => {
          // Reset the Formik context for touched and errors tracking
          resetForm();
          setStatus('success');
        });
      });
    }
  }

  render() {
    const { description_preview_multiloc, description_multiloc }: Values = this.props.project.attributes;

    return (
      <>
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
      </>
    );
  }
}

export default withRouter<InputProps>((inputProps: InputProps & WithRouterProps) => (
  <GetProject id={inputProps.params.projectId}>
    {project => !isNilOrError(project) ? < ProjectDescription {...inputProps} project={project} /> : null}
  </GetProject>
));
