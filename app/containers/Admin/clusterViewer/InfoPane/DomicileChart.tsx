import React, { Component } from 'react';
import { Subscription } from 'rxjs';
import isEqual from 'lodash/isEqual';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';
import { votesByDomicileStream, IVotesByDomicile } from 'services/stats';
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import { isNilOrError } from 'utils/helperUtils';
import localize, { injectedLocalized } from 'utils/localize';
import { get } from 'lodash';
import { colors } from 'utils/styleUtils';

type Props = {
  ideaIds: string[];
  normalization: 'absolute' | 'relative';
  areas: GetAreasChildProps;
};

type State = {
  serie: any;
};

class DomicileChart extends Component<Props & injectedLocalized, State> {

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

  convertToGraphFormat = (serie: IVotesByDomicile) => {
    if (!isNilOrError(this.props.areas)) {
      return [
        ...this.props.areas.map((area) => ({
          label: this.props.localize(area.attributes.title_multiloc),
          upvotes: serie.up[area.id] || 0,
          downvotes: -serie.down[area.id] || 0,
          sum: serie.total[area.id] - serie.down[area.id] || 0,
        })),
        {
          label: '_blank',
          upvotes: get(serie, 'up._blank', 0),
          downvotes: -get(serie, 'down._blank', 0),
          sum: get(serie, 'total._blank', 0),
        }
      ];
    } else {
      return [];
    }
  }

  resubscribe() {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = votesByDomicileStream({
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

const DomicileChartWithHOCs = localize(DomicileChart);

export default (inputProps) => (
  <GetAreas>
    {(areas) => areas ? <DomicileChartWithHOCs {...inputProps} areas={areas} /> : null}
  </GetAreas>
);
