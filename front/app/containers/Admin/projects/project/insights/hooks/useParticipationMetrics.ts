import { useMemo } from 'react';

import { IPhaseData } from 'api/phases/types';

export interface ParticipationMetrics {
  uniqueParticipants: number;
  totalContributions: number;
  engagementRate: number;
  totalVisitors: number;
  contributionsByType?: Record<string, number>;
}

export const useParticipationMetrics = (
  phase: IPhaseData
): ParticipationMetrics => {
  return useMemo<ParticipationMetrics>(() => {
    const participationMethod = phase.attributes.participation_method;

    const baseMetrics: ParticipationMetrics = {
      uniqueParticipants: Math.floor(Math.random() * 500) + 100,
      totalVisitors: Math.floor(Math.random() * 1000) + 500,
      totalContributions: 0,
      engagementRate: 0,
    };

    baseMetrics.engagementRate =
      (baseMetrics.uniqueParticipants / baseMetrics.totalVisitors) * 100;

    switch (participationMethod) {
      case 'ideation':
      case 'proposals': {
        const totalContributions: number = Math.floor(Math.random() * 300) + 50;
        return {
          ...baseMetrics,
          totalContributions,
          contributionsByType: {
            ideas: Math.floor(Math.random() * 150) + 30,
            comments: Math.floor(Math.random() * 100) + 20,
            likes: Math.floor(Math.random() * 200) + 50,
            dislikes: Math.floor(Math.random() * 50) + 10,
          },
        };
      }

      case 'native_survey':
      case 'survey': {
        const totalContributions: number =
          Math.floor(Math.random() * 400) + 100;
        return {
          ...baseMetrics,
          totalContributions,
          contributionsByType: {
            responses: totalContributions,
            completed: Math.floor(totalContributions * 0.8),
            partial: Math.floor(totalContributions * 0.2),
          },
        };
      }

      case 'voting': {
        const totalContributions: number =
          Math.floor(Math.random() * 600) + 200;
        return {
          ...baseMetrics,
          totalContributions,
          contributionsByType: {
            votes: totalContributions,
            online: Math.floor(totalContributions * 0.7),
            offline: Math.floor(totalContributions * 0.3),
          },
        };
      }

      case 'poll': {
        const totalContributions: number =
          Math.floor(Math.random() * 300) + 100;
        return {
          ...baseMetrics,
          totalContributions,
          contributionsByType: {
            responses: totalContributions,
          },
        };
      }

      case 'volunteering': {
        const totalContributions: number = Math.floor(Math.random() * 100) + 20;
        return {
          ...baseMetrics,
          totalContributions,
          contributionsByType: {
            signups: totalContributions,
          },
        };
      }

      default:
        return baseMetrics;
    }
  }, [phase]);
};
