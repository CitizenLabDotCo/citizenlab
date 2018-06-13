import React, { Component } from 'react';
import { Subscription } from 'rxjs';
import { isEqual, isEmpty } from 'lodash';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { votesByGenderStream, IVotesByGender } from 'services/stats';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { withTheme } from 'styled-components';

type Props = {
  ideaIdsComparisons: string[][];
  normalization: 'absolute' | 'relative';
  theme: any;
};

type State = {
  series: any[];
};

class GenderChart extends Component<Props, State> {

  subscription: Subscription;

  constructor(props) {
    super(props);
    this.state = {
      series: [],
    };
  }

  componentDidMount() {
    this.resubscribe();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.ideaIdsComparisons, prevProps.ideaIdsComparisons) || !isEqual(this.props.normalization, prevProps.normalization)) {
      this.resubscribe();
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat = (series: IVotesByGender[]) => {
    return ['male', 'female', 'unspecified', '_blank'].map((gender) => {
      const record = {
        gender,
        label: gender,
      };
      series.forEach((serie, index) => {
        record[`up ${index + 1}`] = serie.up[gender] || 0;
        record[`down ${index + 1}`] = -serie.down[gender] || 0;
        record[`sum ${index + 1}`] = serie.up[gender] - serie.down[gender] || 0;
      });
      return record;
    });
  }

  resubscribe() {
    if (this.subscription) this.subscription.unsubscribe();
    this.subscription = combineLatest(
      this.props.ideaIdsComparisons.map((ideaIds) => (
        votesByGenderStream({
          queryParameters: { ideas: ideaIds, normalization: this.props.normalization }}
        ).observable
      ))
    ).subscribe((series) => {
      this.setState({ series: this.convertToGraphFormat(series) });
    });
  }

  render() {
    const { series } = this.state;
    const { ideaIdsComparisons, theme } = this.props;
    if (isEmpty(series)) return null;

    return (
      <div>
        <BarChart
          width={400}
          height={250}
          data={series}
          stackOffset="sign"
        >
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <ReferenceLine y={0} stroke="#000" />
          {ideaIdsComparisons.length > 1 && ideaIdsComparisons.map((_, index) => (
            <Bar dataKey={`up ${index + 1}`} fill={theme.comparisonColors[index]} stackId={`votes ${index}`} maxBarSize={20} />
          ))}
          {ideaIdsComparisons.length > 1 && ideaIdsComparisons.map((_, index) => (
            <Bar dataKey={`down ${index + 1}`} fill={theme.comparisonColors[index]} stackId={`votes ${index}`} maxBarSize={20} />
          ))}
          {ideaIdsComparisons.length === 1 &&
            <Bar dataKey="up 1" fill={theme.upvotes} stackId="votes 1" maxBarSize={20} />}
          {ideaIdsComparisons.length === 1 &&
            <Bar dataKey="down 1" fill={theme.downvotes} stackId="votes 1" maxBarSize={20} />}

        </BarChart>
      </div>
    );
  }
}

export default withTheme(GenderChart);
