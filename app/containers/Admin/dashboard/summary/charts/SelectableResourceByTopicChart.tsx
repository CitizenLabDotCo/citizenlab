// libraries
import React, { PureComponent } from 'react';
import { map, sortBy } from 'lodash-es';

// components
import SelectableResourceChart from './SelectableResourceChart';

// i18n
import messages from '../../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';

// typings
import {
  IIdeasByTopic,
  ideasByTopicStream,
  ICommentsByTopic,
  commentsByTopicStream,
  IVotesByTopic,
  votesByTopicStream,
} from 'services/stats';
import { IResource } from '..';
import { IResolution } from '../../';
import { IGraphFormat, IOption } from 'typings';

interface QueryProps {
  startAt: string | null | undefined;
  endAt: string | null;
  currentProjectFilter: string | undefined;
  currentGroupFilter: string | undefined;
}

interface InputProps {
  currentTopicFilter: string | undefined;
  className: string;
  onResourceByTopicChange: (option: IOption) => void;
  currentResourceByTopic: IResource;
  resourceOptions: IOption[];
  topicOptions: IOption[];
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentGroupFilter: string | undefined;
  currentProjectFilterLabel: string | undefined;
  currentGroupFilterLabel: string | undefined;
  currentTopicFilterLabel: string | undefined;
}

interface Props extends InputProps, QueryProps {}

interface PropsWithHoCs extends Props, InjectedIntlProps, InjectedLocalized {}

class SelectableResourceByTopicChart extends PureComponent<PropsWithHoCs> {
  convertToGraphFormat = (
    data: IIdeasByTopic | IVotesByTopic | ICommentsByTopic
  ) => {
    const { series, topics } = data;
    const { localize, currentResourceByTopic } = this.props;
    const dataKey =
      currentResourceByTopic === 'votes' ? 'total' : currentResourceByTopic;

    const mapped = map(series[dataKey], (count: number, topicId: string) => ({
      name: localize(topics[topicId].title_multiloc) as string,
      value: count as number,
      code: topicId as string,
    }));
    const res = sortBy(mapped, 'name');

    return res.length > 0 ? res : null;
  };

  convertSerie = (serie: IGraphFormat | null) => {
    const {
      currentTopicFilter,
      currentResourceByTopic,
      topicOptions,
      intl: { formatMessage },
    } = this.props;

    if (serie && currentResourceByTopic) {
      const selectedTopic = serie.find(
        (item) => item.code === currentTopicFilter
      );
      const selectedCount = selectedTopic ? selectedTopic.value : 0;

      let selectedName;
      if (selectedTopic) {
        selectedName = selectedTopic.name;
      } else {
        const foundOption = topicOptions.find(
          (option) => option.value === currentTopicFilter
        );
        selectedName = foundOption
          ? foundOption.label
          : formatMessage(messages.selectedTopic);
      }

      const convertedSerie = serie
        .filter((item) => item.code !== currentTopicFilter)
        .map((item) => {
          const { value, name, ...rest } = item;
          const shortenedName =
            name.length > 60 ? `${name.substring(0, 61)}...` : name;
          return { value: value - selectedCount, name: shortenedName, ...rest };
        });

      return { convertedSerie, selectedCount, selectedName };
    }

    return { convertedSerie: serie, selectedCount: null, selectedName: null };
  };

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
    const {
      currentResourceByTopic,
      currentTopicFilter,
      onResourceByTopicChange,
    } = this.props;

    return (
      <SelectableResourceChart
        {...this.props}
        onResourceByXChange={onResourceByTopicChange}
        currentSelectedResource={currentResourceByTopic}
        stream={this.getCurrentStream(currentResourceByTopic)}
        convertToGraphFormat={this.convertToGraphFormat}
        convertSerie={this.convertSerie}
        currentFilter={currentTopicFilter}
        byWhat="Topic"
      />
    );
  }
}

export default localize<Props>(
  injectIntl<Props & InjectedLocalized>(
    SelectableResourceByTopicChart as any
  ) as any
);
