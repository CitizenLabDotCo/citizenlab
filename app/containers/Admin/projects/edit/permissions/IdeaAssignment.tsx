import React from 'react';
import { adopt } from 'react-adopt';

// typings
import { IOption } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetModerators, { GetModeratorsChildProps } from 'resources/GetModerators';

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

    return [{ value: null, label: this.props.intl.formatMessage(messages.unassigned) }, ...moderatorOptions];
  }

  render() {
    // We want a list that contains the default option, null -- unassigned + a list of moderators.
    // We can update the assignee with a project update
    // After this update, we want to show who's been assigned by looking up the user through the user id and show it through the value prop
    //
    return (
      <Select
        options={this.getOptions()}
        value={}
        onChange={}
      />
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  moderators: ({ projectId, render }) => <GetModerators projectId={projectId}>{render}</GetModerators>,
});

const IdeaAssignmentWithInjectIntl = injectIntl(IdeaAssignment);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <IdeaAssignmentWithInjectIntl {...inputProps} {...dataprops} />}
  </Data>
);
