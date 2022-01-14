import React, { PureComponent } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { isEqual, isEmpty } from 'lodash-es';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import {
  votesByGenderStream,
  IVotesByGender,
} from 'modules/commercial/user_custom_fields/services/stats';

import styled, { withTheme } from 'styled-components';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../../messages';

type Props = {
  ideaIdsComparisons: string[][];
  normalization: 'absolute' | 'relative';
  theme: any;
};

type State = {
  series: any[];
};

const Container = styled.div``;

class GenderChart extends PureComponent<Props & InjectedIntlProps, State> {
  subscription: Subscription;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      series: [],
    };
  }

  componentDidMount() {
    this.resubscribe();
  }

  componentDidUpdate(prevProps) {
    if (
      !isEqual(this.props.ideaIdsComparisons, prevProps.ideaIdsComparisons) ||
      !isEqual(this.props.normalization, prevProps.normalization)
    ) {
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
        label: this.props.intl.formatMessage(messages[gender]),
      };
      series.forEach((serie, index) => {
        record[`up ${index + 1}`] = serie.series.up[gender] || 0;
        record[`down ${index + 1}`] = -serie.series.down[gender] || 0;
        record[`sum ${index + 1}`] =
          serie.series.up[gender] - serie.series.down[gender] || 0;
      });
      return record;
    });
  };

  resubscribe() {
    if (this.subscription) this.subscription.unsubscribe();
    this.subscription = combineLatest(
      this.props.ideaIdsComparisons.map(
        (ideaIds) =>
          votesByGenderStream({
            queryParameters: {
              ideas: ideaIds,
              normalization: this.props.normalization,
            },
          }).observable
      )
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
        <ResponsiveContainer width="100%" aspect={400 / 250}>
          <BarChart
            data={series}
            stackOffset="sign"
            margin={{ right: 20, top: 10 }}
          >
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <ReferenceLine y={0} stroke="#000" />
            {ideaIdsComparisons.length > 1 &&
              ideaIdsComparisons.map((_, index) => (
                <Bar
                  key={`up ${index + 1}`}
                  dataKey={`up ${index + 1}`}
                  fill={theme.comparisonColors[index]}
                  stackId={`votes ${index}`}
                  maxBarSize={theme.barSize}
                />
              ))}
            {ideaIdsComparisons.length > 1 &&
              ideaIdsComparisons.map((_, index) => (
                <Bar
                  key={`down ${index + 1}`}
                  dataKey={`down ${index + 1}`}
                  fill={theme.comparisonColors[index]}
                  stackId={`votes ${index}`}
                  maxBarSize={theme.barSize}
                />
              ))}
            {ideaIdsComparisons.length === 1 && (
              <Bar
                key="up 1"
                dataKey="up 1"
                fill={theme.upvotes}
                stackId="votes 1"
                maxBarSize={theme.barSize}
              />
            )}
            {ideaIdsComparisons.length === 1 && (
              <Bar
                key="down 1"
                dataKey="down 1"
                fill={theme.downvotes}
                stackId="votes 1"
                maxBarSize={theme.barSize}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </Container>
    );
  }
}

export default withTheme(injectIntl(GenderChart));
