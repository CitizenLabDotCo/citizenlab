import { IPollQuestion } from 'services/pollQuestions';
export const mockQuestion = (
  id,
  titleEn,
  question_type: 'single_option' | 'multiple_options' = 'single_option',
  max_options: number | null = null,
  ordering = 0,
  options?,
  pcId?,
  pcType?
) =>
  ({
    id,
    type: 'poll_question',
    attributes: {
      question_type,
      max_options,
      ordering,
      title_multiloc: {
        en: titleEn,
      },
    },
    relationships: {
      options: {
        data: options,
      },
      participation_context: {
        data: {
          id: pcId,
          type: pcType,
        },
      },
    },
  } as IPollQuestion);
