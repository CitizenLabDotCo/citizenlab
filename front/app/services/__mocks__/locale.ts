import { Locale } from 'cl2-component-library/dist/utils/typings';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

export const getLocale = (): Locale => 'en-GB';

const LocaleSubject: BehaviorSubject<Locale> = new BehaviorSubject(null as any);
const $locale = LocaleSubject.pipe(
  distinctUntilChanged(),
  filter((locale) => locale !== null)
);

LocaleSubject.next('en');

export const localeStream = () => ({
  observable: $locale,
});
