import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { switchMap, tap, map as rxMap } from 'rxjs/operators';
import { map, isEmpty, isEqual, difference } from 'lodash-es';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Radio, IconTooltip } from 'cl2-component-library';
import ProjectGroupsList from './ProjectGroupsList';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import {
  Section,
  SubSectionTitle,
  SectionTitle,
  SectionField,
} from 'components/admin/Section';
import Moderators from './Moderators';
import IdeaAssignment from './IdeaAssignment';
import Link from 'utils/cl-router/Link';

// services
import { projectByIdStream, updateProject, IProject } from 'services/projects';
import {
  groupsProjectsByProjectIdStream,
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
import { fontSizes } from 'utils/styleUtils';
import Outlet from 'components/Outlet';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

const ViewingRightsSection = styled(Section)`
  margin-bottom: 30px;
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

const StyledSectionField = styled(SectionField)`
  margin-bottom: 5px;
`;

const RadioButtonsWrapper = styled.fieldset`
  border: none;
  padding: 0;
  margin-bottom: 10px;
`;

const StyledRadio = styled(Radio)`
  margin-bottom: 10px;
  cursor: pointer;

  .text {
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: 22px;
  }
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

class ProjectPermissions extends PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
  State
> {
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

  componentDidMount() {
    if (this.props.params.projectId) {
      const projectId = this.props.params.projectId;
      const project$ = projectByIdStream(projectId).observable.pipe(
        tap((project) => {
          this.setState({
            savedVisibleTo: project.data.attributes.visible_to,
            unsavedVisibleTo: project.data.attributes.visible_to,
          });
        })
      );

      this.subscriptions = [
        project$
          .pipe(
            switchMap((project) => {
              return groupsProjectsByProjectIdStream(
                project.data.id
              ).observable.pipe(
                rxMap((groupsProjects) => ({
                  project,
                  groupsProjects,
                }))
              );
            })
          )
          .subscribe(({ project, groupsProjects }) => {
            this.setState((state) => {
              const oldGroupsProjects = state.loading
                ? groupsProjects
                : state.oldGroupsProjects;
              const newGroupsProjects = groupsProjects;
              const status =
                state.unsavedVisibleTo === 'groups' &&
                !isEqual(newGroupsProjects, oldGroupsProjects)
                  ? 'enabled'
                  : state.status;
              const loading = false;

              return {
                project,
                oldGroupsProjects,
                newGroupsProjects,
                status,
                loading,
              };
            });
          }),
      ];
    }
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
    const { formatMessage } = this.props.intl;

    const {
      projectVisibilityEnabled,
      projectManagementEnabled,
      ideaAssignmentEnabled,
      granularPermissionsEnabled,
    } = this.props;

    const { project, unsavedVisibleTo, loading, saving, status } = this.state;

    if (!loading && unsavedVisibleTo && project) {
      const projectId = project.data.id;

      return (
        <>
          <StyledSection>
            <StyledSectionTitle>
              <FormattedMessage {...messages.participationAccessRightsTitle} />
            </StyledSectionTitle>

            {(projectVisibilityEnabled || granularPermissionsEnabled) && (
              <ViewingRightsSection>
                <StyledSectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.viewingRightsTitle} />
                  </SubSectionTitle>

                  <RadioButtonsWrapper>
                    <StyledRadio
                      onChange={this.handlePermissionTypeChange}
                      currentValue={unsavedVisibleTo}
                      name="permissionsType"
                      label={formatMessage(messages.permissionsEveryoneLabel)}
                      value="public"
                      id="permissions-all"
                    />
                    <StyledRadio
                      onChange={this.handlePermissionTypeChange}
                      currentValue={unsavedVisibleTo}
                      name="permissionsType"
                      label={formatMessage(messages.permissionsAdministrators)}
                      value="admins"
                      id="permissions-administrators"
                    />
                    <StyledRadio
                      onChange={this.handlePermissionTypeChange}
                      currentValue={unsavedVisibleTo}
                      name="permissionsType"
                      label={formatMessage(messages.permissionsSelectionLabel)}
                      value="groups"
                      id="permissions-selection"
                    />
                  </RadioButtonsWrapper>
                </StyledSectionField>

                {unsavedVisibleTo === 'groups' && (
                  <ProjectGroupsList
                    projectId={projectId}
                    onAddButtonClicked={this.handleGroupsAdded}
                  />
                )}

                {unsavedVisibleTo !== 'groups' && (
                  <SubmitWrapper
                    loading={saving}
                    status={status}
                    onClick={this.saveChanges}
                    messages={{
                      buttonSave: messages.save,
                      buttonSuccess: messages.saveSuccess,
                      messageError: messages.saveErrorMessage,
                      messageSuccess: messages.saveSuccessMessage,
                    }}
                  />
                )}
              </ViewingRightsSection>
            )}

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

const ProjectPermissionsWithHoC = injectIntl(ProjectPermissions);

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
      {(dataProps) => (
        <ProjectPermissionsWithHoC {...inputProps} {...dataProps} />
      )}
    </Data>
  )
);

export default WrappedProjectPermissions;
