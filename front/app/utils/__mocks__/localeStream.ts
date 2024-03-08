import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Locale } from 'typings';

const LocaleSubject: BehaviorSubject<Locale> = new BehaviorSubject(null as any);
const $locale = LocaleSubject.pipe(
  distinctUntilChanged(),
  filter((locale) => locale !== null)
);

LocaleSubject.next('en');

export const localeStream = () => ({
  observable: $locale,
});
