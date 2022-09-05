import React, { useRef, useState } from 'react';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box, Icon } from '@citizenlab/cl2-component-library';
import EmptyState from 'components/admin/Graphs/_components/EmptyState';
import PieChart from 'components/admin/Graphs/PieChart';
import ProgressBars from 'components/admin/Graphs/ProgressBars';
import StackedBarChart from 'components/admin/Graphs/StackedBarChart';
import CenterLabel from './CenterLabel';
import { stackLabels } from './stackLabels';
import { stackedBarTooltip } from './stackedBarTooltip';
import Button from 'components/UI/Button';

// styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import hookMessages from '../../hooks/usePostsFeedback/messages';
import messages from './messages';

// hooks
import usePostsFeedback from '../../hooks/usePostsFeedback';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getCornerRadius } from './utils';

// typings
import { InjectedIntlProps } from 'react-intl';

interface Props {
  projectId: string | undefined;
  startAt: string | null | undefined;
  endAt: string | null;
}

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: row;
  min-height: 240px;

  ${media.smallerThan1100px`
    flex-direction: column;
  `}
`;

const DonutChartContainer = styled.div`
  width: 50%;
  height: 100%;
  padding: 8px;

  ${media.smallerThan1100px`
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

  ${media.smallerThan1100px`
    width: 100%;
    height: 50%;
  `}
`;

const PostFeedback = ({
  projectId,
  startAt,
  endAt,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const currentPieChart = useRef();
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

  const data = usePostsFeedback(formatMessage, {
    projectId,
    startAt,
    endAt,
  });

  if (isNilOrError(data)) {
    return (
      <GraphCard title={formatMessage(hookMessages.inputStatus)}>
        <EmptyState />
      </GraphCard>
    );
  }

  const {
    pieData,
    progressBarsData,
    stackedBarsData,
    pieCenterValue,
    pieCenterLabel,
    days,
    stackedBarColumns,
    statusColorById,
    stackedBarPercentages,
    stackedBarsLegendItems,
    xlsxData,
  } = data;

  return (
    <GraphCard
      title={formatMessage(hookMessages.inputStatus)}
      exportMenu={{
        name: formatMessage(hookMessages.inputStatus)
          .toLowerCase()
          .replace(' ', '_'),
        svgNode: [
          currentPieChart,
          currentProgressBarsChart,
          currentStackedBarChart,
        ],
        xlsxData,
      }}
    >
      <Container>
        <DonutChartContainer>
          <PieChart
            data={pieData}
            mapping={{
              angle: 'value',
              name: 'name',
              fill: ({ row: { color } }) => color,
            }}
            pie={{
              innerRadius: '85%',
            }}
            centerLabel={({ viewBox: { cy } }) => (
              <CenterLabel
                y={cy - 5}
                value={pieCenterValue}
                label={pieCenterLabel}
              />
            )}
            innerRef={currentPieChart}
          />
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
                color: colors.adminTextColor,
                fontSize: fontSizes.s,
              }}
              width="100%"
            >
              <Icon
                name="calendar"
                fill={colors.adminTextColor}
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
          height={40}
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
            maintainGraphHeight: true,
          }}
          innerRef={currentStackedBarChart}
          onMouseOver={onMouseOverStackedBar}
          onMouseOut={onMouseOutStackedBar}
        />
      </Box>

      <Button
        icon="arrowLeft"
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

export default injectIntl(PostFeedback);
