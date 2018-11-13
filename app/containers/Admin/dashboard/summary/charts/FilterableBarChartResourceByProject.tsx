// libraries
import React, { PureComponent } from 'react';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { map, sortBy, isEmpty } from 'lodash-es';

// components
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { GraphCard, NoDataContainer, GraphCardInner, GraphCardHeaderWithFilter } from '../..';
import Select from 'components/UI/Select';

// styling
import styled, { withTheme } from 'styled-components';
import { media } from 'utils/styleUtils';

// resources
import {
  ideasByProjectStream,
  IIdeasByProject,
  commentsByProjectStream,
  ICommentsByProject,
  votesByProjectStream,
  IVotesByProject
} from 'services/stats';

// intl
import localize, { InjectedLocalized } from 'utils/localize';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// typings
import { IOption } from 'typings';
import { IResource } from '..';

const SSelect = styled(Select)`
  flex: 1;

  ${media.smallerThan1280px`
    width: 100%;
  `}
`;

const GraphCardTitle = styled.h3`
  margin: 0;
  margin-right: 15px;

  ${media.smallerThan1280px`
    margin-bottom: 15px;
  `}
`;

interface Props {
  className: string;
  onResourceByProjectChange: (option: IOption) => void;
  currentResourceByProject: IResource;
  resourceOptions: IOption[];
  startAt: string;
  endAt: string;
  currentProjectFilter: string | null;
  currentGroupFilter: string | null;
  currentTopicFilter: string | null;
  selectedResource: IResource;
}

type IGraphFormat = {
  name: any,
  value: any,
  code: any
}[];

interface State {
  serie: IGraphFormat | null;
}

