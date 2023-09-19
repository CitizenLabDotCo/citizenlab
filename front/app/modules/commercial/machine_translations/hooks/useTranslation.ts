import { Locale } from 'typings';
import useMachineTranslationByInitiativeId from 'modules/commercial/machine_translations/api/useMachineTranslationByInitiativeId';
import useMachineTranslationByIdeaId from 'modules/commercial/machine_translations/api/useMachineTranslationByIdeaId';
import useMachineTranslationByCommentId from 'modules/commercial/machine_translations/api/useMachineTranslationByCommentId';

interface Parameters {
  attributeName: 'body_multiloc' | 'title_multiloc';
  localeTo?: Locale;
  id: string;
  context: 'idea' | 'initiative' | 'comment';
}

export default function useTranslation({
  attributeName,
  localeTo,
  id,
  context,
}: Parameters) {
  const { data: initiativeTranslation } = useMachineTranslationByInitiativeId({
    initiativeId: id,
    machine_translation: {
      locale_to: localeTo,
      attribute_name: attributeName,
    },
    enabled: context === 'initiative',
  });
  const { data: ideaTranslation } = useMachineTranslationByIdeaId({
    ideaId: id,
    machine_translation: {
      locale_to: localeTo,
      attribute_name: attributeName,
    },
    enabled: context === 'idea',
  });
  const { data: commentTranslation } = useMachineTranslationByCommentId({
    commentId: id,
    machine_translation: {
      locale_to: localeTo,
      attribute_name: attributeName,
    },
    enabled: context === 'comment',
  });

  if (context === 'idea') {
    return ideaTranslation?.data;
  } else if (context === 'initiative') {
    return initiativeTranslation?.data;
  } else if (context === 'comment') {
    return commentTranslation?.data;
  }

  return;
}
