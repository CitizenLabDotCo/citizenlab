import React, { Component } from 'react';
import { Subscription } from 'rxjs';
import isEqual from 'lodash/isEqual';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';
import { votesByGenderStream, IVotesByGender } from 'services/stats';
import { colors } from 'utils/styleUtils';

type Props = {
  ideaIds: string[];
  normalization: 'absolute' | 'relative';
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
    if (!isEqual(this.props.ideaIds, prevProps.ideaIds) || !isEqual(this.props.normalization, prevProps.normalization)) {
      this.resubscribe();
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat = (votesByGender: IVotesByGender) => {
    return ['male', 'female', 'unspecified', '_blank'].map((gender) => ({
      gender,
      label: gender,
      upvotes: (votesByGender.up[gender] || 0),
      downvotes: (-votesByGender.down[gender] || 0),
      sum: votesByGender.up[gender] - votesByGender.down[gender] || 0,
    }));
  }

  resubscribe() {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = votesByGenderStream({
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

export default GenderChart;
