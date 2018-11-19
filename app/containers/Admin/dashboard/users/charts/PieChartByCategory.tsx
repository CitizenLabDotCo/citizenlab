import React from 'react';
import { isEmpty } from 'lodash-es';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { withTheme } from 'styled-components';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { NoDataContainer, GraphCardHeader, GraphCardTitle, GraphCard, GraphCardInner } from '../..';
import GetSerieFromStream from 'resources/GetSerieFromStream';
import { IStreamParams, IStream } from 'utils/streams';
import { IUsersByBirthyear, IUsersByRegistrationField } from 'services/stats';
import messages from '../../messages';
import { rgba } from 'polished';
import { colors } from 'utils/styleUtils';

export type IGraphFormat = {
  name: string | number,
  value: number,
  code: string
}[] | null;

interface DataProps {
  serie: IGraphFormat;
}
const labelColors = [
  '#5D99C6 ',
  '#C37281 ',
  '#B0CDC4 ',
  '#B0CDC4 ',
  '#B0CDC4 ',
  '#C0C2CE',
];

interface InputProps {
  stream: (streamParams?: IStreamParams | null, customId?: string) => IStream<IUsersByBirthyear | IUsersByRegistrationField>;
  convertToGraphFormat: (IUsersByBirthyear) => IGraphFormat;
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | null;
  graphTitleString: string;
  graphUnit: 'ActiveUsers' | 'Users' | 'Ideas' | 'Comments' | 'Votes';
  className?: string;
  customId?: string;
}

interface Props extends InputProps, DataProps { }

class PieChartByCategory extends React.PureComponent<Props & InjectedIntlProps> {
  render() {
    const { colorMain } = this.props['theme'];
    const { className, graphTitleString, serie } = this.props;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              {graphTitleString}
            </GraphCardTitle>
          </GraphCardHeader>
          {!serie ?
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
            :
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  isAnimationActive={true}
                  animationDuration={200}
                  data={serie}
                  dataKey="value"
                  innerRadius={60}
                  fill={colorMain}
                  label={{ fill: colors.adminTextColor, fontSize: '14px' }}
                >
                  {serie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={labelColors[index]} />
                  ))}
                </Pie>
                <Tooltip isAnimationActive={false} />
              </PieChart>
            </ResponsiveContainer>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const PieChartByCategoryWithHoCs = injectIntl<Props>(withTheme(PieChartByCategory as any) as any);

export default (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {serie => <PieChartByCategoryWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);
