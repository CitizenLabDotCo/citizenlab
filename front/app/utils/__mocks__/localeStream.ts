import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { SupportedLocale } from 'typings';

const LocaleSubject: BehaviorSubject<SupportedLocale> = new BehaviorSubject(
  null as any
);
const $locale = LocaleSubject.pipe(
  distinctUntilChanged(),
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  filter((locale) => locale !== null)
);

LocaleSubject.next('en');

export const localeStream = () => ({
  observable: $locale,
});
