import { Multiloc, SupportedLocale } from 'typings';

export interface ITranslateMultilocParams {
  multiloc: Multiloc;
  source_locale: SupportedLocale;
  target_locales: SupportedLocale[];
  html: boolean;
}

export interface ITranslatedMultiloc {
  data: {
    type: 'multiloc_translation';
    attributes: {
      multiloc: Multiloc;
    };
  };
}
