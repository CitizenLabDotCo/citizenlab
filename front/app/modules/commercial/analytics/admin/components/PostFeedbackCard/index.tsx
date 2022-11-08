import React, { useRef } from 'react';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import EmptyState from 'components/admin/Graphs/_components/EmptyState';
import DonutChart from './DonutChart';
import ProgressBars from './ProgressBars';
import StackedBars from './StackedBars';
import Button from 'components/UI/Button';

// stylings
import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';

// i18n
import hookMessages from '../../hooks/usePostsFeedback/messages';
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// hooks
import usePostsFeedback from '../../hooks/usePostsFeedback';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
  const progressBarsRef = useRef();
  const stackedBarsRef = useRef();

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

  const { xlsxData } = data;

  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle.toLowerCase().replace(' ', '_'),
        svgNode: [donutChartRef, progressBarsRef, stackedBarsRef],
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
          <ProgressBars data={data} innerRef={progressBarsRef} />
        </ProgressBarsContainer>
      </Container>
      <Box width="100%" maxWidth="600px" height="initial" mt="30px" p="8px">
        <StackedBars data={data} innerRef={stackedBarsRef} />
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
