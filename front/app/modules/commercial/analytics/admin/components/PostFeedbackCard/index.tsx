import React, { useRef, useState } from 'react';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box, Icon } from '@citizenlab/cl2-component-library';
import EmptyState from 'components/admin/Graphs/_components/EmptyState';
import DonutChart from './DonutChart';
import ProgressBars from 'components/admin/Graphs/ProgressBars';
import StackedBarChart from 'components/admin/Graphs/StackedBarChart';
import CenterLabel from './DonutChart/CenterLabel';
import { stackLabels } from './stackLabels';
import { stackedBarTooltip } from './stackedBarTooltip';
import Button from 'components/UI/Button';

// stylings
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// i18n
import hookMessages from '../../hooks/usePostsFeedback/messages';
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// hooks
import usePostsFeedback from '../../hooks/usePostsFeedback';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getCornerRadius } from './utils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';

interface Props {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  resolution: IResolution;
}

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: row;
  min-height: 240px;

  ${media.tablet`
    flex-direction: column;
  `}
`;

const DonutChartContainer = styled.div`
  width: 50%;
  height: 100%;
  padding: 8px;

  ${media.tablet`
    width: 100%;
    height: 50%;
  `}
`;

const ProgressBarsContainer = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;

  ${media.tablet`
    width: 100%;
    height: 50%;
  `}
`;

const PostFeedback = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();

  const donutChartRef = useRef();
  const currentProgressBarsChart = useRef();
  const currentStackedBarChart = useRef();
  const [stackedBarHoverIndex, setStackedBarHoverIndex] = useState<
    number | undefined
  >();

  const onMouseOverStackedBar = ({ stackIndex }) => {
    setStackedBarHoverIndex(stackIndex);
  };

  const onMouseOutStackedBar = () => {
    setStackedBarHoverIndex(undefined);
  };

  const data = usePostsFeedback({
    projectId,
    startAtMoment,
    endAtMoment,
  });

  const cardTitle = formatMessage(hookMessages.inputStatus);

  if (isNilOrError(data)) {
    return (
      <GraphCard title={cardTitle}>
        <EmptyState />
      </GraphCard>
    );
  }

  const {
    progressBarsData,
    stackedBarsData,
    days,
    stackedBarColumns,
    statusColorById,
    stackedBarPercentages,
    stackedBarsLegendItems,
    xlsxData,
  } = data;

  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle.toLowerCase().replace(' ', '_'),
        svgNode: [
          donutChartRef,
          currentProgressBarsChart,
          currentStackedBarChart,
        ],
        xlsx: { data: xlsxData },
        currentProjectFilter: projectId,
        startAt,
        endAt,
        resolution,
      }}
    >
      <Container>
        <DonutChartContainer>
          <DonutChart data={data} innerRef={donutChartRef} />
        </DonutChartContainer>
        <ProgressBarsContainer>
          <Box
            width="100%"
            maxWidth="256px"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <ProgressBars
              height={136}
              data={progressBarsData}
              innerRef={currentProgressBarsChart}
            />
            <Box
              m="0 0 0 0"
              style={{
                color: colors.primary,
                fontSize: fontSizes.s,
              }}
              width="100%"
            >
              <Icon
                name="calendar"
                fill={colors.primary}
                width="13px"
                height="13px"
                mr="11px"
              />
              {formatMessage(hookMessages.averageTime, { days })}
            </Box>
          </Box>
        </ProgressBarsContainer>
      </Container>
      <Box width="100%" maxWidth="600px" height="initial" mt="30px" p="8px">
        <StackedBarChart
          data={stackedBarsData}
          height={25}
          mapping={{
            stackedLength: stackedBarColumns,
            fill: ({ stackIndex }) =>
              statusColorById[stackedBarColumns[stackIndex]],
            cornerRadius: getCornerRadius(stackedBarColumns.length, 3),
            opacity: ({ stackIndex }) => {
              if (stackedBarHoverIndex === undefined) return 1;
              return stackedBarHoverIndex === stackIndex ? 1 : 0.3;
            },
          }}
          layout="horizontal"
          labels={stackLabels(
            stackedBarsData,
            stackedBarColumns,
            stackedBarPercentages
          )}
          xaxis={{ hide: true, domain: [0, 'dataMax'] }}
          yaxis={{ hide: true, domain: ['dataMin', 'dataMax'] }}
          tooltip={stackedBarTooltip(
            stackedBarHoverIndex,
            stackedBarsData,
            stackedBarColumns,
            stackedBarPercentages,
            stackedBarsLegendItems.map((item) => item.label)
          )}
          legend={{
            items: stackedBarsLegendItems,
            marginTop: 15,
            maintainGraphSize: true,
          }}
          innerRef={currentStackedBarChart}
          onMouseOver={onMouseOverStackedBar}
          onMouseOut={onMouseOutStackedBar}
        />
      </Box>

      <Button
        icon="arrow-right"
        iconPos="right"
        buttonStyle="text"
        iconSize="13px"
        fontSize={`${fontSizes.s}px`}
        padding="0px"
        marginTop="20px"
        textDecorationHover="underline"
        text={formatMessage(messages.goToInputManager)}
        linkTo="/admin/ideas"
      />
    </GraphCard>
  );
};

export default PostFeedback;
