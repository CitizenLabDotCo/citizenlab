export type TranslationLanguage = {
  id: string;
  // The language's own name, e.g. "Français".
  name: string;
  // Every field it drives has the text it needs in this language.
  done: boolean;
};
