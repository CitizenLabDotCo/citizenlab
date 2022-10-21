// libraries
import { map, orderBy } from 'lodash-es';
import React from 'react';

// components
import SelectableResourceChart from './SelectableResourceChart';

// hooks
import useLocalize from 'hooks/useLocalize';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import {
  commentsByProjectStream,
  ICommentsByProject,
  ideasByProjectStream,
  IIdeasByProject,
  IVotesByProject,
  votesByProjectStream,
} from 'services/stats';
import { IOption } from 'typings';
import { IResource } from '..';

interface QueryProps {
  startAt: string | null | undefined;
  endAt: string | null;
}

interface InputProps {
  currentProjectFilter: string | undefined;
  className: string;
  onResourceByProjectChange: (option: IOption) => void;
  currentResourceByProject: IResource;
  resourceOptions: IOption[];
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentProjectFilterLabel: string | undefined;
}

interface Props extends InputProps, QueryProps {}

const getCurrentStream = (currentResourceByProject: IResource) => {
  if (currentResourceByProject === 'ideas') {
    return ideasByProjectStream;
  } else if (currentResourceByProject === 'comments') {
    return commentsByProjectStream;
  } else {
    return votesByProjectStream;
  }
};

const SelectableResourceByProjectChart = ({
  currentResourceByProject,
  onResourceByProjectChange,
  currentProjectFilter,
  ...otherProps
}: Props) => {
  const localize = useLocalize();

  const convertToGraphFormat = (
    data: IIdeasByProject | IVotesByProject | ICommentsByProject
  ) => {
    const { series, projects } = data;
    const dataKey =
      currentResourceByProject === 'votes' ? 'total' : currentResourceByProject;

    const mapped = map(series[dataKey], (count: number, projectId: string) => ({
      name: localize(projects[projectId].title_multiloc),
      value: count,
      code: projectId,
    }));

    const sortedByValue = orderBy(mapped, 'value', 'desc');
    return sortedByValue.length > 0 ? sortedByValue : null;
  };

  return (
    <SelectableResourceChart
      onResourceByXChange={onResourceByProjectChange}
      currentSelectedResource={currentResourceByProject}
      stream={getCurrentStream(currentResourceByProject)}
      convertToGraphFormat={convertToGraphFormat}
      currentFilter={currentProjectFilter}
      byWhat="Project"
      {...otherProps}
    />
  );
};

export default SelectableResourceByProjectChart;
