import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// components
import Radio from 'components/UI/Radio';
import FieldWrapper from 'components/admin/FieldWrapper';
import ProjectGroupsList from './ProjectGroupsList';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// services
import { projectBySlugStream, updateProject, IProject, IProjectData } from 'services/projects';
import { groupsProjectsByProjectIdStream, addGroupProject, deleteGroupProject, IGroupsProjects } from 'services/groupsProjects';

// style
import styled from 'styled-components';

const Title = styled.h1`
  color: #333;
  font-size: 28px;
  font-weight: 500;
  line-height: 32px;
  margin: 0;
  margin-bottom: 30px;
  padding: 0;
`;

const Description = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  margin-bottom: 30px;
`;

const StyledFieldWrapper = styled(FieldWrapper)``;

const StyledLabel = styled.label`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
`;

const RadioButtonsWrapper = styled.div`
  margin-top: 15px;
  margin-bottom: 30px;
`;

const StyledRadio = styled(Radio)`
  margin-bottom: 10px;
  cursor: pointer;

  .text {
    color: #333;
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
  }
`;

type Props  = {
  params: {
    slug: string | null
  };
};

type State  = {
  project: IProject | null;
  oldGroupsProjects: IGroupsProjects | null;
  newGroupsProjects: IGroupsProjects | null;
  visibleTo: 'public' | 'admins' | 'groups';
  loading: boolean;
  saving: boolean;
  status: 'disabled' | 'enabled' | 'error' | 'success';
};

class ProjectPermissions extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      project: null,
      oldGroupsProjects: null,
      newGroupsProjects: null,
      visibleTo: 'public',
      loading: true,
      saving: false,
      status: 'disabled'
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    if (this.props.params.slug) {
      const projectSlug = this.props.params.slug;
      const project$ = projectBySlugStream(projectSlug).observable.do((project) => {
        this.setState({ visibleTo: project.data.attributes.visible_to });
      });

      this.subscriptions = [
        project$.switchMap((project) => {
          return groupsProjectsByProjectIdStream(project.data.id).observable.map((groupsProjects) => ({
            project,
            groupsProjects
          }));
        }).subscribe(({ project, groupsProjects }) => {
          this.setState((state) => {
            const oldGroupsProjects = (state.loading ? groupsProjects : state.oldGroupsProjects);
            const newGroupsProjects = groupsProjects;
            const status = (state.visibleTo === 'groups' && newGroupsProjects !== oldGroupsProjects ? 'enabled' : state.status);
            const loading = false;

            return {
              project,
              oldGroupsProjects,
              newGroupsProjects,
              status,
              loading
            };
          });
        })
      ];
    }
  }

  async componentWillUnmount() {
    const { project, visibleTo, oldGroupsProjects, newGroupsProjects } = this.state;
    
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    if (project) {
      const oldVisibleTo = project.data.attributes.visible_to;
      const newVisibleTo = visibleTo;
      let promises: Promise<any>[] = [];

      if (oldVisibleTo !== 'groups' && newVisibleTo === 'groups' && newGroupsProjects && newGroupsProjects.data.length > 0) {
        promises = [
          ...promises,
          ...newGroupsProjects.data.map(groupsProject => deleteGroupProject(groupsProject.id))
        ];
      }

      if (oldVisibleTo === 'groups' && newVisibleTo === 'groups') {
        let oldGroupsProjectIds: string[] = [];
        let newGroupsProjectsIds: string[] = [];

        if (oldGroupsProjects && oldGroupsProjects.data && oldGroupsProjects.data.length) {
          oldGroupsProjectIds = oldGroupsProjects.data.map(groupsProject => groupsProject.id);
        }

        if (newGroupsProjects && newGroupsProjects.data && newGroupsProjects.data.length) {
          newGroupsProjectsIds = newGroupsProjects.data.map(groupsProject => groupsProject.id);
        }

        const groupsProjectIdsToRemove = _.difference(newGroupsProjectsIds, oldGroupsProjectIds);
        const groupsProjectIdsToAdd = _.difference(oldGroupsProjectIds, newGroupsProjectsIds);

        promises = [
          ...promises,
          ...groupsProjectIdsToRemove.map(groupsProjectId => deleteGroupProject(groupsProjectId)),
          ...groupsProjectIdsToAdd.map(groupsProjectId => addGroupProject(project.data.id, groupsProjectId))
        ];
      }

      if (promises && promises.length > 0) {
        await Promise.all(promises);
      }
    }
  }

  saveChanges = async () => {
    const { project, oldGroupsProjects, newGroupsProjects, visibleTo } = this.state;

    if (project) {
      const oldVisibleTo = _.cloneDeep(project.data.attributes.visible_to);
      const newVisibleTo = _.cloneDeep(visibleTo);
      let promises: Promise<any>[] = [updateProject(project.data.id, { visible_to: visibleTo })];

      try {
        if (newVisibleTo !== 'groups') {
          const groupsProjects = await groupsProjectsByProjectIdStream(project.data.id).observable.first().toPromise();

          if (groupsProjects && groupsProjects.data && groupsProjects.data.length > 0) {
            promises = [
              ...promises,
              ...groupsProjects.data.map(groupsProject => deleteGroupProject(groupsProject.id))
            ];
          }
        }

        this.setState({ saving: true });
        await Promise.all(promises);
        this.setState({ saving: false, status: 'success' });
      } catch (error) {
        this.setState({ saving: false, status: 'error' });
      }
    }
  }

  handlePermissionTypeChange = (newVisibleTo: 'public' | 'groups' | 'admins') => {
    this.setState({ visibleTo: newVisibleTo, status: 'enabled' });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { project, visibleTo, loading, saving, status } = this.state;

    const groups = ((!loading && visibleTo === 'groups' && project) ? (
      <ProjectGroupsList projectId={project.data.id} />
    ) : null);

    if (!loading && visibleTo) {
      return (
        <div>
          <Title>
            <FormattedMessage {...messages.permissionsTitle} />
          </Title>

          {/*
          <Description>
            <FormattedMessage {...messages.permissionsSubtitle} />
          </Description>
          */}

          <StyledFieldWrapper>
            <StyledLabel htmlFor="permissions-type">
              <FormattedMessage {...messages.permissionTypeLabel} />
            </StyledLabel>

            <RadioButtonsWrapper>
              <StyledRadio
                onChange={this.handlePermissionTypeChange}
                currentValue={visibleTo}
                name="permissionsType"
                label={formatMessage(messages.permissionsEveryoneLabel)}
                value="public"
                id="permissions-all"
              />
              <StyledRadio
                onChange={this.handlePermissionTypeChange}
                currentValue={visibleTo}
                name="permissionsType"
                label={formatMessage(messages.permissionsAdministrators)}
                value="admins"
                id="permissions-administrators"
              />
              <StyledRadio
                onChange={this.handlePermissionTypeChange}
                currentValue={visibleTo}
                name="permissionsType"
                label={formatMessage(messages.permissionsSelectionLabel)}
                value="groups"
                id="permissions-selection"
              />
            </RadioButtonsWrapper>
          </StyledFieldWrapper>

          {groups}

          <SubmitWrapper
            loading={saving}
            status={status}
            onClick={this.saveChanges}
            messages={{
              buttonSave: messages.save,
              buttonError: messages.saveError,
              buttonSuccess: messages.saveSuccess,
              messageError: messages.saveErrorMessage,
              messageSuccess: messages.saveSuccessMessage,
            }}
          />
        </div>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(ProjectPermissions);
