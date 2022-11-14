import React, { useRef } from 'react';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
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

// typings
import { isNilOrError } from 'utils/helperUtils';
import { ProjectId, Dates, Resolution } from '../../typings';

type Props = ProjectId & Dates & Resolution;

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

const InputStatusCard = ({
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
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle.toLowerCase().replace(' ', '_'),
        svgNode: [donutChartRef, progressBarsRef, stackedBarsRef],
        xlsx: isNilOrError(data) ? undefined : { data: data.xlsxData },
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
            <ProgressBars data={data} innerRef={progressBarsRef} />
          </Box>
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

export default InputStatusCard;
