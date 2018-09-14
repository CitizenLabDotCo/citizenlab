import React from 'react';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { map, sortBy } from 'lodash-es';
import { withTheme } from 'styled-components';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import localize, { InjectedLocalized } from 'utils/localize';
import { ideasByTopicStream, IIdeasByTopic } from 'services/stats';

type State = {
  serie: {
    name: any,
    value: any,
    code: any
  }[] | null;
};

type Props = {
  startAt: string,
  endAt: string
};

class IdeasByTimeChart extends React.PureComponent<Props & InjectedLocalized, State> {
  startAt$: BehaviorSubject<string | null>;
  endAt$: BehaviorSubject<string | null>;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null,
    };
    this.subscriptions = [];
    this.startAt$ = new BehaviorSubject(null);
    this.endAt$ = new BehaviorSubject(null);
  }

  componentDidMount() {
    this.startAt$.next(this.props.startAt);
    this.endAt$.next(this.props.endAt);

    this.subscriptions = [
      combineLatest(
        this.startAt$.pipe(
          filter(startAt => startAt !== null)
        ),
        this.endAt$.pipe(
          filter(endAt => endAt !== null)
        )
      ).pipe(
        switchMap(([startAt, endAt]) => {
          return ideasByTopicStream({
            queryParameters: {
              start_at: startAt,
              end_at: endAt,
            },
          }).observable;
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
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  convertToGraphFormat = (serie: IIdeasByTopic) => {
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

export default withTheme(localize(IdeasByTimeChart));
