export const USE_DUMMY_COMMON_GROUND_INSIGHTS_DATA = true;

const baseStatements = [
  {
    id: 'idea-1',
    title_multiloc: {
      en: "Toronto's public transit system requires substantial investment to meet growing demand.",
      fr: 'Le système de transport en commun de Toronto nécessite un investissement substantiel.',
    },
    votes: { up: 680, down: 120, neutral: 70 },
    created_at: '2025-10-15T10:30:00Z',
  },
  {
    id: 'idea-2',
    title_multiloc: {
      en: 'New York City must improve its infrastructure to handle climate change impacts effectively.',
      fr: 'New York doit améliorer ses infrastructures pour gérer efficacement les impacts du changement climatique.',
    },
    votes: { up: 620, down: 145, neutral: 85 },
    created_at: '2025-10-14T14:20:00Z',
  },
  {
    id: 'idea-3',
    title_multiloc: {
      en: 'Paris is facing a crisis in affordable housing; immediate policies are needed.',
      fr: 'Paris est confronté à une crise du logement abordable ; des politiques immédiates sont nécessaires.',
    },
    votes: { up: 580, down: 160, neutral: 95 },
    created_at: '2025-10-13T09:15:00Z',
  },
  {
    id: 'idea-4',
    title_multiloc: {
      en: 'The city should ban all personal vehicle use in the downtown core.',
      fr: 'La ville devrait interdire toute utilisation de véhicules personnels dans le centre-ville.',
    },
    votes: { up: 420, down: 410, neutral: 80 },
    created_at: '2025-10-12T16:45:00Z',
  },
  {
    id: 'idea-5',
    title_multiloc: {
      en: 'Expanding bike lanes throughout the city will improve safety and reduce emissions.',
      fr: "L'expansion des pistes cyclables dans toute la ville améliorera la sécurité et réduira les émissions.",
    },
    votes: { up: 550, down: 180, neutral: 70 },
    created_at: '2025-10-11T11:20:00Z',
  },
  {
    id: 'idea-6',
    title_multiloc: {
      en: 'Public parks need better maintenance and more funding for green spaces.',
      fr: "Les parcs publics ont besoin d'un meilleur entretien et de plus de financement pour les espaces verts.",
    },
    votes: { up: 710, down: 80, neutral: 60 },
    created_at: '2025-10-10T08:30:00Z',
  },
  {
    id: 'idea-7',
    title_multiloc: {
      en: 'Downtown parking fees should be increased to discourage car use.',
      fr: "Les frais de stationnement au centre-ville devraient être augmentés pour décourager l'utilisation de la voiture.",
    },
    votes: { up: 380, down: 440, neutral: 90 },
    created_at: '2025-10-09T15:45:00Z',
  },
  {
    id: 'idea-8',
    title_multiloc: {
      en: 'Schools require more resources for mental health support services.',
      fr: 'Les écoles ont besoin de plus de ressources pour les services de soutien en santé mentale.',
    },
    votes: { up: 820, down: 45, neutral: 35 },
    created_at: '2025-10-08T12:10:00Z',
  },
  {
    id: 'idea-9',
    title_multiloc: {
      en: 'The city needs stricter regulations on short-term rental properties.',
      fr: 'La ville a besoin de réglementations plus strictes sur les locations de courte durée.',
    },
    votes: { up: 490, down: 350, neutral: 110 },
    created_at: '2025-10-07T09:25:00Z',
  },
  {
    id: 'idea-10',
    title_multiloc: {
      en: 'Community centers should offer more programs for seniors.',
      fr: 'Les centres communautaires devraient offrir plus de programmes pour les personnes âgées.',
    },
    votes: { up: 650, down: 90, neutral: 60 },
    created_at: '2025-10-06T14:50:00Z',
  },
  {
    id: 'idea-11',
    title_multiloc: {
      en: 'Property taxes are too high and should be reduced.',
      fr: 'Les taxes foncières sont trop élevées et devraient être réduites.',
    },
    votes: { up: 410, down: 420, neutral: 120 },
    created_at: '2025-10-05T10:15:00Z',
  },
  {
    id: 'idea-12',
    title_multiloc: {
      en: 'Public libraries need extended hours and more digital resources.',
      fr: "Les bibliothèques publiques ont besoin d'heures prolongées et de plus de ressources numériques.",
    },
    votes: { up: 590, down: 140, neutral: 70 },
    created_at: '2025-10-04T16:30:00Z',
  },
  {
    id: 'idea-13',
    title_multiloc: {
      en: 'Sidewalks and pedestrian infrastructure need urgent repairs.',
      fr: "Les trottoirs et l'infrastructure piétonne nécessitent des réparations urgentes.",
    },
    votes: { up: 730, down: 70, neutral: 50 },
    created_at: '2025-10-03T11:40:00Z',
  },
  {
    id: 'idea-14',
    title_multiloc: {
      en: 'The city should implement a congestion charge for vehicles entering downtown.',
      fr: 'La ville devrait mettre en place un péage urbain pour les véhicules entrant au centre-ville.',
    },
    votes: { up: 360, down: 480, neutral: 110 },
    created_at: '2025-10-02T13:20:00Z',
  },
  {
    id: 'idea-15',
    title_multiloc: {
      en: 'Local businesses need more support and tax incentives to thrive.',
      fr: "Les entreprises locales ont besoin de plus de soutien et d'incitations fiscales pour prospérer.",
    },
    votes: { up: 670, down: 110, neutral: 70 },
    created_at: '2025-10-01T09:50:00Z',
  },
  {
    id: 'idea-16',
    title_multiloc: {
      en: 'Public Wi-Fi should be available in all parks and public spaces.',
      fr: 'Le Wi-Fi public devrait être disponible dans tous les parcs et espaces publics.',
    },
    votes: { up: 520, down: 180, neutral: 100 },
    created_at: '2025-09-30T15:10:00Z',
  },
  {
    id: 'idea-17',
    title_multiloc: {
      en: 'Recycling programs need better education and enforcement.',
      fr: 'Les programmes de recyclage nécessitent une meilleure éducation et application.',
    },
    votes: { up: 760, down: 60, neutral: 40 },
    created_at: '2025-09-29T10:30:00Z',
  },
  {
    id: 'idea-18',
    title_multiloc: {
      en: 'Nighttime noise regulations should be more strictly enforced.',
      fr: 'Les réglementations sur le bruit nocturne devraient être appliquées plus strictement.',
    },
    votes: { up: 440, down: 390, neutral: 120 },
    created_at: '2025-09-28T14:45:00Z',
  },
  {
    id: 'idea-19',
    title_multiloc: {
      en: 'Youth recreation programs require more funding and facilities.',
      fr: "Les programmes de loisirs pour les jeunes nécessitent plus de financement et d'installations.",
    },
    votes: { up: 690, down: 100, neutral: 60 },
    created_at: '2025-09-27T11:15:00Z',
  },
  {
    id: 'idea-20',
    title_multiloc: {
      en: 'The city should invest in more electric vehicle charging stations.',
      fr: 'La ville devrait investir dans plus de bornes de recharge pour véhicules électriques.',
    },
    votes: { up: 610, down: 150, neutral: 90 },
    created_at: '2025-09-26T16:20:00Z',
  },
];

