import React, { useState } from 'react';

import {
  IconButton,
  Text,
  colors,
  Box,
  Icon,
} from '@citizenlab/cl2-component-library';

import useRateAnalysisInsight from 'api/analysis_insights/useRateAnalysisInsight';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';

const Rate = ({ insightId }: { insightId: string }) => {
  const { formatMessage } = useIntl();
  const { analysisId } = useParams({
    from: '/$locale/admin/projects/$projectId/analysis/$analysisId',
  });
  const { mutate: rateAnalysisInsight } = useRateAnalysisInsight();
  const [rated, setRated] = useState(false);

  const handleUpvote = () => {
    rateAnalysisInsight({
      analysisId,
      id: insightId,
      rating: 'vote_up',
    });
    setRated(true);
  };

  const handleDownvote = () => {
    rateAnalysisInsight({
      analysisId,
      id: insightId,
      rating: 'vote_down',
    });
    setRated(true);
  };

  return (
    <Box
      minHeight="80px"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {rated ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap="8px"
        >
          <Icon fill={colors.success} name="check-circle" />
          <Text>{formatMessage(messages.thankYou)}</Text>
        </Box>
      ) : (
        <Box>
          <Text> {formatMessage(messages.rate)}</Text>
          <Box display="flex" w="100%" justifyContent="center">
            <IconButton
              iconName="vote-up"
              a11y_buttonActionMessage="Upvote"
              iconColor={colors.success}
              iconColorOnHover={colors.success}
              onClick={handleUpvote}
            />
            <IconButton
              iconName="vote-down"
              a11y_buttonActionMessage="Downvote"
              iconColor={colors.error}
              iconColorOnHover={colors.error}
              onClick={handleDownvote}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Rate;
