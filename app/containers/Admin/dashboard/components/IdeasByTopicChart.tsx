import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { withTheme } from 'styled-components';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { injectTFunc } from 'components/T/utils';
import { ideasByTopicStream } from 'services/stats';



type State = {
  serie: {name: string | number, value: number, code: string}[] | null;
};

type Props = {
  startAt: string,
  endAt: string,
  theme: any,
  tFunc: ({}) => string,
};

class IdeasByTimeChart extends React.PureComponent<Props, State> {

  serieObservable: Rx.Subscription;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null,
    };
  }

  componentDidMount() {
    this.resubscribe();
  }

  componentWillUpdate(nextProps) {
    if (nextProps.startAt !== this.props.startAt ||
      nextProps.endAt !== this.props.endAt) {
      this.resubscribe(nextProps.startAt, nextProps.endAt);
    }
  }

  convertToGraphFormat = (serie) => {
    const { data, topics } = serie;
    return _.chain(data)
      .map((count, topicId) => ({
        name: this.props.tFunc(topics[topicId].title_multiloc),
        value: count,
        code: topicId,
      }))
      .sortBy('name')
      .value();
  }

  resubscribe(startAt= this.props.startAt, endAt= this.props.endAt) {
    if (this.serieObservable) this.serieObservable.unsubscribe();

    this.serieObservable = ideasByTopicStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
      },
    }).observable.subscribe((serie) => {
      const convertedSerie = this.convertToGraphFormat(serie) as any;
      this.setState({ serie: convertedSerie });
    });
  }


  render() {
    return (
      <ResponsiveContainer width="100%" height={this.state.serie && (this.state.serie.length * 30)}>
        <BarChart data={this.state.serie} layout="vertical">
          <Bar
            dataKey="value"
            name="name"
            fill={this.props.theme.chartFill}
            label={{ fill: this.props.theme.chartLabelColor, fontSize: 12 }}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            stroke={this.props.theme.chartLabelColor}
            fontSize={this.props.theme.chartLabelColor}
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
