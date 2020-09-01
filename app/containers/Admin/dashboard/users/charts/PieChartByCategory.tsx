// libraries
import React from 'react';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import { withTheme } from 'styled-components';

// components
import {
  IGraphUnit,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
  PieChartStyleFixesDiv,
} from '../..';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import { IUsersByBirthyear, IUsersByRegistrationField } from 'services/stats';
import { IGraphFormat } from 'typings';

interface DataProps {
  serie: IGraphFormat;
}

type ISupportedDataType = IUsersByBirthyear | IUsersByRegistrationField;

interface InputProps {
  stream: (
    streamParams?: IStreamParams | null,
    customId?: string
  ) => IStream<ISupportedDataType>;
  convertToGraphFormat: (ISupportedDataType) => IGraphFormat | null;
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId?: string;
}

interface Props extends InputProps, DataProps {}

const labelColors = ['#5D99C6 ', '#C37281 ', '#B0CDC4 ', '#C0C2CE'];

class PieChartByCategory extends React.PureComponent<
  Props & InjectedIntlProps
> {
  render() {
    const {
      colorMain,
      animationBegin,
      animationDuration,
      chartLabelSize,
      chartLabelColor,
    } = this.props['theme'];
    const { className, graphTitleString, serie } = this.props;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>{graphTitleString}</GraphCardTitle>
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
                    isAnimationActive={true}
                    animationDuration={animationDuration}
                    animationBegin={animationBegin}
                    isAnimationActive={false}
                    data={serie}
                    dataKey="value"
                    innerRadius={60}
                    fill={colorMain}
                    label={{ fill: chartLabelColor, fontSize: chartLabelSize }}
                  >
                    {serie.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={labelColors[index]} />
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
