import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { map, isEmpty, isEqual, difference } from 'lodash-es';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { IconTooltip } from 'cl2-component-library';
import {
  Section,
  SubSectionTitle,
  SectionTitle,
} from 'components/admin/Section';
import Moderators from './Moderators';
import IdeaAssignment from './IdeaAssignment';
import Link from 'utils/cl-router/Link';

// services
import { updateProject, IProject } from 'services/projects';
import {
  addGroupProject,
  deleteGroupProject,
  IGroupsProjects,
} from 'services/groupsProjects';

// resources
import GetModerators, {
  GetModeratorsChildProps,
} from 'resources/GetModerators';
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';

// style
import styled from 'styled-components';
import Outlet from 'components/Outlet';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

const IdeaAssignmentSection = styled(Section)`
  margin-bottom: 30px;
`;

const ModeratorSubSection = styled(Section)`
  margin-bottom: 20px;
`;

export const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 30px;
`;

const StyledLink = styled(Link)`
  &:hover {
    text-decoration: underline;
  }
`;

interface InputProps {}

interface DataProps {
  moderators: GetModeratorsChildProps;
  projectVisibilityEnabled: GetFeatureFlagChildProps;
  projectManagementEnabled: GetFeatureFlagChildProps;
  ideaAssignmentEnabled: GetFeatureFlagChildProps;
  granularPermissionsEnabled: GetFeatureFlagChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  project: IProject | null;
  oldGroupsProjects: IGroupsProjects | null;
  newGroupsProjects: IGroupsProjects | null;
  savedVisibleTo: 'public' | 'admins' | 'groups';
  unsavedVisibleTo: 'public' | 'admins' | 'groups';
  loading: boolean;
  saving: boolean;
  status: 'disabled' | 'enabled' | 'error' | 'success';
}

class ProjectPermissions extends PureComponent<Props & WithRouterProps, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      project: null,
      oldGroupsProjects: null,
      newGroupsProjects: null,
      savedVisibleTo: 'public',
      unsavedVisibleTo: 'public',
      loading: true,
      saving: false,
      status: 'disabled',
    };
    this.subscriptions = [];
  }

  componentWillUnmount() {
    const {
      project,
      unsavedVisibleTo,
      oldGroupsProjects,
      newGroupsProjects,
    } = this.state;
    const oldGroupsProjectIds = oldGroupsProjects
      ? map(oldGroupsProjects.data, (groupsProject) => groupsProject.id)
      : [];
    const newGroupsProjectsIds = newGroupsProjects
      ? map(newGroupsProjects.data, (groupsProject) => groupsProject.id)
      : [];

    this.subscriptions.forEach((subscription) => subscription.unsubscribe());

    if (
      project &&
      unsavedVisibleTo === 'groups' &&
      !isEqual(oldGroupsProjectIds, newGroupsProjectsIds)
    ) {
      const groupsProjectIdsToRemove = difference(
        newGroupsProjectsIds,
        oldGroupsProjectIds
      );
      const groupsProjectIdsToAdd = difference(
        oldGroupsProjectIds,
        newGroupsProjectsIds
      );

      Promise.all<any>([
        ...groupsProjectIdsToRemove.map((groupsProjectId) =>
          deleteGroupProject(groupsProjectId)
        ),
        ...groupsProjectIdsToAdd.map((groupsProjectId) =>
          addGroupProject(project.data.id, groupsProjectId)
        ),
      ]);
    }
  }

  saveChanges = async () => {
    const {
      project,
      newGroupsProjects,
      savedVisibleTo,
      unsavedVisibleTo,
    } = this.state;

    if (project && savedVisibleTo && unsavedVisibleTo) {
      let promises: Promise<any>[] = [];

      if (unsavedVisibleTo !== savedVisibleTo) {
        promises = [
          updateProject(project.data.id, { visible_to: unsavedVisibleTo }),
        ];
      }

      if (
        unsavedVisibleTo !== 'groups' &&
        newGroupsProjects !== null &&
        !isEmpty(newGroupsProjects.data)
      ) {
        promises = [
          ...promises,
          ...newGroupsProjects.data.map((groupsProject) =>
            deleteGroupProject(groupsProject.id)
          ),
        ];
      }

      if (unsavedVisibleTo === 'groups') {
        this.setState({ oldGroupsProjects: newGroupsProjects });
      }

      try {
        this.setState({ saving: true });
        await Promise.all(promises);
        this.setState({ saving: false, status: 'success' });
      } catch (error) {
        this.setState({ saving: false, status: 'error' });
      }
    }
  };

  handlePermissionTypeChange = (
    unsavedVisibleTo: 'public' | 'groups' | 'admins'
  ) => {
    this.setState((state) => ({
      unsavedVisibleTo,
      status:
        unsavedVisibleTo === 'groups' &&
        (state.newGroupsProjects === null ||
          isEmpty(state.newGroupsProjects.data))
          ? 'disabled'
          : 'enabled',
    }));
  };

  handleGroupsAdded = () => {
    this.saveChanges();
  };

  render() {
    const {
      projectVisibilityEnabled,
      projectManagementEnabled,
      ideaAssignmentEnabled,
      granularPermissionsEnabled,
    } = this.props;

    const { project, unsavedVisibleTo, loading } = this.state;

    if (!loading && unsavedVisibleTo && project) {
      const projectId = project.data.id;

      return (
        <>
          <StyledSection>
            {(projectVisibilityEnabled || granularPermissionsEnabled) && (
              <StyledSectionTitle>
                <FormattedMessage
                  {...messages.participationAccessRightsTitle}
                />
              </StyledSectionTitle>
            )}

            <Outlet
              id="app.containers.Admin.project.edit.permissions.projectVisibility"
              projectId={project.data.id}
            />

            <Outlet
              id="app.containers.Admin.project.edit.permissions"
              project={project.data}
            />
          </StyledSection>

          {(projectManagementEnabled || ideaAssignmentEnabled) && (
            <StyledSection>
              <StyledSectionTitle>
                <FormattedMessage {...messages.moderationRightsTitle} />
              </StyledSectionTitle>

              {projectManagementEnabled && (
                <ModeratorSubSection>
                  <Moderators
                    moderators={this.props.moderators}
                    projectId={projectId}
                  />
                </ModeratorSubSection>
              )}

              {ideaAssignmentEnabled && (
                <IdeaAssignmentSection>
                  <SubSectionTitle>
                    <FormattedMessage
                      {...messages.inputAssignmentSectionTitle}
                    />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...messages.inputAssignmentTooltipText}
                          values={{
                            ideaManagerLink: (
                              <StyledLink
                                to={`/admin/projects/${projectId}/ideas`}
                              >
                                <FormattedMessage
                                  {...messages.inputManagerLinkText}
                                />
                              </StyledLink>
                            ),
                          }}
                        />
                      }
                    />
                  </SubSectionTitle>
                  <IdeaAssignment projectId={projectId} />
                </IdeaAssignmentSection>
              )}
            </StyledSection>
          )}
        </>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, WithRouterProps>({
  moderators: ({ params, render }) => (
    <GetModerators projectId={params.projectId}>{render}</GetModerators>
  ),
  projectVisibilityEnabled: <GetFeatureFlag name="project_visibility" />,
  granularPermissionsEnabled: <GetFeatureFlag name="granular_permissions" />,
  projectManagementEnabled: <GetFeatureFlag name="project_management" />,
  ideaAssignmentEnabled: <GetFeatureFlag name="idea_assignment" />,
});

const WrappedProjectPermissions = withRouter(
  (inputProps: InputProps & WithRouterProps) => (
    <Data {...inputProps}>
      {(dataProps) => <ProjectPermissions {...inputProps} {...dataProps} />}
    </Data>
  )
);

export default WrappedProjectPermissions;
