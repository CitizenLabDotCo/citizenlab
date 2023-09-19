import React, { useRef, useEffect, useState } from 'react';

// intl
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { MessageDescriptor } from 'react-intl';
import messages from '../../messages';

// styling
import styled from 'styled-components';
import {
  sizes,
  DEFAULT_BAR_CHART_MARGIN,
} from 'components/admin/Graphs/styling';
import { media, colors } from 'utils/styleUtils';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  GraphCard,
  GraphCardInner,
  GraphCardHeaderWithFilter,
} from 'components/admin/GraphWrappers';
import { IResolution } from 'components/admin/ResolutionControl';
import { Select, Box, Icon } from '@citizenlab/cl2-component-library';
import { HiddenLabel } from 'utils/a11y';
import BarChart from 'components/admin/Graphs/BarChart';

// typings
import { IResource } from '..';
import { IGraphFormat, IOption } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { ideasByTopicXlsxEndpoint } from 'api/ideas_by_topic/util';
import { commentsByTopicXlsxEndpoint } from 'api/comments_by_topic/util';
import { reactionsByTopicXlsxEndpoint } from 'api/reactions_by_topic/util';
import { commentsByProjectXlsxEndpoint } from 'api/comments_by_project/util';
import { ideasByProjectXlsxEndpoint } from 'api/ideas_by_project/util';
import { reactionsByProjectXlsxEndpoint } from 'api/reactions_by_project/util';

const GraphCardTitle = styled.h3`
  margin: 0;
  margin-right: 15px;
  font-size: 25px;
  font-weight: bold;
  line-height: 1.3;
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

export const GraphCardClipper = styled.div`
  &.maxHeight {
    height: 300px;
    overflow: hidden;
    margin-bottom: 44px;
  }
  &.hasShowmore {
    margin-bottom: 24px;
  }
`;

export const GraphCardShowMore = styled.button`
  padding: 24px 0 35px;
  width: 100%;
  color: ${colors.coolGrey600};
  position: absolute;
  bottom: 0;
  left: 0;
  cursor: pointer;
  &.active {
    padding: 100px 0 24px;
    background-image: linear-gradient(transparent, white 50%, white);
  }
`;

type ByWhat = 'Topic' | 'Project';

interface QueryProps {
  startAt: string | null | undefined;
  endAt: string | null;
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

interface Props extends QueryProps {
  className?: string;
  onResourceByXChange: (option: IOption) => void;
  currentSelectedResource: IResource;
  resourceOptions: IOption[];
  serie?: IGraphFormat;
}

const RESOURCE_MESSAGES: Record<IResource, MessageDescriptor> = {
  ideas: messages.inputs,
  comments: messages.comments,
  reactions: messages.reactions,
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
  reactionsTopic: reactionsByTopicXlsxEndpoint,
  ideasProject: ideasByProjectXlsxEndpoint,
  commentsProject: commentsByProjectXlsxEndpoint,
  reactionsProject: reactionsByProjectXlsxEndpoint,
};

const SelectableResourceChart = ({
  className,
  onResourceByXChange,
  currentSelectedResource,
  resourceOptions,
  currentFilter,
  byWhat,
  serie,
  ...reportExportMenuProps
}: Props) => {
  const { formatMessage } = useIntl();
  const currentChart = useRef();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showMore, setShowMore] = useState<boolean | null>(null);

  const unitName = formatMessage(RESOURCE_MESSAGES[currentSelectedResource]);
  const xlsxEndpoint = XLSX_ENDPOINTS_MAP[currentSelectedResource + byWhat];

  useEffect(() => {
    if (
      showMore == null &&
      containerRef.current &&
      containerRef.current?.clientHeight > 300
    ) {
      setShowMore(true);
    }
  }, [showMore, containerRef.current?.clientHeight]);

  const buttonClassname =
    showMore === null ? '' : showMore === true ? 'active' : 'inactive';
  const containerClassname =
    showMore !== null
      ? showMore === true
        ? 'maxHeight hasShowmore'
        : 'hasShowmore'
      : '';

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
          {serie && (
            <ReportExportMenu
              svgNode={currentChart}
              name={formatMessage(REPORT_EXPORT_MENU_NAME_MESSAGES[byWhat])}
              xlsx={{ endpoint: xlsxEndpoint }}
              {...reportExportMenuProps}
            />
          )}
        </GraphCardHeaderWithFilter>
        <GraphCardClipper ref={containerRef} className={containerClassname}>
          <Box>
            <BarChart
              height={
                !isNilOrError(serie) && serie.length > 1
                  ? serie.length * 50
                  : 100
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
          </Box>
        </GraphCardClipper>
        {showMore != null && (
          <GraphCardShowMore
            className={buttonClassname}
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? (
              <>
                <Icon fill={colors.coolGrey600} name="refresh" />{' '}
                {formatMessage(messages.showMore)}
              </>
            ) : (
              formatMessage(messages.showLess)
            )}
          </GraphCardShowMore>
        )}
      </GraphCardInner>
    </GraphCard>
  );
};

export default SelectableResourceChart;
