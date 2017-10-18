// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Radio from 'components/UI/Radio';
import FieldWrapper from 'components/admin/FieldWrapper';

// Services
import { projectBySlugStream, IProject, IProjectData } from 'services/projects';
import { groupsProjectsByProjectIdStream, IGroupsProjects } from 'services/groupsProjects';

// Style
import styled from 'styled-components';

// Typing
interface Props {
  params: {
    slug: string | null,
  };
}

interface State {
  currentValue: 'all' | 'selection' | null;
}

class ProjectPermissions extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      currentValue: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    if (this.props.params.slug) {
      const projectSlug = this.props.params.slug;
      const project$ = projectBySlugStream(projectSlug).observable;

      this.subscriptions = [
        project$.switchMap((project) => {
          const groupsProjects$ = groupsProjectsByProjectIdStream(project.data.id).observable;
          return groupsProjects$.map(groupsProjects => ({ project, groupsProjects }));
        }).subscribe(({ project, groupsProjects }) => {
          this.setState({ currentValue: (groupsProjects ? 'selection' : 'all') });
        })
      ];
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handlePermissionTypeChange = (value) => {
    this.setState({ currentValue: value });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { currentValue } = this.state;

    if (currentValue) {
      return (
        <div>
          <h1><FormattedMessage {...messages.permissionsTitle} /></h1>
          <p><FormattedMessage {...messages.permissionsSubtitle} /></p>

          <FieldWrapper>
            <label htmlFor="permissions-type">
              <FormattedMessage {...messages.permissionTypeLabel} />
            </label>
            <Radio
              onChange={this.handlePermissionTypeChange}
              currentValue={currentValue}
              name="permissionsType"
              label={formatMessage(messages.permissionsEveryoneLabel)}
              value="all"
              id="permissions-all"
            />
            <Radio
              onChange={this.handlePermissionTypeChange}
              currentValue={currentValue}
              name="permissionsType"
              label={formatMessage(messages.permissionsSelectionLabel)}
              value="selection"
              id="permissions-selection"
            />
          </FieldWrapper>
        </div>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(ProjectPermissions);
