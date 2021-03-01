import { useState, useEffect } from 'react';
import { Locale } from 'typings';
import {
  IMachineTranslationData,
  machineTranslationByIdeaIdStream,
  machineTranslationByCommentIdStream,
  machineTranslationByInitiativeIdStream,
} from 'services/machineTranslations';

interface Parameters {
  attributeName: 'body_multiloc' | 'title_multiloc';
  localeTo: Locale;
  id: string;
  context: 'idea' | 'initiative' | 'comment';
}

export default function useTranslation({
  attributeName,
  localeTo,
  id,
  context,
}: Parameters) {
  const [machineTranslation, setMachineTranslation] = useState<
    IMachineTranslationData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const getObservable = () => {
      const queryParameters = {
        machine_translation: {
          locale_to: localeTo,
          attribute_name: attributeName,
        },
      };

      switch (context) {
        case 'idea':
          return machineTranslationByIdeaIdStream(id, {
            queryParameters,
          }).observable;
        case 'initiative':
          return machineTranslationByInitiativeIdStream(id, {
            queryParameters,
          }).observable;
        case 'comment':
          return machineTranslationByCommentIdStream(id, {
            queryParameters,
          }).observable;
      }
    };

    const observable = getObservable();

    const subscription = observable.subscribe((machineTranslation) => {
      setMachineTranslation(machineTranslation.data);
    });

    return () => subscription.unsubscribe();
  }, [attributeName, localeTo, id, context]);

  return machineTranslation;
}
