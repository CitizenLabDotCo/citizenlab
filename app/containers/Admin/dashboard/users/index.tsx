// libraries
import React, { PureComponent } from 'react';
import moment from 'moment';
import { ThemeProvider } from 'styled-components';
import { adopt } from 'react-adopt';
import localize, { InjectedLocalized } from 'utils/localize';

// resources
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

// components
import {
  chartTheme,
  GraphsContainer,
  Row,
  GraphCard,
  GraphCardInner,
  GraphCardTitle,
  ControlBar
} from '../';
import TimeControl from '../components/TimeControl';
import IntervalControl from '../components/IntervalControl';
import GenderChart from '../components/GenderChart';
import AgeChart from '../components/AgeChart';
import ChartFilters from '../components/ChartFilters';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { IOption } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface State {
  interval: 'weeks' | 'months' | 'years';
  intervalIndex: number;
  currentGroupFilter: string | null;
}

interface DataProps {
  groups: GetGroupsChildProps;
}

interface Props extends DataProps {}

class UsersDashboard extends PureComponent<Props & InjectedLocalized, State> {
  constructor(props: Props & InjectedLocalized) {
    super(props);
    this.state = {
      interval: 'months',
      intervalIndex: 0,
      currentGroupFilter: null
    };
  }

  changeInterval = (interval: 'weeks' | 'months' | 'years') => {
    this.setState({ interval, intervalIndex: 0 });
  }

  changeIntervalIndex = (intervalIndex: number) => {
    this.setState({ intervalIndex });
  }

  handleOnGroupFilter = (filter) => {
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
    const { interval, intervalIndex, currentGroupFilter } = this.state;
    const startAtMoment = moment().startOf(interval).add(intervalIndex, interval);
    const endAtMoment = moment(startAtMoment).add(1, interval);
    const startAt = startAtMoment.toISOString();
    const endAt = endAtMoment.toISOString();

    return (
      <>
        <ControlBar>
          <TimeControl
            value={intervalIndex}
            interval={interval}
            onChange={this.changeIntervalIndex}
            currentTime={startAtMoment}
          />
          <IntervalControl
            value={interval}
            onChange={this.changeInterval}
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
              <GraphCard className="first halfWidth">
                <GraphCardInner>
                  <GraphCardTitle>
                    <FormattedMessage {...messages.usersByGenderTitle} />
                  </GraphCardTitle>
                  <GenderChart startAt={startAt} endAt={endAt} currentGroupFilter={currentGroupFilter} />
                </GraphCardInner>
              </GraphCard>
              <GraphCard className="halfWidth">
                <GraphCardInner>
                  <GraphCardTitle>
                    <FormattedMessage {...messages.usersByAgeTitle} />
                  </GraphCardTitle>
                  <AgeChart startAt={startAt} endAt={endAt} currentGroupFilter={currentGroupFilter} />
                </GraphCardInner>
              </GraphCard>
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

const UsersDashBoardWithHOCs = localize<Props>(UsersDashboard);

export default () => (
  <Data>
    {dataProps => <UsersDashBoardWithHOCs {...dataProps} />}
  </Data>
);
