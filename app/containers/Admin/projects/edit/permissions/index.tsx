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
  margin-bottom: 15px;
`;

const StyledRadio = styled(Radio)`
  margin-bottom: 5px;

  .text {
    color: #333;
    color: red;
    font-size: 18px;
    font-weight: 400;
    line-height: 22px;
  }
`;

// Typing
interface Props {
  params: {
    slug: string | null,
  };
}

interface State {
  project: IProject | null;
  oldGroupsProjects: IGroupsProjects | null;
  newGroupsProjects: IGroupsProjects | null;
  visibleTo: 'public' | 'admins' | 'groups';
  loading: boolean;
  saving: boolean;
  status: 'disabled' | 'enabled' | 'error' | 'success';
}

class ProjectPermissions extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
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
            let status = state.status;

            if (state.visibleTo === 'groups' && !_.isEqual(oldGroupsProjects, newGroupsProjects)) {
              status = 'enabled';
            }

            return {
              project,
              oldGroupsProjects,
              newGroupsProjects,
              status,
              loading: false
            };
          });
        })
      ];
    }
  }

  async componentWillUnmount() {
    const { project, visibleTo, oldGroupsProjects, newGroupsProjects } = this.state;

    if (project) {
      const oldVisibleTo = project.data.attributes.visible_to;
      const newVisibleTo = visibleTo;
      const promises: Promise<any>[] = [];

      if (oldVisibleTo !== 'groups' && newVisibleTo === 'groups' && newGroupsProjects && newGroupsProjects.data.length > 0) {
        promises.concat(newGroupsProjects.data.map(groupsProject => deleteGroupProject(groupsProject.id)));
      }

      if (oldVisibleTo === 'groups' && newVisibleTo === 'groups' && !_.isEqual(oldGroupsProjects, newGroupsProjects)) {
        if (newGroupsProjects && newGroupsProjects.data && newGroupsProjects.data.length) {
          promises.concat(newGroupsProjects.data.map(groupsProject => deleteGroupProject(groupsProject.id)));
        }

        if (oldGroupsProjects && oldGroupsProjects.data && oldGroupsProjects.data.length) {
          promises.concat(oldGroupsProjects.data.map(groupsProject => addGroupProject(project.data.id, groupsProject.relationships.group.data.id)));
        }
      }

      await Promise.all(promises);
    }

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  saveChanges = async () => {
    const { project, oldGroupsProjects, newGroupsProjects, visibleTo } = this.state;

    if (project) {
      const oldVisibleTo = _.cloneDeep(project.data.attributes.visible_to);
      const newVisibleTo = _.cloneDeep(visibleTo);

      if (newVisibleTo !== oldVisibleTo) {
        try {
          this.setState({ saving: true });

          if (newVisibleTo !== 'groups' && oldVisibleTo === 'groups') {
            const groupsProjects = await groupsProjectsByProjectIdStream(project.data.id).observable.first().toPromise();

            if (groupsProjects && groupsProjects.data && groupsProjects.data.length > 0) {
              await Promise.all(groupsProjects.data.map(groupsProject => deleteGroupProject(groupsProject.id)));
            }
          }

          await updateProject(project.data.id, { visible_to: visibleTo });

          this.setState({ saving: false, status: 'success' });
        } catch (error) {
          this.setState({ saving: false, status: 'error' });
        }
      } else if (newVisibleTo === 'groups' && oldVisibleTo === 'groups') {
        this.setState({
          oldGroupsProjects: newGroupsProjects,
          saving: true
        });

        setTimeout(() => {
          this.setState({
            saving: false,
            status: 'success'
          });
        }, 600);
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

          <Description>
            <FormattedMessage {...messages.permissionsSubtitle} />
          </Description>

          <StyledFieldWrapper>
            <StyledLabel htmlFor="permissions-type">
              <FormattedMessage {...messages.permissionTypeLabel} />
            </StyledLabel>
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
