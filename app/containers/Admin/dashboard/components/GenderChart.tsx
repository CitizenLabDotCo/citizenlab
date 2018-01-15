import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { injectIntl } from 'utils/cl-intl';
import { withTheme } from 'styled-components';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { usersByGenderStream } from 'services/stats';
import messages from '../messages';


type State = {
  serie: {name: string, value: number, code: string}[] | null;
};

type Props = {
  startAt: string,
  endAt: string,
  theme: any,
  intl: any,
};

const colors = {
  male: '#5D99C6 ',
  female: '#C37281 ',
  unspecified: '#B0CDC4 ',
  _blank: '#C0C2CE',
};

class GenderChart extends React.PureComponent<Props, State> {

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

  convertToGraphFormat = (serie: {[key: string]: number}) => {
    return _.map(serie, (value, key) => ({
      value,
      name: this.props.intl.formatMessage(messages[key]),
      code: key,
    }));
  }

  resubscribe(startAt= this.props.startAt, endAt= this.props.endAt) {
    if (this.serieObservable) this.serieObservable.unsubscribe();

    this.serieObservable = usersByGenderStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
      },
    }).observable.subscribe((serie) => {
      this.setState({ serie: this.convertToGraphFormat(serie) });
    });
  }


  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            isAnimationActive={true}
            animationDuration={200}
            data={this.state.serie}
            innerRadius={60}
            fill={this.props.theme.colorMain}
            label={{ fill: '#333', fontSize: '14px' }}
          >
            {this.state.serie && this.state.serie.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[entry.code]} />
            ))}
          </Pie>
          <Tooltip isAnimationActive={false} />

        </PieChart>
      </ResponsiveContainer>
    );
  }
}

export default withTheme(injectIntl(GenderChart));
