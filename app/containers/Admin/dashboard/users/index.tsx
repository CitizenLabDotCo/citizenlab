// libraries
import React, { PureComponent } from 'react';
import moment, { Moment } from 'moment';
import { adopt } from 'react-adopt';
import localize, { InjectedLocalized } from 'utils/localize';
import { ThemeProvider } from 'styled-components';

// resources
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

// components
import ChartFilters from '../components/ChartFilters';
import { GraphsContainer, ControlBar, chartTheme } from '../';
import TimeControl from '../components/TimeControl';
import RegistrationFieldsToGraphs from './RegistrationFieldsToGraphs';
import MostActiveUsersList from './charts/MostActiveUsersList';

// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from '../tracks';

// typings
import { IOption } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface State {
  startAtMoment?: Moment | null;
  endAtMoment: Moment | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
}

interface DataProps {
  groups: GetGroupsChildProps;
}

interface Props extends DataProps {}

interface Tracks {
  trackFilterOnGroup: Function;
}

export class UsersDashboard extends PureComponent<
  Props & InjectedIntlProps & InjectedLocalized & Tracks,
  State
> {
  constructor(props: Props & InjectedIntlProps & InjectedLocalized & Tracks) {
    super(props as any);
    this.state = {
      startAtMoment: undefined,
      endAtMoment: moment(),
      currentGroupFilter: undefined,
      currentGroupFilterLabel: undefined,
    };
  }

  handleChangeTimeRange = (
    startAtMoment: Moment | null | undefined,
    endAtMoment: Moment | null
  ) => {
    this.setState({ startAtMoment, endAtMoment });
  };

  handleOnGroupFilter = (filter) => {
    this.props.trackFilterOnGroup({ extra: { group: filter } });
    this.setState({
      currentGroupFilter: filter.value,
      currentGroupFilterLabel: filter.label,
    });
  };

  generateGroupFilterOptions = () => {
    const {
      groups,
      groups: { groupsList },
      localize,
      intl: { formatMessage },
    } = this.props;
    let filterOptions: IOption[] = [];

    if (!isNilOrError(groups) && !isNilOrError(groupsList)) {
      filterOptions = groupsList.map((group) => ({
        value: group.id,
        label: localize(group.attributes.title_multiloc),
      }));
    }

    return [
      { value: '', label: formatMessage(messages.allGroups) },
      ...filterOptions,
    ];
  };

  render() {
    const {
      currentGroupFilter,
      endAtMoment,
      startAtMoment,
      currentGroupFilterLabel,
    } = this.state;
    const startAt = startAtMoment && startAtMoment.toISOString();
    const endAt = endAtMoment && endAtMoment.toISOString();
    const infoMessage = this.props.intl.formatMessage(
      messages.mostActiveUsersRankingDescription
    );

    return (
      <ThemeProvider theme={chartTheme}>
        <ControlBar>
          <TimeControl
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            onChange={this.handleChangeTimeRange}
          />
        </ControlBar>

        <ChartFilters
          currentProjectFilter={undefined}
          currentGroupFilter={currentGroupFilter}
          currentTopicFilter={undefined}
          projectFilterOptions={null}
          groupFilterOptions={this.generateGroupFilterOptions()}
          topicFilterOptions={null}
          onProjectFilter={null}
          onGroupFilter={this.handleOnGroupFilter}
          onTopicFilter={null}
        />

        <GraphsContainer>
          <RegistrationFieldsToGraphs
            startAt={startAt}
            endAt={endAt}
            currentGroupFilter={currentGroupFilter}
            currentGroupFilterLabel={currentGroupFilterLabel}
          />
          <MostActiveUsersList
            currentGroupFilter={currentGroupFilter}
            startAt={startAt}
            endAt={endAt}
            infoMessage={infoMessage}
            className="dynamicHeight"
          />
        </GraphsContainer>
      </ThemeProvider>
    );
  }
}

const Data = adopt<DataProps, {}>({
  groups: <GetGroups />,
});

const UsersDashBoardWithHOCs = injectIntl(
  injectTracks<Props>({
    trackFilterOnGroup: tracks.filteredOnGroup,
  })(localize<Props & Tracks>(UsersDashboard))
);

export default () => (
  <Data>{(dataProps) => <UsersDashBoardWithHOCs {...dataProps} />}</Data>
);
