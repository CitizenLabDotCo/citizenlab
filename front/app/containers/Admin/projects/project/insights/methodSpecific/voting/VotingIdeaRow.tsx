import React from 'react';

import { Box, Text, Image } from '@citizenlab/cl2-component-library';

import { VotingIdeaResult } from 'api/voting_insights/types';

import useLocalize from 'hooks/useLocalize';

import { CHART_COLORS, getStripedPattern } from './constants';

interface Props {
  idea: VotingIdeaResult;
  maxVotes: number;
  clusterBy?: string;
  demographicKeys?: string[];
  demographicLabels?: string[];
}

const VotingIdeaRow = ({
  idea,
  maxVotes,
  clusterBy,
  demographicKeys,
  demographicLabels,
}: Props) => {
  const localize = useLocalize();

  const title = localize(idea.title_multiloc);
  const totalVotes = idea.total_votes;

  // Render a single progress bar with online/offline segments
  const renderProgressBar = (
    online: number,
    offline: number,
    maxValue: number
  ) => {
    const total = online + offline;
    const onlinePct = total > 0 ? (online / total) * 100 : 0;
    const offlinePct = total > 0 ? (offline / total) * 100 : 0;
    const barWidth = maxValue > 0 ? (total / maxValue) * 100 : 0;

    return (
      <Box
        w="100%"
        h="16px"
        bgColor="#E0E0E0"
        borderRadius="4px"
        overflow="hidden"
        border="1px solid #E0E0E0"
      >
        <Box display="flex" h="100%" style={{ width: `${barWidth}%` }}>
          {/* Online votes - solid dark blue */}
          <Box
            h="100%"
            style={{
              width: `${onlinePct}%`,
              backgroundColor: CHART_COLORS.darkBlue,
            }}
          />
          {/* Offline/In-person votes - striped pattern */}
          {offlinePct > 0 && (
            <Box
              h="100%"
              style={{
                width: `${offlinePct}%`,
                backgroundImage: getStripedPattern(),
              }}
            />
          )}
        </Box>
      </Box>
    );
  };

  // Without clustering: single bar
  if (!clusterBy || !demographicKeys || demographicKeys.length === 0) {
    return (
      <Box display="flex" alignItems="center" gap="16px" py="12px">
        {/* Image thumbnail */}
        <Box flexShrink={0}>
          {idea.image_url ? (
            <Image
              src={idea.image_url}
              alt={title}
              w="48px"
              h="48px"
              borderRadius="4px"
              objectFit="cover"
            />
          ) : (
            <Box
              w="48px"
              h="48px"
              borderRadius="4px"
              bgColor="#E5E7EB"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text m="0" fontSize="xs" color="textSecondary">
                📷
              </Text>
            </Box>
          )}
        </Box>

        {/* Title and bar */}
        <Box flex="1" minWidth="0">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="8px"
          >
            <Text
              m="0"
              fontSize="s"
              color="textPrimary"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Text>
            <Box display="flex" alignItems="center" gap="8px" flexShrink={0}>
              <Text
                m="0"
                fontSize="s"
                fontWeight="bold"
                style={{ color: CHART_COLORS.darkBlue }}
              >
                {idea.percentage}%
              </Text>
              {idea.offline_votes > 0 && (
                <Text m="0" fontSize="s" color="textSecondary">
                  ⫶{' '}
                  {totalVotes > 0
                    ? Math.round((idea.offline_votes / totalVotes) * 100)
                    : 0}
                  %
                </Text>
              )}
              <Text m="0" fontSize="s" color="textSecondary">
                ({totalVotes})
              </Text>
            </Box>
          </Box>
          {renderProgressBar(idea.online_votes, idea.offline_votes, maxVotes)}
        </Box>
      </Box>
    );
  }

  // With clustering: show image, title, and demographic breakdown columns
  return (
    <Box display="flex" alignItems="flex-start" gap="16px" py="12px">
      {/* Image thumbnail */}
      <Box flexShrink={0}>
        {idea.image_url ? (
          <Image
            src={idea.image_url}
            alt={title}
            w="48px"
            h="48px"
            borderRadius="4px"
            objectFit="cover"
          />
        ) : (
          <Box
            w="48px"
            h="48px"
            borderRadius="4px"
            bgColor="#E5E7EB"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text m="0" fontSize="xs" color="textSecondary">
              📷
            </Text>
          </Box>
        )}
      </Box>

      {/* Title */}
      <Box style={{ width: '200px', flexShrink: 0 }}>
        <Text
          m="0"
          fontSize="s"
          color="textPrimary"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </Text>
      </Box>

      {/* Demographic columns */}
      {demographicKeys?.map((key, index) => {
        const breakdown = idea.demographic_breakdown?.[key];
        const online = breakdown?.online ?? 0;
        const offline = breakdown?.offline ?? 0;
        const total = online + offline;
        const maxDemographicVotes = maxVotes;
        const label = demographicLabels?.[index] ?? key;

        return (
          <Box key={key} style={{ width: '120px', flexShrink: 0 }}>
            <Text
              m="0"
              mb="4px"
              fontSize="xs"
              color="grey700"
              fontWeight="bold"
              textAlign="center"
            >
              {label}
            </Text>
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap="4px"
              mb="4px"
            >
              <Text
                m="0"
                fontSize="xs"
                fontWeight="bold"
                style={{ color: CHART_COLORS.darkBlue }}
              >
                {maxDemographicVotes > 0
                  ? Math.round((total / maxDemographicVotes) * 100)
                  : 0}
                %
              </Text>
              <Text m="0" fontSize="xs" color="textSecondary">
                ({total})
              </Text>
            </Box>
            {renderProgressBar(online, offline, maxDemographicVotes)}
          </Box>
        );
      })}
    </Box>
  );
};

export default VotingIdeaRow;
