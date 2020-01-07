// Libraries
import React from 'react';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { Formik } from 'formik';
import { withRouter, WithRouterProps } from 'react-router';

// Services / Data loading
import { updateProject, IProjectData } from 'services/projects';
import GetProject from 'resources/GetProject';

// Components
import DescriptionEditionForm, { Values } from './DescriptionEditionForm';
import { SectionTitle, SectionSubtitle } from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typing
import { CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

export interface InputProps { }

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

      // Send the values to the API
      updateProject(project.id, values).then(() => {
        // Reset the Formik context for touched and errors tracking
        resetForm();
        setStatus('success');
      }).catch((errorResponse) => {
        // Process errors from the API and push them to the Formik context
        if (isCLErrorJSON(errorResponse)) {
          const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
          setErrors(apiErrors);
        } else {
          setStatus('error');
        }
        setSubmitting(false);
      });
    }
  }

  render() {
    const { description_preview_multiloc, description_multiloc }: Values = this.props.project.attributes;

    return (
      <>
        <SectionTitle>
          <FormattedMessage {...messages.titleDescription} />
        </SectionTitle>
        <SectionSubtitle>
          <FormattedMessage {...messages.subtitleDescription} />
        </SectionSubtitle>
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
  <GetProject projectId={inputProps.params.projectId}>
    {project => !isNilOrError(project) ? <ProjectDescription {...inputProps} project={project} /> : null}
  </GetProject>
));
