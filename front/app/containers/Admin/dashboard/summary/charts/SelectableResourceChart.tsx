import React, { useRef } from 'react';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import styled, { useTheme } from 'styled-components';
import { media } from 'utils/styleUtils';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import { Tooltip, LabelList } from 'recharts';
import {
  GraphCard,
  GraphCardInner,
  GraphCardHeaderWithFilter,
} from 'components/admin/GraphWrappers';
import { IResolution } from 'components/admin/ResolutionControl';
import { Select } from '@citizenlab/cl2-component-library';
import { HiddenLabel } from 'utils/a11y';
import BarChart from 'components/admin/Graphs/BarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/constants';

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

const SHiddenLabel = styled(HiddenLabel)`
  flex: 1;
  margin-right: 15px;
  @media (max-width: 1300px) {
    width: 100%;
  }
`;

const GraphCardTitle = styled.h3`
  margin: 0;
  margin-right: 15px;

  ${media.smallerThan1280px`
    margin-bottom: 15px;
  `}
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
  currentProjectFilter: string | undefined;
  currentGroupFilter: string | undefined;
  currentTopicFilter: string | undefined;
  currentProjectFilterLabel: string | undefined;
  currentGroupFilterLabel: string | undefined;
  currentTopicFilterLabel: string | undefined;
  resolution: IResolution;
}

interface InputProps extends QueryProps {
  className?: string;
  onResourceByXChange: (option: IOption) => void;
  currentSelectedResource: IResource;
  resourceOptions: IOption[];
}

interface Props extends InputProps, DataProps {}

const RESOURCE_MESSAGES: Record<
  IResource,
  ReactIntl.FormattedMessage.MessageDescriptor
> = {
  ideas: messages.inputs,
  comments: messages.comments,
  votes: messages.votes,
};

const TITLE_MESSAGES: Record<
  ByWhat,
  ReactIntl.FormattedMessage.MessageDescriptor
> = {
  Topic: messages.participationPerTopic,
  Project: messages.participationPerProject,
};

const HIDDEN_LABEL_MESSAGES: Record<
  ByWhat,
  ReactIntl.FormattedMessage.MessageDescriptor
> = {
  Topic: messages.hiddenLabelPickResourceByTopic,
  Project: messages.hiddenLabelPickResourceByProject,
};

const REPORT_EXPORT_MENU_NAME_MESSAGES: Record<
  ByWhat,
  ReactIntl.FormattedMessage.MessageDescriptor
> = {
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

const getMapping = (
  fill: string,
  highlightFill: string,
  currentFilter?: string
) => {
  if (!currentFilter) return;
  return {
    fill: (row) => (row.name === currentFilter ? highlightFill : fill),
  };
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
}: Props & InjectedIntlProps) => {
  const currentChart = useRef();
  const { barSize, newBarFill }: any = useTheme();

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
              xlsxEndpoint={xlsxEndpoint}
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
          mapping={getMapping(newBarFill, 'red', currentFilter)}
          bars={{ name: unitName, size: barSize }}
          yaxis={{ width: 150, tickLine: false }}
          renderLabels={(props) => <LabelList {...props} />}
          renderTooltip={(props) => <Tooltip {...props} />}
        />
      </GraphCardInner>
    </GraphCard>
  );
};

const SelectableResourceChartWithHoCs = injectIntl<Props>(
  SelectableResourceChart
);

export default (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <SelectableResourceChartWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);
