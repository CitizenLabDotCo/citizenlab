import React, { PureComponent } from 'react';
import { map, sortBy, isEmpty } from 'lodash-es';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';

// resources
import GetParticipationByX from './GetParticipationByX';
import {
  IIdeasByTopic,
  ICommentsByTopic,
  IVotesByTopic
} from 'services/stats';

// i18n
import messages from '../../messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';

// components
import { GraphCard, NoDataContainer, GraphCardInner, GraphCardHeaderWithFilter } from '../..';
import Select from 'components/UI/Select';

// typings
import { IResource } from '..';
import { IGraphFormat, IOption } from 'typings';

// styling
import { media } from 'utils/styleUtils';
import { rgba } from 'polished';
import styled, { withTheme } from 'styled-components';

const SSelect = styled(Select)`
  flex: 1;

  ${media.smallerThan1280px`
    width: 100%;
  `}
`;

const GraphCardTitle = styled.h3`
  margin: 0;
  margin-right: 15px;

  ${media.smallerThan1280px`
    margin-bottom: 15px;
  `}
`;
interface DataProps {
  serie: IVotesByTopic | ICommentsByTopic | IIdeasByTopic;
}

interface InputProps {
  className: string;
  onResourceByTopicChange: (option: IOption) => void;
  currentResourceByTopic: IResource;
  resourceOptions: IOption[];
  startAt: string | null | undefined;
  endAt: string | null;
  currentProjectFilter: string | null;
  currentGroupFilter: string | null;
  currentTopicFilter: string | null;
  topicOptions: IOption[];
  selectedResource: IResource;
}

interface Props extends InputProps, DataProps { }

interface State {
  serie: IGraphFormat | null;
  totalCount: number | null;
  topicName: string | null;
}

interface PropsWithHoCs extends Props, InjectedIntlProps, InjectedLocalized { }

class FilterableBarChartResourceByTopic extends PureComponent<PropsWithHoCs, State> {
  constructor(props) {
    super(props);
    this.state = {
      serie: null,
      totalCount: null,
      topicName: null,
    };
  }

  componentDidMount() {
    this.setConvertedSerieToState();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.serie !== this.props.serie
      || this.props.currentTopicFilter !== prevProps.currentTopicFilter) {
      if (!this.props.currentTopicFilter) { this.setState({ topicName: null, totalCount: null }); }
      this.setConvertedSerieToState();
    }
  }

  setConvertedSerieToState() {
    const convertedSerie = this.convertToGraphFormat(this.props.serie);
    if (this.props.currentTopicFilter) {
      this.setState({ serie: this.filterByTopic(convertedSerie) });
    } else { this.setState({ serie: convertedSerie }); }
  }

  convertToGraphFormat = (serie: IIdeasByTopic | IVotesByTopic | ICommentsByTopic) => {
    if (serie) {
      const { data, topics } = serie;
      const { localize } = this.props;

      const mapped = map(data, (count: number, topicId: string) => ({
        name: localize(topics[topicId].title_multiloc),
        value: count,
        code: topicId,
      }));
      return sortBy(mapped, 'name');
    }

    return null;
  }

  filterByTopic = (serie: IGraphFormat | null) => {
    if (serie) {
      const { currentTopicFilter, topicOptions, intl: { formatMessage } } = this.props;
      const selectedTopic = serie.find(item => item.code === currentTopicFilter);
      const selectedTopicCount = selectedTopic ? selectedTopic.value : 0;
      this.setState({ totalCount: selectedTopicCount });
      const filteredSerie = serie.map(item => {
        const { value, ...rest } = item;
        return { value: value - selectedTopicCount, ...rest };
      }).filter(item => item.code !== currentTopicFilter);
      if (selectedTopic) {
        this.setState({ topicName: selectedTopic.name });
      } else {
        const foundOption = topicOptions.find(option => option.value === currentTopicFilter);
        this.setState({ topicName: foundOption ? foundOption.label : formatMessage(messages.selectedTopic) });
      }
      return filteredSerie;
    }

    return null;
  }

  render() {
    const theme = this.props['theme'];
    const { serie, totalCount, topicName } = this.state;
    const { chartFill } = theme;
    const {
      className,
      onResourceByTopicChange,
      currentResourceByTopic,
      resourceOptions,
      selectedResource,
      intl: {
        formatMessage
      },
      currentTopicFilter,

    } = this.props;
    const selectedResourceName = formatMessage(messages[selectedResource]);
    const noData = (serie && (serie.every(item => isEmpty(item)) || serie.length <= 0)) || false;
    const unitName = (currentTopicFilter && serie && !noData)
      ? formatMessage(messages.resourceByTopicDifference, {
        resourceName: selectedResourceName,
        topic: topicName
      })
      : selectedResourceName;
    const barHoverColor = rgba(chartFill, .25);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeaderWithFilter>
            <GraphCardTitle>
              <FormattedMessage {...messages.participationPerTopic} />
            </GraphCardTitle>
            <SSelect
              id="topicFilter"
              onChange={onResourceByTopicChange}
              value={currentResourceByTopic}
              options={resourceOptions}
              clearable={false}
              borderColor="#EAEAEA"
            />
          </GraphCardHeaderWithFilter>
          {noData ?
            <NoDataContainer>
              {currentTopicFilter ?
                <FormattedMessage {...messages.totalCountTopic} values={{ totalCount, topicName, selectedResourceName }} />
                : <FormattedMessage {...messages.noData} />}
            </NoDataContainer>
            :
            <>
              {currentTopicFilter && <FormattedMessage tagName="p" {...messages.totalCountTopic} values={{ totalCount, topicName, selectedResourceName }} />}
              <ResponsiveContainer width="100%" height={serie && (serie.length * 50)}>
                <BarChart data={serie} layout="vertical">
                  <Bar
                    dataKey="value"
                    name={unitName}
                    fill={theme.chartFill}
                    label={{ fill: theme.barFill, fontSize: theme.chartLabelSize }}
                    barSize={20}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    stroke={theme.chartLabelColor}
                    fontSize={theme.chartLabelSize}
                    tickLine={false}
                  />
                  <XAxis
                    stroke={theme.chartLabelColor}
                    fontSize={theme.chartLabelSize}
                    type="number"
                    tick={{ transform: 'translate(0, 7)' }}
                  />
                  <Tooltip
                    isAnimationActive={false}
                    cursor={{ fill: barHoverColor }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const BarChartWithHocs = localize<Props>(injectIntl<Props & InjectedLocalized>(withTheme(FilterableBarChartResourceByTopic as any) as any));
export default (inputProps: InputProps) => (
  <GetParticipationByX {...inputProps} type="ByTopic">
    {serie => <BarChartWithHocs {...serie} {...inputProps} />}
  </GetParticipationByX>
);
