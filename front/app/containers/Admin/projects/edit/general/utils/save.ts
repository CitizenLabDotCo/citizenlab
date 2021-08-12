import { isEmpty, get, isString } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';
import { IParticipationContextConfig } from '../../participationContext';

// i18n
import messages from '../messages';

// services
import {
  IUpdatedProjectProperties,
  addProject,
  updateProject,
} from 'services/projects';
import { addProjectFile, deleteProjectFile } from 'services/projectFiles';
import { addProjectImage, deleteProjectImage } from 'services/projectImages';

// typings
import { INewProjectCreatedEvent } from '../../../all/CreateProject';

export default async function save(
  participationContextConfig: IParticipationContextConfig | null
) {
  if (this.validate() && !this.state.processing) {
    const { formatMessage } = this.props.intl;
    const {
      project,
      projectImages,
      projectImagesToRemove,
      projectFiles,
      projectFilesToRemove,
    } = this.state;
    const projectAttributesDiff: IUpdatedProjectProperties = {
      ...this.state.projectAttributesDiff,
      ...participationContextConfig,
    };

    try {
      this.setState({ saved: false });
      this.processing$.next(true);

      let isNewProject = false;
      let projectId = project ? project.data.id : null;

      if (!isEmpty(projectAttributesDiff)) {
        if (project) {
          await updateProject(project.data.id, projectAttributesDiff);
        } else {
          const project = await addProject(projectAttributesDiff);
          projectId = project.data.id;
          isNewProject = true;
        }
      }

      if (isString(projectId)) {
        const imagesToAddPromises = projectImages
          .filter((file) => !file.remote)
          .map((file) => addProjectImage(projectId as string, file.base64));
        const imagesToRemovePromises = projectImagesToRemove
          .filter((file) => file.remote === true && isString(file.id))
          .map((file) =>
            deleteProjectImage(projectId as string, file.id as string)
          );
        const filesToAddPromises = projectFiles
          .filter((file) => !file.remote)
          .map((file) =>
            addProjectFile(projectId as string, file.base64, file.name)
          );
        const filesToRemovePromises = projectFilesToRemove
          .filter((file) => file.remote === true && isString(file.id))
          .map((file) =>
            deleteProjectFile(projectId as string, file.id as string)
          );

        await Promise.all([
          ...imagesToAddPromises,
          ...imagesToRemovePromises,
          ...filesToAddPromises,
          ...filesToRemovePromises,
        ] as Promise<any>[]);
      }

      this.setState({
        saved: true,
        submitState: 'success',
        projectImagesToRemove: [],
        projectFilesToRemove: [],
      });

      this.processing$.next(false);

      if (isNewProject && projectId) {
        eventEmitter.emit<INewProjectCreatedEvent>('NewProjectCreated', {
          projectId,
        });
      }
    } catch (errors) {
      // const cannotContainIdeasError = get(errors, 'json.errors.base', []).some((item) => get(item, 'error') === 'cannot_contain_ideas');
      const apiErrors = get(
        errors,
        'json.errors',
        formatMessage(messages.saveErrorMessage)
      );
      const submitState = 'error';
      this.setState({ apiErrors, submitState });
      this.processing$.next(false);
    }
  }
}
