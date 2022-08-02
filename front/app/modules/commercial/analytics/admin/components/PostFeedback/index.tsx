import React from 'react';

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
  const data = usePostsWithFeedback(formatMessage, projectId);
  if (!data) return null;

  const { pieData, feedbackPercent, days, progressBarsData } = data;
  const centerValue = `${Math.round(feedbackPercent * 100)}%`;
  const centerLabel = formatMessage(messages.feedbackGiven);

  return (
    <GraphCard className="fullWidth dynamicHeight">
      <GraphCardInner>
        <GraphCardHeader>
          <GraphCardTitle>
            {formatMessage(messages.postFeedback)}
          </GraphCardTitle>
          <ReportExportMenu
            name="title"
            currentProjectFilter={undefined}
            xlsxEndpoint={undefined}
            svgNode={undefined}
          />
        </GraphCardHeader>
        <WrapperBox>
          <PieBox>
            <PieChart
              height={210}
              width="100%"
              data={pieData}
              centerLabel={centerLabel}
              centerValue={centerValue}
            />
          </PieBox>
          <ProgressBarsBox>
            <ProgressBars data={progressBarsData} width="100%" height={136} />
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
