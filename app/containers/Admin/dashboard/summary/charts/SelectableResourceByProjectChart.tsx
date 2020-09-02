// libraries
import React, { PureComponent } from 'react';
import { map, sortBy } from 'lodash-es';

// components
import SelectableResourceChart from './SelectableResourceChart';

// intl
import localize, { InjectedLocalized } from 'utils/localize';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// typings
import {
  IIdeasByProject,
  ideasByProjectStream,
  ICommentsByProject,
  commentsByProjectStream,
  IVotesByProject,
  votesByProjectStream,
} from 'services/stats';
import { IOption, IGraphFormat } from 'typings';
import { IResource } from '..';
import { IResolution } from '../../';

interface QueryProps {
  startAt: string | null | undefined;
  endAt: string | null;
  currentTopicFilter: string | undefined;
  currentGroupFilter: string | undefined;
}

interface InputProps {
  currentProjectFilter: string | undefined;
  className: string;
  onResourceByProjectChange: (option: IOption) => void;
  currentResourceByProject: IResource;
  resourceOptions: IOption[];
  projectOptions: IOption[];
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentGroupFilter: string | undefined;
  currentTopicFilter: string | undefined;
  currentProjectFilterLabel: string | undefined;
  currentGroupFilterLabel: string | undefined;
  currentTopicFilterLabel: string | undefined;
}

interface Props extends InputProps, QueryProps {}

interface PropsWithHoCs extends Props, InjectedIntlProps, InjectedLocalized {}

class SelectableResourceByProjectChart extends PureComponent<PropsWithHoCs> {
  convertToGraphFormat = (
    data: IIdeasByProject | IVotesByProject | ICommentsByProject
  ) => {
    const { series, projects } = data;
    const { localize, currentResourceByProject } = this.props;
    const dataKey =
      currentResourceByProject === 'votes' ? 'total' : currentResourceByProject;

    const mapped = map(series[dataKey], (count: number, projectId: string) => ({
      name: localize(projects[projectId].title_multiloc) as string,
      value: count as number,
      code: projectId as string,
    }));
    const res = sortBy(mapped, 'name');

    return res.length > 0 ? res : null;
  };

  convertSerie = (serie: IGraphFormat | null) => {
    const {
      currentProjectFilter,
      currentResourceByProject,
      projectOptions,
      intl: { formatMessage },
    } = this.props;

    if (serie && currentResourceByProject) {
      const selectedProject = serie.find(
        (item) => item.code === currentProjectFilter
      );
      const selectedCount = selectedProject ? selectedProject.value : 0;

      let selectedName;
      if (selectedProject) {
        selectedName = selectedProject.name;
      } else {
        const foundOption = projectOptions.find(
          (option) => option.value === currentProjectFilter
        );
        selectedName = foundOption
          ? foundOption.label
          : formatMessage(messages.selectedProject);
      }

      const convertedSerie = serie
        .filter((item) => item.code !== currentProjectFilter)
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

  getCurrentStream(currentResourceByProject) {
    if (currentResourceByProject === 'ideas') {
      return ideasByProjectStream;
    } else if (currentResourceByProject === 'comments') {
      return commentsByProjectStream;
    } else {
      return votesByProjectStream;
    }
  }

  render() {
    const {
      currentResourceByProject,
      currentProjectFilter,
      onResourceByProjectChange,
    } = this.props;

    return (
      <SelectableResourceChart
        {...this.props}
        onResourceByXChange={onResourceByProjectChange}
        currentSelectedResource={currentResourceByProject}
        stream={this.getCurrentStream(currentResourceByProject)}
        convertToGraphFormat={this.convertToGraphFormat}
        convertSerie={this.convertSerie}
        currentFilter={currentProjectFilter}
        byWhat="Project"
      />
    );
  }
}

export default localize<Props>(
  injectIntl<Props & InjectedLocalized>(
    SelectableResourceByProjectChart as any
  ) as any
);