// Helper to calculate demographic breakdown that's proportional to overall votes
const generateDemographicBreakdown = (
  votes: { up: number; down: number; neutral: number },
  type: 'gender' | 'age' | 'location'
): Record<string, { up: number; down: number; neutral: number }> => {
  if (type === 'gender') {
    // Distribute votes across gender categories (roughly: 42% male, 45% female, 8% non-binary, 5% other)
    return {
      male: {
        up: Math.round(votes.up * 0.4), // Slightly less agreement than average
        down: Math.round(votes.down * 0.44),
        neutral: Math.round(votes.neutral * 0.42),
      },
      female: {
        up: Math.round(votes.up * 0.47), // Slightly more agreement than average
        down: Math.round(votes.down * 0.43),
        neutral: Math.round(votes.neutral * 0.45),
      },
      non_binary: {
        up: Math.round(votes.up * 0.08),
        down: Math.round(votes.down * 0.08),
        neutral: Math.round(votes.neutral * 0.08),
      },
      other: {
        up: Math.round(votes.up * 0.05),
        down: Math.round(votes.down * 0.05),
        neutral: Math.round(votes.neutral * 0.05),
      },
    };
  }

  if (type === 'age') {
    // Younger people more progressive, older more conservative
    return {
      '16-24': {
        up: Math.round(votes.up * 0.22),
        down: Math.round(votes.down * 0.12),
        neutral: Math.round(votes.neutral * 0.18),
      },
      '25-34': {
        up: Math.round(votes.up * 0.28),
        down: Math.round(votes.down * 0.2),
        neutral: Math.round(votes.neutral * 0.24),
      },
      '35-44': {
        up: Math.round(votes.up * 0.22),
        down: Math.round(votes.down * 0.26),
        neutral: Math.round(votes.neutral * 0.24),
      },
      '45-54': {
        up: Math.round(votes.up * 0.15),
        down: Math.round(votes.down * 0.22),
        neutral: Math.round(votes.neutral * 0.18),
      },
      '55-64': {
        up: Math.round(votes.up * 0.08),
        down: Math.round(votes.down * 0.12),
        neutral: Math.round(votes.neutral * 0.1),
      },
      '65+': {
        up: Math.round(votes.up * 0.05),
        down: Math.round(votes.down * 0.08),
        neutral: Math.round(votes.neutral * 0.06),
      },
    };
  }

  // type === 'location'
  // Urban areas more progressive
  return {
    downtown: {
      up: Math.round(votes.up * 0.52),
      down: Math.round(votes.down * 0.38),
      neutral: Math.round(votes.neutral * 0.45),
    },
    suburbs: {
      up: Math.round(votes.up * 0.36),
      down: Math.round(votes.down * 0.48),
      neutral: Math.round(votes.neutral * 0.42),
    },
    rural: {
      up: Math.round(votes.up * 0.12),
      down: Math.round(votes.down * 0.14),
      neutral: Math.round(votes.neutral * 0.13),
    },
  };
};

