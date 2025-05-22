import {
  ICommonGroundProgress,
  CommonGroundProgressStatement,
  CommonGroundReactionMode,
} from '../types';

// Sample statements for progress flow
const sampleStatements: CommonGroundProgressStatement[] = [
  {
    id: '1',
    author: 'Alice',
    publishedAt: '2h ago',
    body: {
      en: 'Investing in public transport will ease traffic, cut emissions, and make the city more accessible for everyone.',
    },
  },
  {
    id: '2',
    author: 'Bob',
    publishedAt: '5h ago',
    body: {
      en: "The city lacks enough parks and trees. Let's create more green spaces to support nature and mental health.",
    },
  },
  {
    id: '3',
    author: 'Charlie',
    publishedAt: '1d ago',
    body: {
      en: 'Affordable housing must be prioritized to ensure that everyone has a safe, decent, and stable place to live.',
    },
  },
  {
    id: '4',
    author: 'Diana',
    publishedAt: '3d ago',
    body: {
      en: 'Build more bike lanes so people can ride safely, reduce car use, and help make the city healthier and cleaner.',
    },
  },
  {
    id: '5',
    author: 'Eve',
    publishedAt: '4d ago',
    body: {
      en: "Let's invest more in community centers—they bring people together and offer vital services to all age groups.",
    },
  },
];

// Maintains stub state
let currentIndex = 0;

/**
 * Fetch stubbed progress data
 */
export const fetchCommonGroundProgressStub = async (
  _phaseId: string | undefined | null
): Promise<ICommonGroundProgress> => {
  const nextStatement = sampleStatements.at(currentIndex);
  return {
    data: {
      id: 'stub-phase-progress-1',
      type: 'common_ground_progress',
      attributes: {
        num_ideas: sampleStatements.length,
        num_reacted_ideas: currentIndex,
        nextIdea: nextStatement || null,
      },
      relationships: {
        next_idea: {
          data: nextStatement
            ? [{ id: nextStatement.id, type: 'statement' }]
            : [],
        },
      },
    },
  };
};

/**
 * React to a stubbed idea and advance
 */
export const reactToIdeaStub = async (
  _phaseId: string | undefined | null,
  _ideaId: string,
  _mode: CommonGroundReactionMode
): Promise<ICommonGroundProgress> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  currentIndex = Math.min(currentIndex + 1, sampleStatements.length);
  const nextStatement = sampleStatements.at(currentIndex);

  return {
    data: {
      id: 'stub-phase-progress-1',
      type: 'common_ground_progress',
      attributes: {
        num_ideas: sampleStatements.length,
        num_reacted_ideas: currentIndex,
        nextIdea: nextStatement || null,
      },
      relationships: {
        next_idea: {
          data: nextStatement
            ? [{ id: nextStatement.id, type: 'statement' }]
            : [],
        },
      },
    },
  };
};
