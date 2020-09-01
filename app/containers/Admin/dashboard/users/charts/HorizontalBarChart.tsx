// libraries
import React from 'react';
import { isEmpty } from 'lodash-es';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import { withTheme } from 'styled-components';

// components
import ExportMenu from '../../components/ExportMenu';
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  IGraphUnit,
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from '../..';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// types
import { IStreamParams, IStream } from 'utils/streams';
import {
  IUsersByBirthyear,
  IUsersByRegistrationField,
  IUsersByDomicile,
} from 'services/stats';
import { IGraphFormat } from 'typings';

interface DataProps {
  serie: IGraphFormat;
}

type ISupportedDataType =
  | IUsersByBirthyear
  | IUsersByRegistrationField
  | IUsersByDomicile;

interface InputProps {
  stream: (
    streamParams?: IStreamParams | null,
    customId?: string
  ) => IStream<ISupportedDataType>;
  convertToGraphFormat: (data: ISupportedDataType) => IGraphFormat | null;
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId?: string;
  xlsxEndpoint: string;
}

interface Props extends InputProps, DataProps {}

export class HorizontalBarChart extends React.PureComponent<
  Props & InjectedIntlProps
> {
  currentChart: React.RefObject<any>;
  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }
  render() {
    const {
      chartFill,
      barFill,
      chartLabelSize,
      chartLabelColor,
      barHoverColor,
      animationBegin,
      animationDuration,
    } = this.props['theme'];
    const {
      currentGroupFilterLabel,
      currentGroupFilter,
      xlsxEndpoint,
      className,
      graphTitleString,
      serie,
      intl: { formatMessage },
      graphUnit,
    } = this.props;

    const noData =
      !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

    const unitName = formatMessage(messages[graphUnit]);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>{graphTitleString}</GraphCardTitle>
            {!noData && (
              <ExportMenu
                name={graphTitleString}
                svgNode={this.currentChart}
                xlsxEndpoint={xlsxEndpoint}
                currentGroupFilterLabel={currentGroupFilterLabel}
                currentGroupFilter={currentGroupFilter}
              />
            )}
          </GraphCardHeader>
          {noData ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <ResponsiveContainer
              height={serie.length > 1 ? serie.length * 50 : 100}
            >
              <BarChart data={serie} layout="vertical" ref={this.currentChart}>
                <Bar
                  dataKey="value"
                  name={unitName}
                  fill={chartFill}
                  label={{ fill: barFill, fontSize: chartLabelSize }}
                  barSize={20}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tickLine={false}
                />
                <XAxis
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  type="number"
                  tick={{ transform: 'translate(0, 7)' }}
                />
                <Tooltip
                  isAnimationActive={false}
                  cursor={{ fill: barHoverColor }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const HorizontalBarChartWithHoCs = injectIntl<Props>(
  withTheme(HorizontalBarChart as any) as any
);

const WrappedHorizontalBarChart = (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <HorizontalBarChartWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);

export default WrappedHorizontalBarChart;
