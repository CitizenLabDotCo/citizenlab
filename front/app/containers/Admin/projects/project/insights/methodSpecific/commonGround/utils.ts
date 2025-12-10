import { SortOption } from 'api/common_ground_insights/types';

export interface VoteStats {
  up: number;
  down: number;
  neutral: number;
}

export interface PercentageStats {
  agreedPercent: number;
  disagreePercent: number;
  unsurePercent: number;
  total: number;
}

// Sort items based on selected sort option
export const sortItems = <T extends { votes: VoteStats; created_at: string }>(
  items: T[],
  sortBy: SortOption
): T[] => {
  return [...items].sort((a, b) => {
    const aTotal = a.votes.up + a.votes.down + a.votes.neutral;
    const bTotal = b.votes.up + b.votes.down + b.votes.neutral;

    switch (sortBy) {
      case 'most_agreed': {
        const aPercent = aTotal > 0 ? (a.votes.up / aTotal) * 100 : 0;
        const bPercent = bTotal > 0 ? (b.votes.up / bTotal) * 100 : 0;
        return bPercent - aPercent;
      }
      case 'most_disagreed': {
        const aPercent = aTotal > 0 ? (a.votes.down / aTotal) * 100 : 0;
        const bPercent = bTotal > 0 ? (b.votes.down / bTotal) * 100 : 0;
        return bPercent - aPercent;
      }
      case 'most_controversial': {
        const aAgreePercent = aTotal > 0 ? (a.votes.up / aTotal) * 100 : 0;
        const bAgreePercent = bTotal > 0 ? (b.votes.up / bTotal) * 100 : 0;
        const aControversy = Math.abs(50 - aAgreePercent);
        const bControversy = Math.abs(50 - bAgreePercent);
        return aControversy - bControversy;
      }
      case 'newest': {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      default:
        return 0;
    }
  });
};

// Calculate percentages for a vote object
export const calculatePercentages = (votes: VoteStats): PercentageStats => {
  const total = votes.up + votes.down + votes.neutral;
  if (total === 0) {
    return {
      agreedPercent: 0,
      disagreePercent: 0,
      unsurePercent: 0,
      total: 0,
    };
  }

  return {
    agreedPercent: Math.round((votes.up / total) * 100),
    disagreePercent: Math.round((votes.down / total) * 100),
    unsurePercent: Math.round((votes.neutral / total) * 100),
    total,
  };
};

// Get demographic keys in order
export const getDemographicKeys = (
  demographicField: any,
  clusterBy: string
): string[] => {
  if (!demographicField) return [];

  if (clusterBy === 'birthyear') {
    return ['16-24', '25-34', '35-44', '45-54', '55-64', '65+'];
  }

  if (!demographicField.options) return [];

  return Object.entries(demographicField.options)
    .sort(([, a]: any, [, b]: any) => a.ordering - b.ordering)
    .map(([key]) => key);
};

// Get demographic label
export const getDemographicLabel = (
  key: string,
  clusterBy: string,
  demographicField: any,
  locale: string
): string => {
  if (clusterBy === 'birthyear') {
    return key;
  }

  if (demographicField?.options?.[key]) {
    const option = demographicField.options[key];
    return option.title_multiloc[locale] || option.title_multiloc.en || key;
  }

  return key;
};
