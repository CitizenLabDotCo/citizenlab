import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Label from 'components/UI/Label';
import Radio from 'components/UI/Radio';
import ProjectGroupsList from './ProjectGroupsList';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionField } from 'components/admin/Section';

// services
import { projectBySlugStream, updateProject, IProject } from 'services/projects';
import { groupsProjectsByProjectIdStream, addGroupProject, deleteGroupProject, IGroupsProjects } from 'services/groupsProjects';

// style
import styled from 'styled-components';

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
  savedVisibleTo: 'public' | 'admins' | 'groups';
  unsavedVisibleTo: 'public' | 'admins' | 'groups';
  loading: boolean;
  saving: boolean;
  status: 'disabled' | 'enabled' | 'error' | 'success';
};

class ProjectPermissions extends React.PureComponent<Props & InjectedIntlProps, State> {
  
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      project: null,
      oldGroupsProjects: null,
      newGroupsProjects: null,
      savedVisibleTo: 'public',
      unsavedVisibleTo: 'public',
      loading: true,
      saving: false,
      status: 'disabled'
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    if (this.props.params.slug) {
      const projectSlug = this.props.params.slug;
      const project$ = projectBySlugStream(projectSlug).observable.do((project) => {
        this.setState({
          savedVisibleTo: project.data.attributes.visible_to,
          unsavedVisibleTo: project.data.attributes.visible_to
        });
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
            const status = (state.unsavedVisibleTo === 'groups' && !_.isEqual(newGroupsProjects, oldGroupsProjects) ? 'enabled' : state.status);
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

  componentWillUnmount() {
    const { project, unsavedVisibleTo, oldGroupsProjects, newGroupsProjects } = this.state;
    const oldGroupsProjectIds = (oldGroupsProjects ? _(oldGroupsProjects.data).map(groupsProject => groupsProject.id).value() : []);
    const newGroupsProjectsIds = (newGroupsProjects ? _(newGroupsProjects.data).map(groupsProject => groupsProject.id).value() : []);

    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    if (project && unsavedVisibleTo === 'groups' && !_.isEqual(oldGroupsProjectIds, newGroupsProjectsIds)) {
      const groupsProjectIdsToRemove = _.difference(newGroupsProjectsIds, oldGroupsProjectIds);
      const groupsProjectIdsToAdd = _.difference(oldGroupsProjectIds, newGroupsProjectsIds);

      Promise.all<any>([
        ...groupsProjectIdsToRemove.map(groupsProjectId => deleteGroupProject(groupsProjectId)),
        ...groupsProjectIdsToAdd.map(groupsProjectId => addGroupProject(project.data.id, groupsProjectId))
      ]);
    }
  }

  saveChanges = async () => {
    const { project, newGroupsProjects, savedVisibleTo, unsavedVisibleTo } = this.state;

    if (project && savedVisibleTo && unsavedVisibleTo) {
      let promises: Promise<any>[] = [];

      if (unsavedVisibleTo !== savedVisibleTo) {
        promises = [updateProject(project.data.id, { visible_to: unsavedVisibleTo })];
      }

      if (unsavedVisibleTo !== 'groups' && newGroupsProjects !== null && !_.isEmpty(newGroupsProjects.data)) {
        promises = [
          ...promises,
          ...newGroupsProjects.data.map(groupsProject => deleteGroupProject(groupsProject.id))
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
  }

  handlePermissionTypeChange = (unsavedVisibleTo: 'public' | 'groups' | 'admins') => {
    this.setState((state) => ({
      unsavedVisibleTo,
      status: (unsavedVisibleTo === 'groups' && (state.newGroupsProjects === null || _.isEmpty(state.newGroupsProjects.data))) ? 'disabled' : 'enabled'
    }));
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { project, unsavedVisibleTo, loading, saving, status } = this.state;

    const groups = ((!loading && unsavedVisibleTo === 'groups' && project) ? (
      <ProjectGroupsList projectId={project.data.id} />
    ) : null);

    if (!loading && unsavedVisibleTo) {
      return (
        <Section>
          <SectionField>
            <Label htmlFor="permissions-type">
              <FormattedMessage {...messages.permissionTypeLabel} />
            </Label>

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
          </SectionField>

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
        </Section>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(ProjectPermissions);
