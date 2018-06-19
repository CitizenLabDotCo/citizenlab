import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import isEqual from 'lodash/isEqual';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { votesByDomicileStream, IVotesByDomicile } from 'services/stats';
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import { isNilOrError } from 'utils/helperUtils';
import localize, { injectedLocalized } from 'utils/localize';
import { isEmpty } from 'lodash';
import { combineLatest } from 'rxjs/observable/combineLatest';
import styled, { withTheme } from 'styled-components';

interface InputProps {
  ideaIdsComparisons: string[][];
  normalization: 'absolute' | 'relative';
}

interface DataProps {
  areas: GetAreasChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {
  series: any[];
}

const Container = styled.div``;

class DomicileChart extends PureComponent<Props & injectedLocalized, State> {

  subscription: Subscription;

  constructor(props: Props & injectedLocalized) {
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

  convertToGraphFormat = (series: IVotesByDomicile[]) => {
    if (!isNilOrError(this.props.areas)) {

      const areaBucketsRecord = this.props.areas.map((area) => {
        const record = {
          label: this.props.localize(area.attributes.title_multiloc),
        };

        series.forEach((serie, serieIndex) => {
          record[`up ${serieIndex + 1}`] = serie.up[area.id] || 0;
          record[`down ${serieIndex + 1}`] = -serie.down[area.id] || 0;
          record[`total ${serieIndex + 1}`] = serie.total[area.id] || 0;
        });

        return record;
      });

      const blankRecord = {
        label: '_blank',
      };
      series.forEach((serie, serieIndex) => {
        blankRecord[`up ${serieIndex + 1}`] = serie.up['_blank'] || 0;
        blankRecord[`down ${serieIndex + 1}`] = -serie.down['_blank'] || 0;
        blankRecord[`total ${serieIndex + 1}`] = serie.total['_blank'] || 0;
      });

      return [...areaBucketsRecord, blankRecord];
    } else {
      return [];
    }
  }

  resubscribe() {
    if (this.subscription) this.subscription.unsubscribe();
    this.subscription = combineLatest(
      this.props.ideaIdsComparisons.map((ideaIds) => (
        votesByDomicileStream({
          queryParameters: { ideas: ideaIds, normalization: this.props.normalization }
        }).observable
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
      <Container className={this.props['className']}>
        <ResponsiveContainer width="100%" aspect={2}>
          <BarChart
            data={series}
            stackOffset="sign"
            margin={{ right: 20, top: 10 }}
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
        </ResponsiveContainer>
      </Container>
    );
  }
}

const DomicileChartWithHOCs = withTheme<Props, State>(localize(DomicileChart));

export default (inputProps: InputProps) => (
  <GetAreas>
    {(areas) => areas ? <DomicileChartWithHOCs {...inputProps} areas={areas} /> : null}
  </GetAreas>
);
