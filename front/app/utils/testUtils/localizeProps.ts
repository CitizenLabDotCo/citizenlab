// i18n
// Typing
import { Multiloc } from 'typings';
import { getLocalized } from 'utils/i18n';
import { InjectedLocalized } from 'utils/localize';

/* A mock object to replace injectLocalize function : pass this to the child of injectLocalize as a prop
 ** ex :
 ** actual : injectLocalize(TestedComponent) =>
 ** in tests : <TestedComponent {...localizeProps}>
 */
export const localizeProps = {
  localize: (multiloc: Multiloc) => {
    return getLocalized(multiloc, 'en', ['en', 'fr-BE']);
  },
  locale: 'en',
  tenantLocales: ['en', 'fr-BE'],
} as InjectedLocalized;
