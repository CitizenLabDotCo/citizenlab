import React, { useState } from 'react';
import {
  IconButton,
  Text,
  colors,
  Box,
  Icon,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import translations from './translations';

import useRateAnalysisInsight from 'api/analysis_insights/useRateAnalysisInsight';
import { useParams } from 'react-router-dom';

const Rate = ({ insightId }: { insightId: string }) => {
  const { formatMessage } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };
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
          <Text>{formatMessage(translations.thankYou)}</Text>
        </Box>
      ) : (
        <Box>
          <Text> {formatMessage(translations.rate)}</Text>
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
