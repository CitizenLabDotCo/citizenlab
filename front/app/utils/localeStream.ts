import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { SupportedLocale } from 'typings';

export const LocaleSubject: BehaviorSubject<SupportedLocale> =
  new BehaviorSubject(null as any);
export const $locale = LocaleSubject.pipe(
  distinctUntilChanged(),
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  filter((locale) => locale !== null)
);

export function localeStream() {
  return {
    observable: $locale,
  };
}
