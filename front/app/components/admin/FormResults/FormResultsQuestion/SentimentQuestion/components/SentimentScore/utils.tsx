type GetAnswerGroupsProps = {
  questionAnswers: { percentage: number }[];
};

// getAnswerGroups:
// Group the answers (values of 1 - 5) into low, neutral, and high sentiment
export const getAnswerGroups = ({ questionAnswers }: GetAnswerGroupsProps) => {
  const lowSentiment =
    questionAnswers[0].percentage + questionAnswers[1].percentage; // Values 1 and 2
  const neutralSentiment = questionAnswers[2].percentage; // Value 3
  const highSentiment =
    questionAnswers[3].percentage + questionAnswers[4].percentage; // Values 4 and 5

  return [
    { answer: 'high', percentage: highSentiment },
    { answer: 'neutral', percentage: neutralSentiment },
    { answer: 'low', percentage: lowSentiment },
  ];
};
