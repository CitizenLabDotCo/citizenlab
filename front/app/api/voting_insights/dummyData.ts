export const USE_DUMMY_VOTING_INSIGHTS_DATA = true;

const baseVotingIdeas = [
  {
    id: 'voting-idea-1',
    title_multiloc: {
      en: 'Better bike infrastructure',
      fr: 'Meilleure infrastructure cyclable',
    },
    image_url:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
    online_votes: 80,
    offline_votes: 12,
  },
  {
    id: 'voting-idea-2',
    title_multiloc: {
      en: 'Enhance our weather protection capabilities',
      fr: 'Améliorer nos capacités de protection météorologique',
    },
    image_url:
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=100&h=100&fit=crop',
    online_votes: 85,
    offline_votes: 7,
  },
  {
    id: 'voting-idea-3',
    title_multiloc: {
      en: 'Improve roads and infrastructure',
      fr: 'Améliorer les routes et les infrastructures',
    },
    image_url:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=100&h=100&fit=crop',
    online_votes: 78,
    offline_votes: 14,
  },
  {
    id: 'voting-idea-4',
    title_multiloc: {
      en: 'Focus on the park density',
      fr: 'Se concentrer sur la densité des parcs',
    },
    image_url:
      'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=100&h=100&fit=crop',
    online_votes: 72,
    offline_votes: 20,
  },
  {
    id: 'voting-idea-5',
    title_multiloc: {
      en: 'Community centers expansion',
      fr: 'Expansion des centres communautaires',
    },
    image_url:
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=100&h=100&fit=crop',
    online_votes: 65,
    offline_votes: 18,
  },
];

// Helper to generate voting demographic breakdown
const generateVotingDemographicBreakdown = (
  onlineVotes: number,
  offlineVotes: number,
  type: 'gender' | 'age' | 'location'
): Record<string, { online: number; offline: number }> => {
  if (type === 'gender') {
    return {
      male: {
        online: Math.round(onlineVotes * 0.42),
        offline: Math.round(offlineVotes * 0.44),
      },
      female: {
        online: Math.round(onlineVotes * 0.45),
        offline: Math.round(offlineVotes * 0.43),
      },
      unspecified: {
        online: Math.round(onlineVotes * 0.13),
        offline: Math.round(offlineVotes * 0.13),
      },
    };
  }

  if (type === 'age') {
    return {
      '16-24': {
        online: Math.round(onlineVotes * 0.22),
        offline: Math.round(offlineVotes * 0.08),
      },
      '25-34': {
        online: Math.round(onlineVotes * 0.28),
        offline: Math.round(offlineVotes * 0.15),
      },
      '35-44': {
        online: Math.round(onlineVotes * 0.22),
        offline: Math.round(offlineVotes * 0.22),
      },
      '45-54': {
        online: Math.round(onlineVotes * 0.15),
        offline: Math.round(offlineVotes * 0.25),
      },
      '55-64': {
        online: Math.round(onlineVotes * 0.08),
        offline: Math.round(offlineVotes * 0.18),
      },
      '65+': {
        online: Math.round(onlineVotes * 0.05),
        offline: Math.round(offlineVotes * 0.12),
      },
    };
  }

  // type === 'location'
  return {
    downtown: {
      online: Math.round(onlineVotes * 0.52),
      offline: Math.round(offlineVotes * 0.35),
    },
    suburbs: {
      online: Math.round(onlineVotes * 0.36),
      offline: Math.round(offlineVotes * 0.45),
    },
    rural: {
      online: Math.round(onlineVotes * 0.12),
      offline: Math.round(offlineVotes * 0.2),
    },
  };
};

// Calculate total votes for percentage calculation
const totalVotingVotes = baseVotingIdeas.reduce(
  (sum, idea) => sum + idea.online_votes + idea.offline_votes,
  0
);

export const dummyVotingInsights = {
  data: {
    type: 'voting_phase_votes' as const,
    id: 'dummy-voting-phase-id',
    attributes: {
      total_votes: totalVotingVotes,
      ideas: baseVotingIdeas.map((idea) => ({
        ...idea,
        total_votes: idea.online_votes + idea.offline_votes,
        percentage: (
          ((idea.online_votes + idea.offline_votes) / totalVotingVotes) *
          100
        ).toFixed(0),
      })),
    },
  },
};

export const dummyVotingInsightsWithGender = {
  data: {
    type: 'voting_phase_votes' as const,
    id: 'dummy-voting-phase-id',
    attributes: {
      group_by: 'gender',
      custom_field_id: 'cf-uuid-gender',
      total_votes: totalVotingVotes,
      options: {
        male: {
          title_multiloc: { en: 'Male', fr: 'Homme', nl: 'Man' },
          ordering: 0,
        },
        female: {
          title_multiloc: { en: 'Female', fr: 'Femme', nl: 'Vrouw' },
          ordering: 1,
        },
        unspecified: {
          title_multiloc: {
            en: 'Unspecified',
            fr: 'Non spécifié',
            nl: 'Niet gespecificeerd',
          },
          ordering: 2,
        },
      },
      ideas: baseVotingIdeas.map((idea) => ({
        ...idea,
        total_votes: idea.online_votes + idea.offline_votes,
        percentage: (
          ((idea.online_votes + idea.offline_votes) / totalVotingVotes) *
          100
        ).toFixed(0),
        demographic_breakdown: generateVotingDemographicBreakdown(
          idea.online_votes,
          idea.offline_votes,
          'gender'
        ),
      })),
    },
  },
};

export const dummyVotingInsightsWithAge = {
  data: {
    type: 'voting_phase_votes' as const,
    id: 'dummy-voting-phase-id',
    attributes: {
      group_by: 'birthyear',
      custom_field_id: 'cf-uuid-birthyear',
      total_votes: totalVotingVotes,
      // No options for birthyear - frontend deduces age ranges
      ideas: baseVotingIdeas.map((idea) => ({
        ...idea,
        total_votes: idea.online_votes + idea.offline_votes,
        percentage: (
          ((idea.online_votes + idea.offline_votes) / totalVotingVotes) *
          100
        ).toFixed(0),
        demographic_breakdown: generateVotingDemographicBreakdown(
          idea.online_votes,
          idea.offline_votes,
          'age'
        ),
      })),
    },
  },
};

export const dummyVotingInsightsWithDomicile = {
  data: {
    type: 'voting_phase_votes' as const,
    id: 'dummy-voting-phase-id',
    attributes: {
      group_by: 'domicile',
      custom_field_id: 'cf-uuid-domicile',
      total_votes: totalVotingVotes,
      options: {
        downtown: {
          title_multiloc: {
            en: 'Downtown',
            fr: 'Centre-ville',
            nl: 'Centrum',
          },
          ordering: 0,
        },
        suburbs: {
          title_multiloc: { en: 'Suburbs', fr: 'Banlieue', nl: 'Voorsteden' },
          ordering: 1,
        },
        rural: {
          title_multiloc: {
            en: 'Rural areas',
            fr: 'Zones rurales',
            nl: 'Landelijke gebieden',
          },
          ordering: 2,
        },
      },
      ideas: baseVotingIdeas.map((idea) => ({
        ...idea,
        total_votes: idea.online_votes + idea.offline_votes,
        percentage: (
          ((idea.online_votes + idea.offline_votes) / totalVotingVotes) *
          100
        ).toFixed(0),
        demographic_breakdown: generateVotingDemographicBreakdown(
          idea.online_votes,
          idea.offline_votes,
          'location'
        ),
      })),
    },
  },
};
