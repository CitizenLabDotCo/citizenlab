import { IPollQuestion } from 'services/pollQuestions';

export const mockQuestion = (
  id: string,
  titleEn: string,
  question_type: 'single_option' | 'multiple_options' = 'single_option',
  max_options: number | null = null
) => {
  const question: IPollQuestion = {
    id,
    type: 'question' as const,
    attributes: {
      question_type,
      max_options,
      ordering: Math.floor(Math.random() * 1000),
      title_multiloc: {
        en: titleEn,
      },
    },
    relationships: {
      options: {
        data: [{ type: 'option' as const, id: 'optionId' }],
      },
      participation_context: {
        data: {
          id: 'pcId',
          type: 'project',
        },
      },
    },
  };

  return question;
};
