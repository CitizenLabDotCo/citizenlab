import { makeSelectSetting } from 'utils/tenant/selectors';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { Iterable, List } from 'immutable';
import { connect } from 'react-redux';
import { Multiloc } from 'typings';

const isImmutable = Iterable.isIterable;

const findTranslatedTextMutable = (value: Multiloc | undefined, userLocale: string, tenantLocales: List<string>): string => {
  let text = '';

  if (!value) {
    return text;
  }

  if (value[userLocale]) {
    text = value[userLocale];
  } else {
    tenantLocales.some((tenantLocale) => {
      if (tenantLocale && value[tenantLocale]) {
        text = value[tenantLocale];
        return true;
      }
      return false;
    });
  }
  return text;
};


function findTranslatedTextImmutable(value: Map<string, string>, userLocale: string, tenantLocales: List<string>): string {
  let text = '';

  if (!value) {
    return text;
  }

  if (value.get(userLocale)) {
    text = value.get(userLocale) || '';
  } else {
    tenantLocales.some((tenantLocale) => {
      if (tenantLocale && value.get(tenantLocale)) {
        text = value.get(tenantLocale) || '';
        return true;
      }
      return false;
    });
  }
  return text;
}

export const findTranslatedText = (value: Multiloc | Map<string, string> | undefined, userLocale: string, tenantLocales: List<string>) => {
  if (!isImmutable(value)) {
    return findTranslatedTextMutable(value as Multiloc, userLocale, tenantLocales);
  }
  return findTranslatedTextImmutable(value as Map<string, string>, userLocale, tenantLocales);
};


// Wrap a component with this function to make props.tFunc available. tFunc
// works as the T component, but as a function. This is useful for passing a
// translated value as a prop, e.g. as a placeholder
export function injectTFunc(component) {
  const mapStateToProps = (state) => {
    const selectLocale = makeSelectLocale();
    const selectTenantLocales = makeSelectSetting(['core', 'locales']);
    return {
      tFunc(value) {
        return findTranslatedText(value, selectLocale(state), selectTenantLocales(state));
      },
    };
  };

  return connect(mapStateToProps)(component);
}
