import React, { Component } from 'react';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { isEqual, forOwn, get } from 'lodash';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';
import { votesByBirthyearStream, IVotesByBirthyear } from 'services/stats';
import { colors } from 'utils/styleUtils';

type Props = {
  ideaIds: string[];
  normalization: 'absolute' | 'relative';
};

type State = {
  serie: any;
};

class AgeChart extends Component<Props, State> {

  subscription: Subscription;

  constructor(props) {
    super(props);
    this.state = {
      serie: null,
    };
  }

  componentDidMount() {
    this.resubscribe();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.ideaIds, prevProps.ideaIds) || !isEqual(this.props.normalization, prevProps.normalization)) {
      this.resubscribe();
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat = (serie: IVotesByBirthyear) => {
    const currentYear = moment().year();
    return [
      ...[[0,20],[20,30],[30,40],[40,50],[50,60],[60,100]].map(([minAge, maxAge]) => {
        const votes = { up: 0, down: 0, total: 0 };
        ['up','down','total'].forEach((mode) => {
          forOwn(serie[mode], (voteCount, birthYear) => {
            const age = currentYear - parseInt(birthYear, 10);

            if (age >= minAge && age < maxAge) {
              votes[mode] += voteCount;
            }
          });

        });
        return {
          label: `${minAge}-${maxAge}`,
          upvotes: votes.up,
          downvotes: -votes.down,
          sum: votes.total,
        };
      }),
      {
        label: '_blank',
        upvotes: get(serie, 'up._blank', 0),
        downvotes: -get(serie, 'down._blank', 0),
        sum: get(serie, 'total._blank', 0),
      }
    ];
  }

  resubscribe() {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = votesByBirthyearStream({
      queryParameters: {
        ideas: this.props.ideaIds,
        normalization: this.props.normalization,
      },
    }).observable.subscribe((serie) => {
      this.setState({ serie: this.convertToGraphFormat(serie) });
    });
  }

  render() {
    const { serie } = this.state;
    if (!serie) return null;
    return (
      <div>
        <BarChart
          width={400}
          height={250}
          data={this.state.serie}
          stackOffset="sign"
        >
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="upvotes" fill={colors.success} stackId="votes" maxBarSize={20} />
          <Bar dataKey="downvotes" fill={colors.error} stackId="votes" maxBarSize={20} />
          {/* <Bar dataKey="sum" fill="grey" stackId="total" maxBarSize={20} /> */}
        </BarChart>
      </div>
    );
  }
}

export default AgeChart;
