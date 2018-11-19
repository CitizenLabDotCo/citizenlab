import React, { PureComponent } from 'react';
import { map, sortBy } from 'lodash-es';

import FilterableBarChart from './FilterableBarChart';

// resources
import {
  IIdeasByTopic,
  ideasByTopicStream,
  ICommentsByTopic,
  commentsByTopicStream,
  IVotesByTopic,
  votesByTopicStream
} from 'services/stats';

// i18n
import messages from '../../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';

// typings
import { IResource } from '..';
import { IGraphFormat, IOption } from 'typings';

interface QueryProps {
  startAt: string | null | undefined;
  endAt: string | null;
  currentProjectFilter: string | null;
  currentGroupFilter: string | null;
}

interface InputProps {
  currentTopicFilter: string | null;
  className: string;
  onResourceByTopicChange: (option: IOption) => void;
  currentResourceByTopic: IResource;
  resourceOptions: IOption[];
  topicOptions: IOption[];
}

interface Props extends InputProps, QueryProps { }

interface PropsWithHoCs extends Props, InjectedIntlProps, InjectedLocalized { }

class FilterableBarChartResourceByTopic extends PureComponent<PropsWithHoCs> {
  convertToGraphFormat = (data: IIdeasByTopic | IVotesByTopic | ICommentsByTopic) => {
    const { series, topics } = data;
    const { localize, currentResourceByTopic } = this.props;
    const dataKey = currentResourceByTopic === 'votes' ? 'total' : currentResourceByTopic;

    const mapped = map(series[dataKey], (count: number, topicId: string) => ({
      name: localize(topics[topicId].title_multiloc) as string,
      value: count as number,
      code: topicId as string,
    }));
    const res = sortBy(mapped, 'name');
    return res.length > 0 ? res : null;
  }

  convertSerie = (serie: IGraphFormat | null) => {
    const { currentTopicFilter, currentResourceByTopic, topicOptions, intl: { formatMessage } } = this.props;
    if (serie && currentResourceByTopic) {
      const selectedTopic = serie.find(item => item.code === currentTopicFilter);
      const selectedCount = selectedTopic ? selectedTopic.value : 0;

      let selectedName;
      if (selectedTopic) {
        selectedName = selectedTopic.name;
      } else {
        const foundOption = topicOptions.find(option => option.value === currentTopicFilter);
        selectedName = foundOption ? foundOption.label : formatMessage(messages.selectedTopic);
      }

      const convertedSerie = serie.map(item => {
        const { value, ...rest } = item;
        return { value: value - selectedCount, ...rest };
      }).filter(item => item.code !== currentTopicFilter);

      return { convertedSerie, selectedCount, selectedName };
    }
    return ({ convertedSerie: serie, selectedCount: null, selectedName: null });
  }

  getCurrentStream(currentResourceByTopic) {
    if (currentResourceByTopic === 'ideas') {
      return ideasByTopicStream;
    } else if (currentResourceByTopic === 'comments') {
      return commentsByTopicStream;
    } else {
      return votesByTopicStream;
    }
  }

  render() {
    const { currentResourceByTopic, currentTopicFilter, onResourceByTopicChange } = this.props;
    return (
      <FilterableBarChart
        {...this.props}
        onResourceByXChange={onResourceByTopicChange}
        currentSelectedResource={currentResourceByTopic}
        stream={this.getCurrentStream(currentResourceByTopic)}
        convertToGraphFormat={this.convertToGraphFormat}
        convertSerie={this.convertSerie}
        currentFilter={currentTopicFilter}
        graphTitleMessageKey="participationPerTopic"
      />
    );
  }
}

export default localize<Props>(injectIntl<Props & InjectedLocalized>(FilterableBarChartResourceByTopic as any) as any);
