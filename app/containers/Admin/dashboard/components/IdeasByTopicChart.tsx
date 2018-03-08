import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { withTheme } from 'styled-components';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import localize, { injectedLocalized } from 'utils/localize';
import { ideasByTopicStream } from 'services/stats';

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

class IdeasByTimeChart extends React.PureComponent<Props & injectedLocalized, State> {
  startAt$: Rx.BehaviorSubject<string | null>;
  endAt$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null,
    };
    this.subscriptions = [];
    this.startAt$ = new Rx.BehaviorSubject(null);
    this.endAt$ = new Rx.BehaviorSubject(null);
  }

  componentDidMount() {
    this.startAt$.next(this.props.startAt);
    this.endAt$.next(this.props.endAt);

    this.subscriptions = [
      Rx.Observable.combineLatest(
        this.startAt$.filter(startAt => startAt !== null),
        this.endAt$.filter(endAt => endAt !== null),
      ).switchMap(([startAt, endAt]) => {
        return ideasByTopicStream({
          queryParameters: {
            start_at: startAt,
            end_at: endAt,
          },
        }).observable;
      }).subscribe((serie) => {
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

  convertToGraphFormat = (serie) => {
    if (serie) {
      const { data, topics } = serie;
      const { localize } = this.props;

      return _(data).map((count, topicId) => ({
        name: localize(topics[topicId].title_multiloc),
        value: count,
        code: topicId,
      }))
      .sortBy('name')
      .value();
    }

    return null;
  }

  render() {
    const theme = this.props['theme'];

    return (
      <ResponsiveContainer width="100%" height={this.state.serie && (this.state.serie.length * 50)}>
        <BarChart data={this.state.serie} layout="vertical">
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

export default localize<Props>(withTheme(IdeasByTimeChart as any));
