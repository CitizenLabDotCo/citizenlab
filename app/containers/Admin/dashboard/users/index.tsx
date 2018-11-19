// libraries
import React, { PureComponent } from 'react';
import moment, { Moment } from 'moment';
import { ThemeProvider } from 'styled-components';
import { adopt } from 'react-adopt';
import localize, { InjectedLocalized } from 'utils/localize';

// resources
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import { usersByGenderStream } from 'services/stats';

// components
import {
  chartTheme,
  GraphsContainer,
  Row,
  ControlBar,
  IResolution
} from '../';
import TimeControl from '../components/TimeControl';
import ResolutionControl from '../components/ResolutionControl';
import UsersByGenderChart from './charts/UsersByGenderChart';
import AgeChart from './charts/AgeChart';
import ChartFilters from '../components/ChartFilters';
import RegistrationFieldsToGraphs from './RegistrationFieldsToGraphs';
import MostActiveUsersChart from './charts/MostActiveUsersChart';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
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
  resolution: IResolution;
  startAtMoment?: Moment | null;
  endAtMoment: Moment | null;
  currentGroupFilter: string | null;
}

interface DataProps {
  groups: GetGroupsChildProps;
}

interface Props extends DataProps { }

interface Tracks {
  trackFilterOnGroup: Function;
}

class UsersDashboard extends PureComponent<Props & InjectedIntlProps & InjectedLocalized & Tracks, State> {
  constructor(props: Props & InjectedIntlProps & InjectedLocalized & Tracks) {
    super(props as any);
    this.state = {
      resolution: 'month',
      startAtMoment: undefined,
      endAtMoment: moment(),
      currentGroupFilter: null
    };
  }

  changeResolution = (resolution: IResolution) => {
    this.setState({ resolution });
  }

  handleChangeTimeRange = (startAtMoment: Moment | null | undefined, endAtMoment: Moment | null) => {
    const timeDiff = endAtMoment && startAtMoment && moment.duration(endAtMoment.diff(startAtMoment));
    const resolution = timeDiff ? (timeDiff.asMonths() > 6 ? 'month' : timeDiff.asWeeks() > 4 ? 'week' : 'day')
      : 'month';
    this.setState({ startAtMoment, endAtMoment, resolution });
  }

  handleOnGroupFilter = (filter) => {
    this.props.trackFilterOnGroup({ extra: { group: filter } });
    this.setState({ currentGroupFilter: filter.value });
  }

  generateGroupFilterOptions = () => {
    const {
      groups,
      groups: { groupsList },
      localize } = this.props;

    let filterOptions: IOption[] = [];

    if (!isNilOrError(groups) && !isNilOrError(groupsList)) {
      filterOptions = groupsList.map((group) => (
        {
          value: group.id,
          label: localize(group.attributes.title_multiloc)
        }
      ));
    }

    filterOptions = [{ value: '', label: 'All' }, ...filterOptions];
    return filterOptions;
  }

  render() {
    const { resolution, currentGroupFilter, endAtMoment, startAtMoment } = this.state;
    const startAt = startAtMoment && startAtMoment.toISOString();
    const endAt = endAtMoment && endAtMoment.toISOString();
    const infoMessage = this.props.intl.formatMessage(messages.top10activeUsersDescription);

    return (
      <>
        <ControlBar>
          <TimeControl
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            onChange={this.handleChangeTimeRange}
          />
          <ResolutionControl
            value={resolution}
            onChange={this.changeResolution}
          />
        </ControlBar>

        <ChartFilters
          configuration={{
            showProjectFilter: false,
            showGroupFilter: true,
            showTopicFilter: false
          }}
          filters={{
            currentGroupFilter,
            currentProjectFilter: null,
            currentTopicFilter: null
          }}
          filterOptions={{
            projectFilterOptions: null,
            groupFilterOptions: this.generateGroupFilterOptions(),
            topicFilterOptions: null,
          }}
          onFilter={{
            onProjectFilter: null,
            onGroupFilter: this.handleOnGroupFilter,
            onTopicFilter: null,
          }}
        />

        <ThemeProvider theme={chartTheme}>
          <GraphsContainer>
            <Row>
              <UsersByGenderChart
                className="first halfWidth"
                graphUnit="Users"
                graphTitleMessageKey="usersByGenderTitle"
                stream={usersByGenderStream}
                startAt={startAt}
                endAt={endAt}
                currentGroupFilter={currentGroupFilter}
              />
              <AgeChart
                className="halfWidth"
                startAt={startAt}
                endAt={endAt}
                currentGroupFilter={currentGroupFilter}
              />
            </Row>
            <RegistrationFieldsToGraphs
              startAt={startAt}
              endAt={endAt}
              currentGroupFilter={currentGroupFilter}
            />
            <Row>
              <MostActiveUsersChart
                currentGroupFilter={currentGroupFilter}
                startAt={startAt}
                endAt={endAt}
                infoMessage={infoMessage}
                className="halfWidth dynamicHeight"
              />
            </Row>
          </GraphsContainer>
        </ThemeProvider>
      </>
    );
  }
}

const Data = adopt<DataProps, {}>({
  groups: <GetGroups />
});

const UsersDashBoardWithHOCs = injectIntl(injectTracks<Props>({
  trackFilterOnGroup: tracks.filteredOnGroup,
})(localize<Props & Tracks>(UsersDashboard)));

export default () => (
  <Data>
    {dataProps => <UsersDashBoardWithHOCs {...dataProps} />}
  </Data>
);
