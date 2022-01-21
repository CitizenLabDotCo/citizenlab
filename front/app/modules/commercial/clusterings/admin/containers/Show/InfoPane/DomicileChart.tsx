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
  votesByDomicileStream,
  IVotesByDomicile,
} from 'modules/commercial/user_custom_fields/services/stats';

import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import { isNilOrError } from 'utils/helperUtils';
import localize, { InjectedLocalized } from 'utils/localize';
import styled, { withTheme } from 'styled-components';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../../messages';

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

class DomicileChart extends PureComponent<
  Props & InjectedIntlProps & InjectedLocalized,
  State
> {
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

  convertToGraphFormat = (series: IVotesByDomicile[]) => {
    if (!isNilOrError(this.props.areas)) {
      const areaBucketsRecord = this.props.areas.map((area) => {
        const record = {
          label: this.props.localize(area.attributes.title_multiloc),
        };

        series.forEach((serie, serieIndex) => {
          record[`up ${serieIndex + 1}`] = serie.series.up[area.id] || 0;
          record[`down ${serieIndex + 1}`] = -serie.series.down[area.id] || 0;
          record[`total ${serieIndex + 1}`] = serie.series.total[area.id] || 0;
        });

        return record;
      });

      const blankRecord = {
        label: this.props.intl.formatMessage(messages['_blank']),
      };
      series.forEach((serie, serieIndex) => {
        blankRecord[`up ${serieIndex + 1}`] = serie.series.up['_blank'] || 0;
        blankRecord[`down ${serieIndex + 1}`] =
          -serie.series.down['_blank'] || 0;
        blankRecord[`total ${serieIndex + 1}`] =
          serie.series.total['_blank'] || 0;
      });

      return [...areaBucketsRecord, blankRecord];
    } else {
      return [];
    }
  };

  resubscribe() {
    if (this.subscription) this.subscription.unsubscribe();
    this.subscription = combineLatest(
      this.props.ideaIdsComparisons.map(
        (ideaIds) =>
          votesByDomicileStream({
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

const DomicileChartWithHOCs = withTheme(
  localize<Props>(injectIntl<Props & InjectedLocalized>(DomicileChart))
);

export default (inputProps: InputProps) => (
  <GetAreas>
    {(areas) =>
      areas ? <DomicileChartWithHOCs {...inputProps} areas={areas} /> : null
    }
  </GetAreas>
);
