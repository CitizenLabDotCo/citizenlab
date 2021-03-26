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

export class BarChartByCategory extends React.PureComponent<
  Props & InjectedIntlProps
> {
  currentChart: React.RefObject<any>;
  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }
  render() {
    const {
      newBarFill,
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
            <ResponsiveContainer>
              <BarChart
                data={serie}
                margin={{ right: 40 }}
                ref={this.currentChart}
                layout="horizontal"
              >
                <Bar
                  dataKey="value"
                  name={unitName}
                  fill={newBarFill}
                  label={{ fill: barFill, fontSize: chartLabelSize }}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                  isAnimationActive={true}
                />
                <XAxis
                  dataKey="name"
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tick={{ transform: 'translate(0, 7)' }}
                />
                <YAxis stroke={chartLabelColor} fontSize={chartLabelSize} />
                <Tooltip
                  isAnimationActive={false}
                  cursor={{
                    fill: barHoverColor,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const BarChartByCategoryWithHoCs = injectIntl<Props>(
  withTheme(BarChartByCategory as any) as any
);

const WrappedBarChartByCategory = (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <BarChartByCategoryWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);

export default WrappedBarChartByCategory;
