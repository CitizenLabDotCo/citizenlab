import React, { PureComponent } from 'react';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { map, sortBy } from 'lodash-es';
import { withTheme } from 'styled-components';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import localize, { InjectedLocalized } from 'utils/localize';
import { ideasByTopicStream, IIdeasByTopic, commentsByTopicStream, ICommentsByTopic, votesByTopicStream, IVotesByTopic } from 'services/stats';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import EmptyGraph from './EmptyGraph';

import { IResource } from '../summary';

interface Props {
  startAt: string;
  endAt: string;
  currentProjectFilter: string;
  currentGroupFilter: string;
  currentTopicFilter: string;
  selectedResource: IResource;
}

interface State {
  serie: {
    name: any,
    value: any,
    code: any
  }[] | null;
}

class ResourceByTopicWithFilterChart extends PureComponent<Props & InjectedLocalized & InjectedIntlProps, State> {
  startAt$: BehaviorSubject<string | null>;
  endAt$: BehaviorSubject<string | null>;
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
  }

  componentDidMount() {
    this.startAt$.next(this.props.startAt);
    this.endAt$.next(this.props.endAt);
    this.selectedResource$.next(this.props.selectedResource);

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
        )
      ).pipe(
        switchMap(([startAt, endAt, selectedResource]) => {
          if (selectedResource === 'ideas') {
          return ideasByTopicStream({
            queryParameters: {
              start_at: startAt,
              end_at: endAt,
            },
          }).observable;
        } else if (selectedResource === 'comments') {
          return commentsByTopicStream({
            queryParameters: {
              start_at: startAt,
              end_at: endAt,
            },
          }).observable;
        } else {
          return votesByTopicStream({
            queryParameters: {
              start_at: startAt,
              end_at: endAt,
            },
          }).observable;
        }
        })
      ).subscribe((serie) => {
        const convertedSerie = this.convertToGraphFormat(serie);
        this.setState({ serie: convertedSerie });
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
    if (this.props.selectedResource !== prevProps.selectedResource) {
      this.selectedResource$.next(this.props.selectedResource);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  convertToGraphFormat = (serie: IIdeasByTopic | IVotesByTopic | ICommentsByTopic) => {
    if (serie) {
      const { data, topics } = serie;
      const { localize } = this.props;

      const mapped = map(data, (count: number, topicId: string) => ({
        name: localize(topics[topicId].title_multiloc),
        value: count,
        code: topicId,
      }));

      return sortBy(mapped, 'name');
    }

    return null;
  }

  render() {
    const theme = this.props['theme'];
    const { serie } = this.state;
    const { selectedResource, intl: { formatMessage } } = this.props;

    return (
      <ResponsiveContainer width="100%" height={serie && (serie.length * 50)}>
        <BarChart data={serie} layout="vertical">
          <Bar
            dataKey="value"
            name="name"
            fill={theme.chartFill}
            label={{ fill: theme.barFill, fontSize: theme.chartLabelSize }}
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
    );
  }
}

export default localize<Props>(injectIntl<Props & InjectedLocalized>(withTheme(ResourceByTopicWithFilterChart as any) as any));
