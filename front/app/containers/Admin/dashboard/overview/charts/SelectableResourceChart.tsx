import React, { useRef } from 'react';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import messages from '../../messages';

// styling
import styled from 'styled-components';
import {
  sizes,
  DEFAULT_BAR_CHART_MARGIN,
} from 'components/admin/Graphs/styling';
import { media } from 'utils/styleUtils';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  GraphCard,
  GraphCardInner,
  GraphCardHeaderWithFilter,
} from 'components/admin/GraphWrappers';
import { IResolution } from 'components/admin/ResolutionControl';
import { Select } from '@citizenlab/cl2-component-library';
import { HiddenLabel } from 'utils/a11y';
import BarChart from 'components/admin/Graphs/BarChart';

// typings
import {
  IIdeasByTopic,
  ICommentsByTopic,
  IVotesByTopic,
  IIdeasByProject,
  ICommentsByProject,
  IVotesByProject,
  ideasByTopicXlsxEndpoint,
  ideasByProjectXlsxEndpoint,
  commentsByTopicXlsxEndpoint,
  commentsByProjectXlsxEndpoint,
  votesByTopicXlsxEndpoint,
  votesByProjectXlsxEndpoint,
} from 'services/stats';
import { IStreamParams, IStream } from 'utils/streams';
import { IResource } from '..';
import { IGraphFormat, IOption } from 'typings';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

const GraphCardTitle = styled.h3`
  margin: 0;
  margin-right: 15px;

  ${media.tablet`
    margin-bottom: 15px;
  `}
`;

const SHiddenLabel = styled(HiddenLabel)`
  flex: 1;
  margin-right: 15px;
  @media (max-width: 1300px) {
    width: 100%;
  }
`;

interface DataProps {
  serie: IGraphFormat | NilOrError;
}

type ISupportedData =
  | IIdeasByTopic
  | IVotesByTopic
  | ICommentsByTopic
  | IIdeasByProject
  | IVotesByProject
  | ICommentsByProject;

type ByWhat = 'Topic' | 'Project';

interface QueryProps {
  startAt: string | null | undefined;
  endAt: string | null;
  stream: (streamParams?: IStreamParams | null) => IStream<ISupportedData>;
  convertToGraphFormat: (resource: ISupportedData) => IGraphFormat | null;
  currentFilter: string | undefined;
  byWhat: ByWhat;
  currentProjectFilter?: string;
  currentGroupFilter?: string;
  currentTopicFilter?: string;
  currentProjectFilterLabel?: string;
  currentGroupFilterLabel?: string;
  currentTopicFilterLabel?: string;
  resolution: IResolution;
}

interface InputProps extends QueryProps {
  className?: string;
  onResourceByXChange: (option: IOption) => void;
  currentSelectedResource: IResource;
  resourceOptions: IOption[];
}

interface Props extends InputProps, DataProps {}

const RESOURCE_MESSAGES: Record<IResource, MessageDescriptor> = {
  ideas: messages.inputs,
  comments: messages.comments,
  votes: messages.votes,
};

const TITLE_MESSAGES: Record<ByWhat, MessageDescriptor> = {
  Topic: messages.participationPerTopic,
  Project: messages.participationPerProject,
};

const HIDDEN_LABEL_MESSAGES: Record<ByWhat, MessageDescriptor> = {
  Topic: messages.hiddenLabelPickResourceByTopic,
  Project: messages.hiddenLabelPickResourceByProject,
};

const REPORT_EXPORT_MENU_NAME_MESSAGES: Record<ByWhat, MessageDescriptor> = {
  Topic: messages.participationPerTopic,
  Project: messages.participationPerProject,
};

const XLSX_ENDPOINTS_MAP: Record<string, string> = {
  ideasTopic: ideasByTopicXlsxEndpoint,
  commentsTopic: commentsByTopicXlsxEndpoint,
  votesTopic: votesByTopicXlsxEndpoint,
  ideasProject: ideasByProjectXlsxEndpoint,
  commentsProject: commentsByProjectXlsxEndpoint,
  votesProject: votesByProjectXlsxEndpoint,
};

const SelectableResourceChart = ({
  className,
  onResourceByXChange,
  currentSelectedResource,
  resourceOptions,
  currentFilter,
  byWhat,
  serie,
  intl: { formatMessage },
  ...reportExportMenuProps
}: Props & WrappedComponentProps) => {
  const currentChart = useRef();

  const unitName = formatMessage(RESOURCE_MESSAGES[currentSelectedResource]);
  const xlsxEndpoint = XLSX_ENDPOINTS_MAP[currentSelectedResource + byWhat];

  return (
    <GraphCard className={className}>
      <GraphCardInner>
        <GraphCardHeaderWithFilter>
          <GraphCardTitle>
            <FormattedMessage {...TITLE_MESSAGES[byWhat]} />
          </GraphCardTitle>
          <SHiddenLabel>
            <FormattedMessage {...HIDDEN_LABEL_MESSAGES[byWhat]} />
            <Select
              id={`select${byWhat}`}
              onChange={onResourceByXChange}
              value={currentSelectedResource}
              options={resourceOptions}
            />
          </SHiddenLabel>
          {!isNilOrError(serie) && (
            <ReportExportMenu
              svgNode={currentChart}
              name={formatMessage(REPORT_EXPORT_MENU_NAME_MESSAGES[byWhat])}
              xlsx={{ endpoint: xlsxEndpoint }}
              {...reportExportMenuProps}
            />
          )}
        </GraphCardHeaderWithFilter>
        <BarChart
          height={
            !isNilOrError(serie) && serie.length > 1 ? serie.length * 50 : 100
          }
          data={serie}
          layout="horizontal"
          innerRef={currentChart}
          margin={DEFAULT_BAR_CHART_MARGIN}
          mapping={{
            category: 'name',
            length: 'value',
            opacity: currentFilter
              ? ({ row }) => (row.code === currentFilter ? 1 : 0.5)
              : () => 1,
          }}
          bars={{ name: unitName, size: sizes.bar }}
          yaxis={{ width: 150, tickLine: false }}
          labels
          tooltip
        />
      </GraphCardInner>
    </GraphCard>
  );
};

const SelectableResourceChartWithHoCs = injectIntl(SelectableResourceChart);

export default (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <SelectableResourceChartWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);
