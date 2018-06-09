import React, { Component } from 'react';
import { Subscription } from 'rxjs';
import isEqual from 'lodash/isEqual';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';
import { votesByGenderStream, IVotesByGender } from 'services/stats';

type Props = {
  ideaIds: string[];
};

type State = {
  serie: any;
};

class GenderChart extends Component<Props, State> {

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
    if (!isEqual(this.props.ideaIds, prevProps.ideaIds)) {
      this.resubscribe();
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat = (serie: IVotesByGender) => {
    return ['male', 'female', 'unspecified', '_blank'].map((gender) => ({
      label: gender,
      upvotes: serie.up[gender] || 0,
      downvotes: -serie.down[gender] || 0,
      sum: serie.up[gender] - serie.down[gender] || 0,
    }));
  }

  resubscribe() {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = votesByGenderStream({
      queryParameters: {
        ideas: this.props.ideaIds,
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
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          stackOffset="sign"
        >
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="upvotes" fill="green" stackId="votes" maxBarSize={20} />
          <Bar dataKey="downvotes" fill="red" stackId="votes" maxBarSize={20} />
          {/* <Bar dataKey="sum" fill="grey" stackId="total" maxBarSize={20} /> */}
        </BarChart>
      </div>
    );
  }
}

export default GenderChart;
