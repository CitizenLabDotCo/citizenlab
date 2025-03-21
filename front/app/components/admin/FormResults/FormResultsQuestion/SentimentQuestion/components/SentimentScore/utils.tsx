type GetAnswerGroupsProps = {
  questionAnswers: { percentage: number }[];
};

// getAnswerGroups:
// Group the answers (values of 1 - 5) into low, neutral, and high sentiment
export const getAnswerGroups = ({ questionAnswers }: GetAnswerGroupsProps) => {
  if (!questionAnswers.length) return null;

  const [low1, low2, neutral, high1, high2] = questionAnswers.map(
    (answer) => answer.percentage
  );

  return [
    { answer: 'high', percentage: high1 + high2 },
    { answer: 'neutral', percentage: neutral },
    { answer: 'low', percentage: low1 + low2 },
  ];
};
