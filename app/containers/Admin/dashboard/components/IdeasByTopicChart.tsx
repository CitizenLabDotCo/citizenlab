import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import * as moment from 'moment';
import { injectIntl } from 'react-intl';
import { withTheme } from 'styled-components'
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { injectTFunc } from 'utils/containers/t/utils';
import { observeIdeasByTopic } from 'services/stats';



type State = {
  serie: Array<{name: string | number, value: number, code: string}> | null;
};

type Props = {
  startAt: string,
  endAt: string,
  theme: any,
  tFunc: ({}) => string,
}

class IdeasByTimeChart extends React.PureComponent<Props, State> {

  serieObservable: Rx.Subscription;

  constructor() {
    super();
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
    return _.map(data, (count, topicId) => ({
      name: this.props.tFunc(topics[topicId].title_multiloc),
      value: count,
      code: topicId,
    }));
  }

  resubscribe(startAt=this.props.startAt, endAt=this.props.endAt) {
    if (this.serieObservable) this.serieObservable.unsubscribe();

    this.serieObservable = observeIdeasByTopic({
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
      <ResponsiveContainer width="100%" height={this.state.serie && (this.state.serie.length * 26)}>
        <BarChart data={this.state.serie} layout="vertical">
          <Bar
            dataKey="value"
            name="name"
            fill={this.props.theme.chartFill}
            label={{ fill: this.props.theme.chartLabelColor, fontSize: 14 }}
          />
          <YAxis dataKey="name" type="category" width={100}/>
          <XAxis />
          <Tooltip isAnimationActive={false} />

        </BarChart>
      </ResponsiveContainer>
    );
  }
}

export default withTheme(injectTFunc(IdeasByTimeChart));
