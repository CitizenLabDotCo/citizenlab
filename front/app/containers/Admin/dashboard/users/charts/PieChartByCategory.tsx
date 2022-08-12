// libraries
import React from 'react';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import { withTheme } from 'styled-components';
import { animation, legacyColors } from 'components/admin/Graphs/styling';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import {
  IGraphUnit,
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
  PieChartStyleFixesDiv,
} from 'components/admin/GraphWrappers';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// typings
import { IStreamParams, IStream } from 'utils/streams';

import { IGraphFormat } from 'typings';

interface DataProps {
  serie: IGraphFormat;
}

export interface ISupportedDataTypeMap {}

export type ISupportedDataType =
  ISupportedDataTypeMap[keyof ISupportedDataTypeMap];

interface InputProps {
  stream: (
    streamParams?: IStreamParams | null,
    customId?: string
  ) => IStream<ISupportedDataType>;
  convertToGraphFormat: (ISupportedDataType) => IGraphFormat | null;
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId: string;
  xlsxEndpoint: string;
}

interface Props extends InputProps, DataProps {}

export const piechartColors = [
  legacyColors.pinkRed,
  legacyColors.lightBlue,
  legacyColors.lightGreen,
  legacyColors.grey,
];

class PieChartByCategory extends React.PureComponent<
  Props & InjectedIntlProps
> {
  currentChart: React.RefObject<any>;

  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }

  formatEntry = (entry) => {
    return `${entry.name} : ${entry.value}`;
  };
  render() {
    const { colorMain } = this.props['theme'];
    const {
      startAt,
      endAt,
      className,
      graphTitleString,
      serie,
      xlsxEndpoint,
      currentGroupFilter,
      currentGroupFilterLabel,
    } = this.props;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>{graphTitleString}</GraphCardTitle>
            {serie && (
              <ReportExportMenu
                name={graphTitleString}
                svgNode={this.currentChart}
                xlsxEndpoint={xlsxEndpoint}
                currentGroupFilter={currentGroupFilter}
                currentGroupFilterLabel={currentGroupFilterLabel}
                startAt={startAt}
                endAt={endAt}
              />
            )}
          </GraphCardHeader>
          {!serie ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <PieChartStyleFixesDiv>
              <ResponsiveContainer height={175} width="100%" minWidth={175}>
                <PieChart>
                  <Pie
                    animationDuration={animation.duration}
                    animationBegin={animation.begin}
                    isAnimationActive={true}
                    data={serie}
                    dataKey="value"
                    innerRadius={60}
                    fill={colorMain}
                    label={this.formatEntry}
                    ref={this.currentChart}
                  >
                    {serie.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={piechartColors[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip isAnimationActive={false} />
                </PieChart>
              </ResponsiveContainer>
            </PieChartStyleFixesDiv>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const PieChartByCategoryWithHoCs = injectIntl<Props>(
  withTheme(PieChartByCategory as any) as any
);

const WrappedPieChartByCategory = (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <PieChartByCategoryWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);

export default WrappedPieChartByCategory;
