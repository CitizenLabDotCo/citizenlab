export const USE_DUMMY_VOTING_INSIGHTS_DATA: boolean = true;

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
// Only uses online votes since offline votes cannot be attributed to demographics
const generateVotingDemographicBreakdown = (
  onlineVotes: number,
  type: 'gender' | 'age' | 'location'
): Record<string, { count: number; percentage: number }> => {
  const distributions = {
    gender: {
      male: 0.42,
      female: 0.45,
      unspecified: 0.13,
    },
    age: {
      '16-24': 0.22,
      '25-34': 0.28,
      '35-44': 0.22,
      '45-54': 0.15,
      '55-64': 0.08,
      '65+': 0.05,
    },
    location: {
      downtown: 0.52,
      suburbs: 0.36,
      rural: 0.12,
    },
  };

  const distribution = distributions[type];
  const result: Record<string, { count: number; percentage: number }> = {};

  for (const [key, pct] of Object.entries(distribution)) {
    const count = Math.round(onlineVotes * pct);
    result[key] = {
      count,
      percentage: Math.round(pct * 100 * 10) / 10, // e.g., 42.0, 45.0
    };
  }

  return result;
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
          'location'
        ),
      })),
    },
  },
};
