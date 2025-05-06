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
    body: { en: 'We should invest in public transport.' },
  },
  {
    id: '2',
    author: 'Bob',
    publishedAt: '5h ago',
    body: { en: 'More green spaces are needed in the city.' },
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
  const nextStatement = sampleStatements[currentIndex] || null;
  return {
    data: {
      id: 'stub-phase-progress-1',
      type: 'phase-progress',
      attributes: {
        numIdeas: sampleStatements.length,
        numIdeasReacted: currentIndex,
        nextIdea: nextStatement,
      },
      relationships: {
        next_idea: {
          data: [{ id: nextStatement.id, type: 'statement' }],
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
  const nextStatement = sampleStatements[currentIndex];
  return {
    data: {
      id: 'stub-phase-progress-1',
      type: 'phase-progress',
      attributes: {
        numIdeas: sampleStatements.length,
        numIdeasReacted: currentIndex,
        nextIdea: nextStatement,
      },
      relationships: {
        next_idea: {
          data: [{ id: nextStatement.id, type: 'statement' }],
        },
      },
    },
  };
};