export const dummyCommonGroundInsights = {
  data: {
    type: 'common_ground_results' as const,
    id: 'dummy-phase-id',
    attributes: {
      stats: {
        num_participants: 2750,
        num_ideas: 719,
        votes: {
          up: 12840,
          down: 5394,
          neutral: 3253,
        },
      },
      total_count: 20,
      items: baseStatements,
    },
  },
};

export const dummyCommonGroundInsightsWithGender = {
  data: {
    type: 'common_ground_results' as const,
    id: 'dummy-phase-id',
    attributes: {
      stats: {
        num_participants: 2750,
        num_ideas: 719,
        votes: {
          up: 12840,
          down: 5394,
          neutral: 3253,
        },
      },
      total_count: 20,
      demographic_field: {
        field_id: 'cf-uuid-gender',
        field_key: 'gender',
        field_code: 'gender',
        options: {
          male: {
            title_multiloc: {
              en: 'Male',
              fr: 'Homme',
              nl: 'Man',
            },
            ordering: 0,
          },
          female: {
            title_multiloc: {
              en: 'Female',
              fr: 'Femme',
              nl: 'Vrouw',
            },
            ordering: 1,
          },
          non_binary: {
            title_multiloc: {
              en: 'Non-binary',
              fr: 'Non-binaire',
              nl: 'Non-binair',
            },
            ordering: 2,
          },
          other: {
            title_multiloc: {
              en: 'Other',
              fr: 'Autre',
              nl: 'Andere',
            },
            ordering: 3,
          },
        },
      },
      items: baseStatements.map((statement) => ({
        ...statement,
        demographic_breakdown: generateDemographicBreakdown(
          statement.votes,
          'gender'
        ),
      })),
    },
  },
};

export const dummyCommonGroundInsightsWithAge = {
  data: {
    type: 'common_ground_results' as const,
    id: 'dummy-phase-id',
    attributes: {
      stats: {
        num_participants: 2750,
        num_ideas: 719,
        votes: {
          up: 12840,
          down: 5394,
          neutral: 3253,
        },
      },
      total_count: 20,
      demographic_field: {
        field_id: 'cf-uuid-birthyear',
        field_key: 'birthyear',
        field_code: 'birthyear',
        // No options for birthyear - frontend will deduce age ranges
      },
      items: baseStatements.map((statement) => ({
        ...statement,
        demographic_breakdown: generateDemographicBreakdown(
          statement.votes,
          'age'
        ),
      })),
    },
  },
};

export const dummyCommonGroundInsightsWithDomicile = {
  data: {
    type: 'common_ground_results' as const,
    id: 'dummy-phase-id',
    attributes: {
      stats: {
        num_participants: 2750,
        num_ideas: 719,
        votes: {
          up: 12840,
          down: 5394,
          neutral: 3253,
        },
      },
      total_count: 20,
      demographic_field: {
        field_id: 'cf-uuid-domicile',
        field_key: 'domicile',
        field_code: 'domicile',
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
            title_multiloc: {
              en: 'Suburbs',
              fr: 'Banlieue',
              nl: 'Voorsteden',
            },
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
      },
      items: baseStatements.map((statement) => ({
        ...statement,
        demographic_breakdown: generateDemographicBreakdown(
          statement.votes,
          'location'
        ),
      })),
    },
  },
};
