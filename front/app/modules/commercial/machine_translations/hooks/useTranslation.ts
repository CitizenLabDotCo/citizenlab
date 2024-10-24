import useMachineTranslationByCommentId from 'modules/commercial/machine_translations/api/useMachineTranslationByCommentId';
import useMachineTranslationByIdeaId from 'modules/commercial/machine_translations/api/useMachineTranslationByIdeaId';
import { SupportedLocale } from 'typings';

import useFeatureFlag from 'hooks/useFeatureFlag';

interface Parameters {
  attributeName: 'body_multiloc' | 'title_multiloc';
  localeTo: SupportedLocale;
  id: string;
  context: 'idea' | 'comment';
  machineTranslationButtonClicked: boolean;
}

export default function useTranslation({
  attributeName,
  localeTo,
  id,
  context,
  machineTranslationButtonClicked,
}: Parameters) {
  const isMachineTranslationsEnabled = useFeatureFlag({
    name: 'machine_translations',
  });

  const { data: ideaTranslation } = useMachineTranslationByIdeaId({
    ideaId: id,
    machine_translation: {
      locale_to: localeTo,
      attribute_name: attributeName,
    },
    enabled:
      machineTranslationButtonClicked &&
      isMachineTranslationsEnabled &&
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      localeTo &&
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      localeTo &&
      context === 'comment',
  });

  if (context === 'idea') {
    return ideaTranslation?.data;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (context === 'comment') {
    return commentTranslation?.data;
  }

  return;
}
