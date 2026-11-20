import useMachineTranslationByCommentId from 'modules/commercial/machine_translations/api/useMachineTranslationByCommentId';
import useMachineTranslationByIdeaId from 'modules/commercial/machine_translations/api/useMachineTranslationByIdeaId';
import { Multiloc, SupportedLocale } from 'typings';

import useFeatureFlag from 'hooks/useFeatureFlag';

interface Parameters {
  attributeName: 'body_multiloc' | 'title_multiloc';
  localeTo: SupportedLocale;
  id: string;
  context: 'idea' | 'comment';
  machineTranslationButtonClicked: boolean;
  // The original multiloc. A translation is only fetched when it has no text for localeTo.
  multiloc: Multiloc | null | undefined;
}

export default function useTranslation({
  attributeName,
  localeTo,
  id,
  context,
  machineTranslationButtonClicked,
  multiloc,
}: Parameters) {
  const isMachineTranslationsEnabled = useFeatureFlag({
    name: 'machine_translations',
  });
  const needsTranslation = !!multiloc && !multiloc[localeTo];

  const { data: ideaTranslation } = useMachineTranslationByIdeaId({
    ideaId: id,
    machine_translation: {
      locale_to: localeTo,
      attribute_name: attributeName,
    },
    enabled:
      machineTranslationButtonClicked &&
      isMachineTranslationsEnabled &&
      needsTranslation &&
      context === 'idea',
  });
  const { data: commentTranslation } = useMachineTranslationByCommentId({
    commentId: id,
    machine_translation: {
      locale_to: localeTo,
      attribute_name: attributeName,
    },
    enabled:
      machineTranslationButtonClicked &&
      isMachineTranslationsEnabled &&
      needsTranslation &&
      context === 'comment',
  });

  if (!needsTranslation) return;

  if (context === 'idea') {
    return ideaTranslation?.data;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (context === 'comment') {
    return commentTranslation?.data;
  }

  return;
}
