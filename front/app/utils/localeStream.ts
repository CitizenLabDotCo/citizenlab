import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Locale } from 'typings';

export const LocaleSubject: BehaviorSubject<Locale> = new BehaviorSubject(
  null as any
);
export const $locale = LocaleSubject.pipe(
  distinctUntilChanged(),
  filter((locale) => locale !== null)
);

export function localeStream() {
  return {
    observable: $locale,
  };
}
