import React, { useRef } from 'react';

// components
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';
import { Box, Icon } from '@citizenlab/cl2-component-library';
import PieChart from 'components/admin/Graphs/PieChart';
import ProgressBars from 'components/admin/Graphs/ProgressBars';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// hooks
import usePostsWithFeedback from './usePostsFeedback';

// typings
import { InjectedIntlProps } from 'react-intl';

// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

const CalendarIcon = styled(Icon)`
  fill: #044d6c;
  width: 13px;
  height: 13px;
  margin-right: 11px;
`;

const Text = styled.p`
  margin: -2px 0 0 0;
  color: #044d6c;
  font-size: 14px;
  display: block !important;
`;

const ProgressBarsBox = styled(Box)`
  max-width: 257px;
  margin: 30px 0 0 50px;
  width: 100%;
  ${media.smallerThan1280px`
    margin: 30px 0 0 0;
  `}
`;

const PieBox = styled(Box)`
  max-width: 210px;
  width: 100%;
`;

const WrapperBox = styled(Box)`
  display: flex;
  justify-content: center;
  width: 100%;

  ${media.smallerThan1280px`
    flex-direction: column;
    align-items: center;
  `}
`;

interface Props {
  projectId?: string;
}

const PostFeedback = ({
  projectId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const currentPieChart = useRef();
  const currentProgressBarsChart = useRef();
  const data = usePostsWithFeedback(formatMessage, projectId);
  if (!data) return null;

  const {
    pieData,
    pieCenterValue,
    pieCenterLabel,
    xlsxData,
    days,
    progressBarsData,
  } = data;

  return (
    <GraphCard className="fullWidth dynamicHeight">
      <GraphCardInner>
        <GraphCardHeader>
          <GraphCardTitle>
            {formatMessage(messages.postFeedback)}
          </GraphCardTitle>
          <ReportExportMenu
            name={formatMessage(messages.postFeedback)
              .toLowerCase()
              .replace(' ', '_')}
            svgNode={[currentPieChart, currentProgressBarsChart]}
            data={xlsxData}
          />
        </GraphCardHeader>
        <WrapperBox>
          <PieBox>
            <PieChart
              height={210}
              width="100%"
              data={pieData}
              centerLabel={pieCenterLabel}
              centerValue={pieCenterValue}
              innerRef={currentPieChart}
            />
          </PieBox>
          <ProgressBarsBox>
            <ProgressBars
              data={progressBarsData}
              width="100%"
              height={136}
              innerRef={currentProgressBarsChart}
            />
            <Text>
              <CalendarIcon name="calendar" />
              {formatMessage(messages.averageTime, { days })}
            </Text>
          </ProgressBarsBox>
        </WrapperBox>
      </GraphCardInner>
    </GraphCard>
  );
};

export default injectIntl(PostFeedback);
