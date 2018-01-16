import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { withTheme } from 'styled-components';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { injectTFunc } from 'components/T/utils';
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
  endAt: string,
  theme: any,
  tFunc: ({}) => string,
};

class IdeasByTimeChart extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];
  props$: Rx.BehaviorSubject<Props>;

  constructor(props) {
    super(props);
    this.state = {
      serie: null,
    };
    this.subscriptions = [];
    this.props$ = new Rx.BehaviorSubject(null as any);
  }

  componentWillMount() {
    this.props$.next(this.props);

    this.subscriptions = [
      this.props$.filter(props => !_.isNil(props)).switchMap(({ startAt, endAt }) => {
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

  componentWillReceiveProps(nextProps) {
    this.props$.next(nextProps);
  }

  convertToGraphFormat = (serie) => {
    const { data, topics } = serie;
    const { tFunc } = this.props;

    return _(data).map((count, topicId) => ({
      name: tFunc(topics[topicId].title_multiloc),
      value: count,
      code: topicId,
    }))
    .sortBy('name')
    .value();
  }

  render() {
    return (
      <ResponsiveContainer width="100%" height={this.state.serie && (this.state.serie.length * 30)}>
        <BarChart data={this.state.serie} layout="vertical">
          <Bar
            dataKey="value"
            name="name"
            fill={this.props.theme.chartFill}
            label={{ fill: this.props.theme.barFill, fontSize: this.props.theme.chartLabelSize }}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            stroke={this.props.theme.chartLabelColor}
            fontSize={this.props.theme.chartLabelSize}
            tickLine={false}
          />
          <XAxis
            stroke={this.props.theme.chartLabelColor}
            fontSize={this.props.theme.chartLabelSize}
            type="number"
            tick={{ transform: 'translate(0, 7)' }}
          />
          <Tooltip isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}

export default withTheme(injectTFunc(IdeasByTimeChart));