class FilterableBarChartResourceByProject extends PureComponent<Props & InjectedLocalized & InjectedIntlProps, State> {
  startAt$: BehaviorSubject<string | null>;
  endAt$: BehaviorSubject<string | null>;
  currentGroupFilter$: BehaviorSubject<string | null>;
  currentTopicFilter$: BehaviorSubject<string | null>;
  currentProjectFilter$: BehaviorSubject<string | null>;
  selectedResource$: BehaviorSubject<IResource | null>;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      serie: null,
    };
    this.subscriptions = [];
    this.startAt$ = new BehaviorSubject(null);
    this.endAt$ = new BehaviorSubject(null);
    this.selectedResource$ = new BehaviorSubject(null);
    this.currentGroupFilter$ = new BehaviorSubject(null);
    this.currentTopicFilter$ = new BehaviorSubject(null);
    this.currentProjectFilter$ = new BehaviorSubject(null);
  }

  componentDidMount() {
    this.startAt$.next(this.props.startAt);
    this.endAt$.next(this.props.endAt);
    this.selectedResource$.next(this.props.selectedResource);
    this.currentGroupFilter$.next(this.props.currentGroupFilter);
    this.currentTopicFilter$.next(this.props.currentTopicFilter);
    this.currentProjectFilter$.next(this.props.currentProjectFilter);

    this.subscriptions = [
      combineLatest(
        this.startAt$.pipe(
          filter(startAt => startAt !== null)
        ),
        this.endAt$.pipe(
          filter(endAt => endAt !== null)
        ),
        this.selectedResource$.pipe(
          filter(endAt => endAt !== null)
        ),
        this.currentGroupFilter$,
        this.currentProjectFilter$,
        this.currentTopicFilter$
      ).pipe(
        switchMap(([startAt, endAt, selectedResource, currentGroupFilter, currentTopicFilter]) => {
          const queryParameters = {
            startAt,
            endAt,
            group: currentGroupFilter,
            topic: currentTopicFilter,
          };
          if (selectedResource === 'Ideas') {
            return ideasByProjectStream({
              queryParameters
            }).observable;
          } else if (selectedResource === 'Comments') {
            return commentsByProjectStream({
              queryParameters
            }).observable;
          } else {
            return votesByProjectStream({
              queryParameters
            }).observable;
          }
        })
      ).subscribe((serie) => {
        const convertedSerie = this.convertToGraphFormat(serie);
        if (this.props.currentProjectFilter) {
          this.setState({ serie: this.filterByProject(convertedSerie) });
        } else { this.setState({ serie: convertedSerie }); }
      })
    ];
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.startAt !== prevProps.startAt) {
      this.startAt$.next(this.props.startAt);
    }

    if (this.props.endAt !== prevProps.endAt) {
      this.endAt$.next(this.props.endAt);
    }
    if (this.props.currentGroupFilter !== prevProps.currentGroupFilter) {
      this.currentGroupFilter$.next(this.props.currentGroupFilter);
    }

    if (this.props.currentTopicFilter !== prevProps.currentTopicFilter) {
      this.currentTopicFilter$.next(this.props.currentTopicFilter);
    }
    if (this.props.currentProjectFilter !== prevProps.currentProjectFilter) {
      this.currentProjectFilter$.next(this.props.currentProjectFilter);
    }

    if (this.props.selectedResource !== prevProps.selectedResource) {
      this.selectedResource$.next(this.props.selectedResource);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  convertToGraphFormat = (serie: IIdeasByProject | IVotesByProject | ICommentsByProject) => {
    if (serie) {
      const { data, projects } = serie;
      const { localize } = this.props;

      const mapped = map(data, (count: number, projectId: string) => ({
        name: localize(projects[projectId].title_multiloc),
        value: count,
        code: projectId,
      }));
      return sortBy(mapped, 'name');
    }

    return null;
  }

  filterByProject = (serie: IGraphFormat | null) => {
    if (serie) {
      const { currentProjectFilter } = this.props;
      const selectedProject = serie.find(item => item.code === currentProjectFilter);
      const selectedProjectCount = selectedProject ? selectedProject.value : 0;
      const filteredSerie = serie.map(item => {
        const { value, ...rest } = item;
        return { value: value - selectedProjectCount, ...rest };
      }).filter(item => item.code !== currentProjectFilter);
      filteredSerie.unshift({
        name: selectedProject ? selectedProject.name : 'selected project',
        value: 0,
        code: currentProjectFilter,
      });
      return filteredSerie;
    }

    return null;
  }

  render() {
    const theme = this.props['theme'];
    const { serie } = this.state;
    const {
      className,
      onResourceByProjectChange,
      currentResourceByProject,
      resourceOptions,
      selectedResource,
      intl: {
        formatMessage
      },
      currentProjectFilter
    } = this.props;
    const noData = (serie && serie.every(item => isEmpty(item))) || false;
    const unitName = currentProjectFilter && serie
      ? formatMessage(messages.resourceByProjectDifference, {
        resourceName: formatMessage(messages[selectedResource]),
        project: serie[0].name
      })
      : formatMessage(messages[selectedResource]);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeaderWithFilter>
            <GraphCardTitle>
              <FormattedMessage {...messages.participationPerProject} />

            </GraphCardTitle>
            <SSelect
              id="projectFilter"
              onChange={onResourceByProjectChange}
              value={currentResourceByProject}
              options={resourceOptions}
              clearable={false}
              borderColor="#EAEAEA"
            />
          </GraphCardHeaderWithFilter>
          {noData ?
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
            :
            <ResponsiveContainer width="100%" height={serie && (serie.length * 50)}>
              <BarChart data={serie} layout="vertical">
                <Bar
                  dataKey="value"
                  name={unitName}
                  fill={theme.chartFill}
                  label={{ fill: theme.barFill, fontSize: theme.chartLabelSize }}
                  barSize={20}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  stroke={theme.chartLabelColor}
                  fontSize={theme.chartLabelSize}
                  tickLine={false}
                />
                <XAxis
                  stroke={theme.chartLabelColor}
                  fontSize={theme.chartLabelSize}
                  type="number"
                  tick={{ transform: 'translate(0, 7)' }}
                />
                <Tooltip isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default localize<Props>(injectIntl<Props & InjectedLocalized>(withTheme(FilterableBarChartResourceByProject as any) as any));
