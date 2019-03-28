import React from 'react';
import { adopt } from 'react-adopt';
import { isString, get } from 'lodash-es';

// typings
import { IOption } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetModerators, { GetModeratorsChildProps } from 'resources/GetModerators';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// services
import { updateProject } from 'services/projects';

// components
import Select from 'components/UI/Select';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface InputProps {
  projectId: string;
}

interface DataProps {
  project: GetProjectChildProps;
  moderators: GetModeratorsChildProps;
}

interface Props extends InputProps, DataProps {}

class IdeaAssignment extends React.PureComponent<Props & InjectedIntlProps> {

  getOptions = () => {
    const { moderators } = this.props;
    let moderatorOptions: IOption[] = [];

    if (!isNilOrError(moderators)) {
      moderatorOptions = moderators.map(moderator => {
        return ({
          value: moderator.id,
          label: `${moderator.attributes.first_name} ${moderator.attributes.last_name}`,
        });
      });
    }

    return [{ value: 'unassigned', label: this.props.intl.formatMessage(messages.unassigned) }, ...moderatorOptions];
  }

  onAssigneeChange = (assigneeOption: IOption) => {
    const { projectId } = this.props;
    // convert 'unassigned' to null for the back-end update
    const defaultAssigneeId = assigneeOption.value !== 'unassigned' ? assigneeOption.value : null;

    updateProject(projectId, {
      default_assignee_id: defaultAssigneeId
    });

  }

  render() {
    const { project } = this.props;

    if (!isNilOrError(project)) {
      const defaultAssigneeId = get(project, 'relationships.default_assignee.data.id');
      // If defaultAssigneeValue is not a string, it's null, so we convert it to a string (see this.getoptions)
      const defaultAssigneeValue = isString(defaultAssigneeId) ? defaultAssigneeId : 'unassigned';

      return (
        <Select
          options={this.getOptions()}
          value={defaultAssigneeValue}
          onChange={this.onAssigneeChange}
          clearable={false}
        />
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => <GetProject id={projectId}>{render}</GetProject>,
  moderators: ({ projectId, render }) => <GetModerators projectId={projectId}>{render}</GetModerators>,
});

const IdeaAssignmentWithInjectIntl = injectIntl(IdeaAssignment);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <IdeaAssignmentWithInjectIntl {...inputProps} {...dataprops} />}
  </Data>
);
